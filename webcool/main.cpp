#include "stdafx.h"
#include "http_servlet.h"
#include "action/actions.h"
#include "action/action_util.h"
#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <csignal>
#include <atomic>
#include <mutex>
#ifdef _WIN32
#include "platform_compat.h"
#include "resource.h"
#include <commdlg.h>
#include <shlobj.h>
#else
#include <fcntl.h>
#include <unistd.h>
#endif
#include <vector>
#include <map>

// ────────────────────────────────────────────────────────────────
// 空 session：文件上传服务不需要会话，实现抽象接口即可
// ────────────────────────────────────────────────────────────────
class null_session : public acl::session {
public:
	null_session() : acl::session(0) {}
	~null_session() {}

	bool remove() override { return true; }
	bool get_attrs(std::map<acl::string, acl::session_string>&) override { return true; }
	bool set_attrs(const std::map<acl::string, acl::session_string>&) override { return true; }
	bool set_timeout(time_t) override { return true; }
};

// ────────────────────────────────────────────────────────────────
// 全局配置
// ────────────────────────────────────────────────────────────────
static size_t                g_stack_size    = 128000;
static int                   g_rw_timeout    = 0;
#ifdef _WIN32
static acl::fiber_event_t    g_event_type    = acl::FIBER_EVENT_T_POLL;
#else
static acl::fiber_event_t    g_event_type    = acl::FIBER_EVENT_T_KERNEL;
#endif

static char                  g_upload_dir[256] = "./uploads";
static char                  g_html_home[512] = "./html";
static char                  g_sqlite_lib[512] = "";
static char                  g_ffmpeg_path[512] = "";
static const char*           g_webcool_version = "1.0.7";
static std::atomic<bool>     g_service_stopping(false);

static void apply_default_upload_dir(bool upload_dir_specified) {
#ifdef MACOSX
	if (!upload_dir_specified) {
		const char* home = getenv("HOME");
		if (home != NULL && *home != '\0') {
			snprintf(g_upload_dir, sizeof(g_upload_dir),
				"%s/Library/Application Support/webcool/data", home);
		} else {
			snprintf(g_upload_dir, sizeof(g_upload_dir), "%s", "./uploads");
		}
	}
#else
	(void) upload_dir_specified;
#endif
}

static const char* event_type_name(acl::fiber_event_t event_type) {
	switch (event_type) {
	case acl::FIBER_EVENT_T_POLL:
		return "poll";
	case acl::FIBER_EVENT_T_SELECT:
		return "select";
	default:
		return "kernel";
	}
}

static void print_detail_info(const acl::string& addr,
	int nthreads, bool reuse_port, bool daemon_mode)
{
	std::string sqlite_path;
	std::string ffmpeg_path;
	if (g_sqlite_lib[0] != '\0') {
		sqlite_path = g_sqlite_lib;
	} else {
		sqlite_path = action::choose_sqlite_lib_path();
	}

	if (g_ffmpeg_path[0] != '\0') {
		ffmpeg_path = g_ffmpeg_path;
	} else {
		ffmpeg_path = action::choose_ffmpeg_path();
	}

	printf("webcool 详细信息\n");
	printf("  版本号: %s\n", g_webcool_version);
	printf("  构建时间: %s %s\n", __DATE__, __TIME__);
	printf("  平台: %s\n",
#ifdef _WIN32
		"Windows"
#elif defined(MACOSX)
		"macOS"
#else
		"Linux/Unix"
#endif
	);
	printf("  监听地址: %s\n", addr.c_str());
	printf("  存储路径: %s\n", g_upload_dir);
	printf("  sqlite.so路径: %s\n", sqlite_path.empty() ? "(未找到)" : sqlite_path.c_str());
	printf("  ffmpeg路径: %s\n", ffmpeg_path.empty() ? "(未找到)" : ffmpeg_path.c_str());
	printf("  工作线程: %d\n", nthreads);
	printf("  后台模式: %s\n", daemon_mode ? "on" : "off");
	printf("  REUSEPORT: %s\n", reuse_port ? "on" : "off");
	printf("  读写超时(秒): %d\n", g_rw_timeout);
	printf("  协程栈大小: %zu\n", g_stack_size);
	printf("  事件引擎: %s\n", event_type_name(g_event_type));
}

static bool daemonize_process() {
#ifdef _WIN32
	return false;
#else
	pid_t pid = fork();
	if (pid < 0) {
		return false;
	}
	if (pid > 0) {
		exit(0);
	}

	if (setsid() < 0) {
		return false;
	}

	signal(SIGHUP, SIG_IGN);

	pid = fork();
	if (pid < 0) {
		return false;
	}
	if (pid > 0) {
		exit(0);
	}

	int fd = open("/dev/null", O_RDWR);
	if (fd < 0) {
		return false;
	}

	if (dup2(fd, STDIN_FILENO) < 0 ||
		dup2(fd, STDOUT_FILENO) < 0 ||
		dup2(fd, STDERR_FILENO) < 0) {
		if (fd > STDERR_FILENO) {
			close(fd);
		}
		return false;
	}

	if (fd > STDERR_FILENO) {
		close(fd);
	}

	return true;
#endif
}

// ────────────────────────────────────────────────────────────────
// 线程：每个线程独立运行一个协程调度器
// ────────────────────────────────────────────────────────────────
class server_thread : public acl::thread {
public:
	// 共享监听模式：传入已 open 的 server_socket
	explicit server_thread(acl::server_socket& server)
	: server_inner_(nullptr), server_(&server), opened_(true) {}

	// SO_REUSEPORT 模式：每线程独立监听
	explicit server_thread(const char* addr) {
		server_inner_ = new acl::server_socket(acl::OPEN_FLAG_REUSEPORT, 256);
		if (!server_inner_->open(addr)) {
			fprintf(stderr, "listen %s error: %s\n",
				addr, acl::last_serror());
			opened_ = false;
		} else {
			opened_ = true;
		}
		server_ = server_inner_;
	}

	~server_thread() { delete server_inner_; }

	bool opened() const { return opened_; }

	void close_listener() {
		if (server_ != nullptr) {
			server_->close();
		}
	}

private:
	acl::server_socket* server_inner_;
	acl::server_socket* server_;
	bool opened_;

	// 每个连接的处理逻辑，运行在独立协程中
	void handle_conn(acl::socket_stream* conn) {
		conn->set_rw_timeout(g_rw_timeout);

		null_session session;
		http_servlet servlet(conn, &session, g_upload_dir);

		while (servlet.doRun()) {}

		logger_debug(DEBUG_CONN, 1, "connection closed: fd=%d, fiber-%d, %s",
			conn->sock_handle(), acl::fiber::self(), acl::last_serror());
		delete conn;
	}

	void* run() override {
		// Accept 协程：accept 到连接后，为每个连接启动一个协程
		go[this] {
			while (!g_service_stopping.load()) {
				bool timed = false;
				acl::socket_stream* conn = server_->accept(500, &timed);
				if (conn == nullptr) {
					if (timed && !g_service_stopping.load()) {
						continue;
					}
					if (!g_service_stopping.load()) {
						fprintf(stderr, "accept error: %s\n",
							acl::last_serror());
					}
					break;
				}
				// C++11 lambda 协程：捕获连接指针，处理完后自动释放
				go_stack(g_stack_size)[this, conn] {
					handle_conn(conn);
				};
			}
			acl::fiber::schedule_stop();
		};

		// 启动本线程的协程调度器（阻塞直到无协程运行）
		acl::fiber::schedule_with(g_event_type);
		return nullptr;
	}
};

struct webcool_service_options {
	acl::string addr;
	int nthreads;
	bool reuse_port;
};

class webcool_service_controller {
public:
	webcool_service_controller(const webcool_service_options& options)
	: options_(options), server_(nullptr), running_(false) {}

	~webcool_service_controller() {
		stop();
	}

	bool start(std::string& err) {
		std::lock_guard<std::mutex> guard(mutex_);
		err.clear();
		if (running_) {
			return true;
		}
		g_service_stopping.store(false);

		if (!prepare_runtime(err)) {
			return false;
		}

		if (!options_.reuse_port) {
			server_ = new acl::server_socket;
			if (!server_->open(options_.addr)) {
				err = acl::last_serror();
				delete server_;
				server_ = nullptr;
				return false;
			}
			printf("监听 %s 成功\n", options_.addr.c_str());
		}

		for (int i = 0; i < options_.nthreads; i++) {
			server_thread* thr = options_.reuse_port
				? new server_thread(options_.addr.c_str())
				: new server_thread(*server_);
			if (!thr->opened()) {
				err = acl::last_serror();
				delete thr;
				stop_locked();
				return false;
			}
			thr->set_detachable(false);
			thr->start();
			threads_.push_back(thr);
		}

		running_ = true;
		return true;
	}

	void stop() {
		std::lock_guard<std::mutex> guard(mutex_);
		stop_locked();
	}

	void wait() {
		std::vector<server_thread*> threads;
		{
			std::lock_guard<std::mutex> guard(mutex_);
			threads.swap(threads_);
		}
		for (size_t i = 0; i < threads.size(); ++i) {
			threads[i]->wait();
			delete threads[i];
		}
		{
			std::lock_guard<std::mutex> guard(mutex_);
			if (server_ != nullptr) {
				delete server_;
				server_ = nullptr;
			}
			running_ = false;
			g_service_stopping.store(false);
		}
	}

	bool running() const {
		std::lock_guard<std::mutex> guard(mutex_);
		return running_;
	}

	void configure(const webcool_service_options& options) {
		std::lock_guard<std::mutex> guard(mutex_);
		if (!running_) {
			options_ = options;
		}
	}

	const webcool_service_options& options() const {
		return options_;
	}

private:
	bool prepare_runtime(std::string& err) {
		static std::mutex init_mutex;
		static bool acl_inited = false;
		{
			std::lock_guard<std::mutex> guard(init_mutex);
			if (!acl_inited) {
				acl::acl_cpp_init();
				acl::log::stdout_open(true);
				acl_inited = true;
			}
		}

		if (!action::make_dir_recursive(g_upload_dir)) {
			err = "创建数据目录失败: ";
			err += g_upload_dir;
			return false;
		}

		if (g_sqlite_lib[0] != '\0') {
			action::runtime_sqlite_lib_set(g_sqlite_lib);
		}
		if (g_html_home[0] != '\0') {
			action::IndexAction::set_static_home_path(g_html_home);
		}
		if (g_ffmpeg_path[0] != '\0') {
			action::runtime_ffmpeg_path_set(g_ffmpeg_path);
		}

		std::string db_err;
		if (!action::init_video_resume_db(g_upload_dir, db_err)) {
			err = "初始化续播数据库失败: " + db_err;
			return false;
		}
		if (!action::init_category_folder_db(g_upload_dir, db_err)) {
			err = "初始化分类文件夹数据库失败: " + db_err;
			return false;
		}
		if (!action::init_recycle_bin_db(g_upload_dir, db_err)) {
			err = "初始化回收站数据库失败: " + db_err;
			return false;
		}

		printf("HTTP 文件上传服务器\n");
		printf("  监听地址: %s\n", options_.addr.c_str());
		printf("  上传目录: %s\n", g_upload_dir);
		printf("  工作线程: %d\n", options_.nthreads);
		return true;
	}

	void stop_locked() {
		if (!running_ && threads_.empty() && server_ == nullptr) {
			return;
		}
		g_service_stopping.store(true);
		if (server_ != nullptr) {
			server_->close();
		}
		for (size_t i = 0; i < threads_.size(); ++i) {
			threads_[i]->close_listener();
		}
		for (size_t i = 0; i < threads_.size(); ++i) {
			threads_[i]->wait();
			delete threads_[i];
		}
		threads_.clear();
		if (server_ != nullptr) {
			delete server_;
			server_ = nullptr;
		}
		running_ = false;
		g_service_stopping.store(false);
	}

	webcool_service_options options_;
	acl::server_socket* server_;
	std::vector<server_thread*> threads_;
	mutable std::mutex mutex_;
	bool running_;
};

// ────────────────────────────────────────────────────────────────
// 用法帮助
// ────────────────────────────────────────────────────────────────
#ifdef _WIN32
enum {
	IDC_STATUS_TEXT = 1001,
	IDC_START_BTN = 1002,
	IDC_STOP_BTN = 1003,
	IDC_MINIMIZE_BTN = 1004,
	IDC_EXIT_BTN = 1005,
	IDC_BROWSER_BTN = 1006,
	IDC_ADDR_EDIT = 1010,
	IDC_UPLOAD_EDIT = 1011,
	IDC_HTML_EDIT = 1012,
	IDC_SQLITE_EDIT = 1013,
	IDC_FFMPEG_EDIT = 1014,
	IDC_THREADS_EDIT = 1015,
	IDC_UPLOAD_BROWSE = 1021,
	IDC_HTML_BROWSE = 1022,
	IDC_SQLITE_BROWSE = 1023,
	IDC_FFMPEG_BROWSE = 1024
};

static const UINT WM_WEBCOOL_TRAY = WM_APP + 88;
static const UINT WEBCOOL_TRAY_ID = 1;
static HBRUSH g_control_bg_brush = NULL;
static HBRUSH g_control_panel_brush = NULL;
static HFONT g_control_font = NULL;
static HFONT g_control_title_font = NULL;

static std::wstring utf8_to_wide_text(const char* text)
{
	std::wstring wide;
	if (text == nullptr || !webcool_utf8_to_wide(text, wide)) {
		return L"";
	}
	return wide;
}

static std::string wide_to_utf8_text(const wchar_t* text)
{
	std::string out;
	if (text == nullptr || !webcool_wide_to_utf8(text, out)) {
		return "";
	}
	return out;
}

static std::string get_window_utf8(HWND hwnd, int id)
{
	HWND item = GetDlgItem(hwnd, id);
	if (item == NULL) {
		return "";
	}
	const int len = GetWindowTextLengthW(item);
	std::vector<wchar_t> buf((size_t) len + 1, L'\0');
	GetWindowTextW(item, &buf[0], len + 1);
	return wide_to_utf8_text(&buf[0]);
}

static void set_window_utf8(HWND hwnd, int id, const char* text)
{
	SetWindowTextW(GetDlgItem(hwnd, id), utf8_to_wide_text(text).c_str());
}

static void set_control_font(HWND hwnd, int id, HFONT font)
{
	SendMessageW(GetDlgItem(hwnd, id), WM_SETFONT, (WPARAM) font, TRUE);
}

static HICON load_webcool_icon()
{
	HICON icon = (HICON) LoadImageW(GetModuleHandleW(NULL),
		MAKEINTRESOURCEW(IDI_WEBCOOL), IMAGE_ICON, 0, 0,
		LR_DEFAULTSIZE | LR_SHARED);
	return icon != NULL ? icon : LoadIconW(NULL, MAKEINTRESOURCEW(32512));
}

static bool choose_folder(HWND hwnd, int edit_id, const wchar_t* title)
{
	BROWSEINFOW bi;
	memset(&bi, 0, sizeof(bi));
	bi.hwndOwner = hwnd;
	bi.lpszTitle = title;
	bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_USENEWUI;
	LPITEMIDLIST item = SHBrowseForFolderW(&bi);
	if (item == NULL) {
		return false;
	}
	wchar_t path[MAX_PATH];
	const BOOL ok = SHGetPathFromIDListW(item, path);
	CoTaskMemFree(item);
	if (!ok) {
		return false;
	}
	SetWindowTextW(GetDlgItem(hwnd, edit_id), path);
	return true;
}

static bool choose_file(HWND hwnd, int edit_id, const wchar_t* title,
	const wchar_t* filter)
{
	wchar_t path[MAX_PATH];
	memset(path, 0, sizeof(path));
	GetWindowTextW(GetDlgItem(hwnd, edit_id), path, MAX_PATH);
	OPENFILENAMEW ofn;
	memset(&ofn, 0, sizeof(ofn));
	ofn.lStructSize = sizeof(ofn);
	ofn.hwndOwner = hwnd;
	ofn.lpstrTitle = title;
	ofn.lpstrFilter = filter;
	ofn.lpstrFile = path;
	ofn.nMaxFile = MAX_PATH;
	ofn.Flags = OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR;
	if (!GetOpenFileNameW(&ofn)) {
		return false;
	}
	SetWindowTextW(GetDlgItem(hwnd, edit_id), path);
	return true;
}

static std::wstring browser_url_from_addr(const std::string& addr)
{
	std::string url = addr;
	if (url.find("://") != std::string::npos) {
		return utf8_to_wide_text(url.c_str());
	}
	std::string host = url;
	std::string port;
	const std::string::size_type colon = url.rfind(':');
	if (colon != std::string::npos) {
		host = url.substr(0, colon);
		port = url.substr(colon);
	}
	if (host.empty() || host == "0.0.0.0" || host == "*") {
		host = "127.0.0.1";
	}
	return utf8_to_wide_text((std::string("http://") + host + port + "/").c_str());
}

static void open_service_browser(HWND hwnd)
{
	webcool_service_controller* controller =
		(webcool_service_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
	if (controller == nullptr || !controller->running()) {
		return;
	}
	const std::wstring url = browser_url_from_addr(controller->options().addr.c_str());
	ShellExecuteW(hwnd, L"open", url.c_str(), NULL, NULL, SW_SHOWNORMAL);
}

static void add_tray_icon(HWND hwnd)
{
	NOTIFYICONDATAW nid;
	memset(&nid, 0, sizeof(nid));
	nid.cbSize = sizeof(nid);
	nid.hWnd = hwnd;
	nid.uID = WEBCOOL_TRAY_ID;
	nid.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP;
	nid.uCallbackMessage = WM_WEBCOOL_TRAY;
	nid.hIcon = load_webcool_icon();
	wcscpy_s(nid.szTip, L"webcool 控制界面");
	Shell_NotifyIconW(NIM_ADD, &nid);
}

static void remove_tray_icon(HWND hwnd)
{
	NOTIFYICONDATAW nid;
	memset(&nid, 0, sizeof(nid));
	nid.cbSize = sizeof(nid);
	nid.hWnd = hwnd;
	nid.uID = WEBCOOL_TRAY_ID;
	Shell_NotifyIconW(NIM_DELETE, &nid);
}

static void hide_to_tray(HWND hwnd)
{
	add_tray_icon(hwnd);
	ShowWindow(hwnd, SW_HIDE);
}

static void restore_from_tray(HWND hwnd)
{
	remove_tray_icon(hwnd);
	ShowWindow(hwnd, SW_SHOWNORMAL);
	SetForegroundWindow(hwnd);
}

static void enable_config_controls(HWND hwnd, bool enabled)
{
	const int ids[] = {
		IDC_ADDR_EDIT, IDC_UPLOAD_EDIT, IDC_HTML_EDIT,
		IDC_SQLITE_EDIT, IDC_FFMPEG_EDIT, IDC_THREADS_EDIT,
		IDC_UPLOAD_BROWSE, IDC_HTML_BROWSE,
		IDC_SQLITE_BROWSE, IDC_FFMPEG_BROWSE
	};
	for (size_t i = 0; i < sizeof(ids) / sizeof(ids[0]); ++i) {
		EnableWindow(GetDlgItem(hwnd, ids[i]), enabled ? TRUE : FALSE);
	}
}

static bool read_control_config(HWND hwnd, webcool_service_options& options,
	std::string& err)
{
	err.clear();
	const std::string addr = get_window_utf8(hwnd, IDC_ADDR_EDIT);
	const std::string upload = get_window_utf8(hwnd, IDC_UPLOAD_EDIT);
	const std::string html = get_window_utf8(hwnd, IDC_HTML_EDIT);
	const std::string sqlite = get_window_utf8(hwnd, IDC_SQLITE_EDIT);
	const std::string ffmpeg = get_window_utf8(hwnd, IDC_FFMPEG_EDIT);
	const std::string threads_text = get_window_utf8(hwnd, IDC_THREADS_EDIT);

	if (addr.empty()) {
		err = "监听地址不能为空";
		return false;
	}
	if (upload.empty()) {
		err = "文件保存目录不能为空";
		return false;
	}
	if (html.empty()) {
		err = "静态资源根目录不能为空";
		return false;
	}
	const int threads = atoi(threads_text.c_str());
	if (threads <= 0) {
		err = "工作线程数必须大于 0";
		return false;
	}

	snprintf(g_upload_dir, sizeof(g_upload_dir), "%s", upload.c_str());
	snprintf(g_html_home, sizeof(g_html_home), "%s", html.c_str());
	snprintf(g_sqlite_lib, sizeof(g_sqlite_lib), "%s", sqlite.c_str());
	snprintf(g_ffmpeg_path, sizeof(g_ffmpeg_path), "%s", ffmpeg.c_str());
	options.addr = addr.c_str();
	options.nthreads = threads;
	return true;
}

static void update_control_window(HWND hwnd)
{
	webcool_service_controller* controller =
		(webcool_service_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
	if (controller == nullptr) {
		return;
	}
	const bool running = controller->running();
	std::wstring status = running ? L"状态：运行中" : L"状态：已停止";
	status += L"\r\n监听地址：";
	status += utf8_to_wide_text(controller->options().addr.c_str());
	status += L"\r\n存储目录：";
	status += utf8_to_wide_text(g_upload_dir);
	SetWindowTextW(GetDlgItem(hwnd, IDC_STATUS_TEXT), status.c_str());
	EnableWindow(GetDlgItem(hwnd, IDC_BROWSER_BTN), running ? TRUE : FALSE);
	EnableWindow(GetDlgItem(hwnd, IDC_START_BTN), running ? FALSE : TRUE);
	EnableWindow(GetDlgItem(hwnd, IDC_STOP_BTN), running ? TRUE : FALSE);
}

static void update_control_window2(HWND hwnd)
{
	webcool_service_controller* controller =
		(webcool_service_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
	if (controller == nullptr) {
		return;
	}
	const bool running = controller->running();
	std::wstring status = running ? L"状态：运行中" : L"状态：已停止";
	status += L"\r\n监听地址：";
	status += utf8_to_wide_text(controller->options().addr.c_str());
	status += L"\r\n文件保存目录：";
	status += utf8_to_wide_text(g_upload_dir);
	SetWindowTextW(GetDlgItem(hwnd, IDC_STATUS_TEXT), status.c_str());
	EnableWindow(GetDlgItem(hwnd, IDC_BROWSER_BTN), running ? TRUE : FALSE);
	EnableWindow(GetDlgItem(hwnd, IDC_START_BTN), running ? FALSE : TRUE);
	EnableWindow(GetDlgItem(hwnd, IDC_STOP_BTN), running ? TRUE : FALSE);
	enable_config_controls(hwnd, !running);
}

static LRESULT CALLBACK control_window_proc(HWND hwnd, UINT msg,
	WPARAM wparam, LPARAM lparam)
{
	switch (msg) {
	case WM_CREATE:
	{
		CREATESTRUCTW* cs = (CREATESTRUCTW*) lparam;
		SetWindowLongPtrW(hwnd, GWLP_USERDATA, (LONG_PTR) cs->lpCreateParams);
		SetWindowTextW(hwnd, L"webcool 控制界面");
		HFONT font = (HFONT) GetStockObject(DEFAULT_GUI_FONT);
		CreateWindowW(L"STATIC", L"", WS_CHILD | WS_VISIBLE | SS_LEFT,
			22, 18, 380, 62, hwnd, (HMENU) IDC_STATUS_TEXT,
			GetModuleHandleW(NULL), NULL);
		CreateWindowW(L"BUTTON", L"启动", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
			22, 98, 78, 32, hwnd, (HMENU) IDC_START_BTN,
			GetModuleHandleW(NULL), NULL);
		CreateWindowW(L"BUTTON", L"停止", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
			116, 98, 78, 32, hwnd, (HMENU) IDC_STOP_BTN,
			GetModuleHandleW(NULL), NULL);
		CreateWindowW(L"BUTTON", L"最小化", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
			210, 98, 78, 32, hwnd, (HMENU) IDC_MINIMIZE_BTN,
			GetModuleHandleW(NULL), NULL);
		CreateWindowW(L"BUTTON", L"退出", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
			304, 98, 78, 32, hwnd, (HMENU) IDC_EXIT_BTN,
			GetModuleHandleW(NULL), NULL);
		CreateWindowW(L"BUTTON", L"打开浏览器", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
			204, 386, 84, 34, hwnd, (HMENU) IDC_BROWSER_BTN,
			GetModuleHandleW(NULL), NULL);
		if (g_control_bg_brush == NULL) {
			g_control_bg_brush = CreateSolidBrush(RGB(244, 247, 251));
		}
		if (g_control_panel_brush == NULL) {
			g_control_panel_brush = CreateSolidBrush(RGB(255, 255, 255));
		}
		if (g_control_font == NULL) {
			g_control_font = CreateFontW(18, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
				DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
				CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Microsoft YaHei UI");
		}
		if (g_control_title_font == NULL) {
			g_control_title_font = CreateFontW(24, 0, 0, 0, FW_SEMIBOLD, FALSE, FALSE, FALSE,
				DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
				CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Microsoft YaHei UI");
		}
		HFONT ui_font = g_control_font ? g_control_font : font;
		HFONT title_font = g_control_title_font ? g_control_title_font : font;
		SetWindowTextW(GetDlgItem(hwnd, IDC_START_BTN), L"启动");
		SetWindowTextW(GetDlgItem(hwnd, IDC_STOP_BTN), L"停止");
		SetWindowTextW(GetDlgItem(hwnd, IDC_MINIMIZE_BTN), L"最小化");
		SetWindowTextW(GetDlgItem(hwnd, IDC_EXIT_BTN), L"退出");
		SetWindowPos(GetDlgItem(hwnd, IDC_STATUS_TEXT), NULL, 32, 64, 620, 58, SWP_NOZORDER);
		SetWindowTextW(GetDlgItem(hwnd, IDC_BROWSER_BTN), L"打开浏览器");
		SetWindowPos(GetDlgItem(hwnd, IDC_BROWSER_BTN), NULL, 204, 386, 84, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_START_BTN), NULL, 300, 386, 84, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_STOP_BTN), NULL, 396, 386, 84, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_MINIMIZE_BTN), NULL, 492, 386, 84, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_EXIT_BTN), NULL, 588, 386, 84, 34, SWP_NOZORDER);
		HWND title = CreateWindowW(L"STATIC", L"webcool 控制界面",
			WS_CHILD | WS_VISIBLE | SS_LEFT, 28, 18, 300, 30, hwnd, NULL,
			GetModuleHandleW(NULL), NULL);
		SendMessageW(title, WM_SETFONT, (WPARAM) title_font, TRUE);
		HWND group = CreateWindowW(L"BUTTON", L"服务配置",
			WS_CHILD | WS_VISIBLE | BS_GROUPBOX, 22, 132, 650, 238, hwnd, NULL,
			GetModuleHandleW(NULL), NULL);
		SendMessageW(group, WM_SETFONT, (WPARAM) ui_font, TRUE);
		const wchar_t* labels[] = {
			L"监听地址", L"文件保存目录", L"静态资源根目录",
			L"sqlite 动态库路径", L"ffmpeg 可执行文件路径", L"工作线程数"
		};
		const int edit_ids[] = {
			IDC_ADDR_EDIT, IDC_UPLOAD_EDIT, IDC_HTML_EDIT,
			IDC_SQLITE_EDIT, IDC_FFMPEG_EDIT, IDC_THREADS_EDIT
		};
		for (int i = 0; i < 6; ++i) {
			const int y = 166 + i * 32;
			HWND label = CreateWindowW(L"STATIC", labels[i], WS_CHILD | WS_VISIBLE | SS_LEFT,
				42, y + 4, 130, 24, hwnd, NULL, GetModuleHandleW(NULL), NULL);
			SendMessageW(label, WM_SETFONT, (WPARAM) ui_font, TRUE);
			const bool has_browse = i >= 1 && i <= 4;
			HWND edit = CreateWindowW(L"EDIT", L"", WS_CHILD | WS_VISIBLE | WS_BORDER | ES_AUTOHSCROLL,
				184, y, i == 5 ? 90 : (has_browse ? 420 : 460), 25, hwnd, (HMENU) (INT_PTR) edit_ids[i],
				GetModuleHandleW(NULL), NULL);
			SendMessageW(edit, WM_SETFONT, (WPARAM) ui_font, TRUE);
			if (has_browse) {
				const int browse_ids[] = {
					IDC_UPLOAD_BROWSE, IDC_HTML_BROWSE,
					IDC_SQLITE_BROWSE, IDC_FFMPEG_BROWSE
				};
				HWND browse = CreateWindowW(L"BUTTON", L"...",
					WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
					612, y, 34, 25, hwnd, (HMENU) (INT_PTR) browse_ids[i - 1],
					GetModuleHandleW(NULL), NULL);
				SendMessageW(browse, WM_SETFONT, (WPARAM) ui_font, TRUE);
			}
		}
		webcool_service_controller* controller =
			(webcool_service_controller*) cs->lpCreateParams;
		if (controller != nullptr) {
			set_window_utf8(hwnd, IDC_ADDR_EDIT, controller->options().addr.c_str());
			char threads_buf[32];
			snprintf(threads_buf, sizeof(threads_buf), "%d", controller->options().nthreads);
			set_window_utf8(hwnd, IDC_THREADS_EDIT, threads_buf);
		}
		set_window_utf8(hwnd, IDC_UPLOAD_EDIT, g_upload_dir);
		set_window_utf8(hwnd, IDC_HTML_EDIT, g_html_home);
		set_window_utf8(hwnd, IDC_SQLITE_EDIT, g_sqlite_lib);
		set_window_utf8(hwnd, IDC_FFMPEG_EDIT, g_ffmpeg_path);
		for (int id = IDC_STATUS_TEXT; id <= IDC_EXIT_BTN; ++id) {
			set_control_font(hwnd, id, ui_font);
		}
		set_control_font(hwnd, IDC_BROWSER_BTN, ui_font);
		update_control_window2(hwnd);
		return 0;
	}
	case WM_COMMAND:
	{
		webcool_service_controller* controller =
			(webcool_service_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
		const int id = LOWORD(wparam);
		if (id == IDC_START_BTN && controller != nullptr) {
			std::string err;
			webcool_service_options options = controller->options();
			if (!read_control_config(hwnd, options, err)) {
				std::wstring message = L"配置无效：";
				message += utf8_to_wide_text(err.c_str());
				MessageBoxW(hwnd, message.c_str(), L"webcool", MB_OK | MB_ICONWARNING);
				return 0;
			}
			controller->configure(options);
			if (!controller->start(err)) {
				std::wstring start_message = L"启动 webcool 失败：";
				start_message += utf8_to_wide_text(err.c_str());
				MessageBoxW(hwnd, start_message.c_str(), L"webcool", MB_OK | MB_ICONERROR);
				update_control_window2(hwnd);
				return 0;
				std::wstring message = L"启动 webcool 失败：";
				message += utf8_to_wide_text(err.c_str());
				MessageBoxW(hwnd, message.c_str(), L"webcool", MB_OK | MB_ICONERROR);
			}
			update_control_window2(hwnd);
			return 0;
		}
		if (id == IDC_BROWSER_BTN) {
			open_service_browser(hwnd);
			return 0;
		}
		if (id == IDC_UPLOAD_BROWSE) {
			choose_folder(hwnd, IDC_UPLOAD_EDIT, L"选择文件保存目录");
			return 0;
		}
		if (id == IDC_HTML_BROWSE) {
			choose_folder(hwnd, IDC_HTML_EDIT, L"选择静态资源根目录");
			return 0;
		}
		if (id == IDC_SQLITE_BROWSE) {
			choose_file(hwnd, IDC_SQLITE_EDIT, L"选择 sqlite 动态库",
				L"sqlite 动态库\0*.dll\0所有文件\0*.*\0");
			return 0;
		}
		if (id == IDC_FFMPEG_BROWSE) {
			choose_file(hwnd, IDC_FFMPEG_EDIT, L"选择 ffmpeg 可执行文件",
				L"ffmpeg 可执行文件\0*.exe\0所有文件\0*.*\0");
			return 0;
		}
		if (id == IDC_STOP_BTN && controller != nullptr) {
			controller->stop();
			update_control_window2(hwnd);
			return 0;
		}
		if (id == IDC_MINIMIZE_BTN) {
			hide_to_tray(hwnd);
			return 0;
		}
		if (id == IDC_EXIT_BTN) {
			if (controller != nullptr) {
				controller->stop();
			}
			remove_tray_icon(hwnd);
			DestroyWindow(hwnd);
			return 0;
		}
		break;
	}
	case WM_SIZE:
		if (wparam == SIZE_MINIMIZED) {
			hide_to_tray(hwnd);
			return 0;
		}
		break;
	case WM_WEBCOOL_TRAY:
		if (lparam == WM_LBUTTONUP || lparam == WM_LBUTTONDBLCLK) {
			restore_from_tray(hwnd);
			return 0;
		}
		break;
	case WM_CTLCOLORSTATIC:
		SetBkMode((HDC) wparam, TRANSPARENT);
		return (LRESULT) (g_control_bg_brush ? g_control_bg_brush : GetStockObject(WHITE_BRUSH));
	case WM_CLOSE:
	{
		webcool_service_controller* controller =
			(webcool_service_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
		if (controller != nullptr) {
			controller->stop();
		}
		remove_tray_icon(hwnd);
		DestroyWindow(hwnd);
		return 0;
	}
	case WM_DESTROY:
		remove_tray_icon(hwnd);
		PostQuitMessage(0);
		return 0;
	default:
		break;
	}
	return DefWindowProcW(hwnd, msg, wparam, lparam);
}

static int run_windows_control_gui(webcool_service_controller& controller)
{
	const wchar_t* class_name = L"WebCoolControlWindow";
	WNDCLASSW wc;
	memset(&wc, 0, sizeof(wc));
	wc.lpfnWndProc = control_window_proc;
	wc.hInstance = GetModuleHandleW(NULL);
	wc.hIcon = load_webcool_icon();
	wc.hCursor = LoadCursorW(NULL, MAKEINTRESOURCEW(32512));
	wc.hbrBackground = (HBRUSH) (COLOR_WINDOW + 1);
	wc.lpszClassName = class_name;
	if (!RegisterClassW(&wc)) {
		return 1;
	}

	HWND hwnd = CreateWindowExW(0, class_name, L"webcool 控制界面",
		WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
		CW_USEDEFAULT, CW_USEDEFAULT, 714, 474,
		NULL, NULL, GetModuleHandleW(NULL), &controller);
	if (hwnd == NULL) {
		return 1;
	}
	ShowWindow(hwnd, SW_SHOW);
	UpdateWindow(hwnd);

	MSG msg;
	while (GetMessageW(&msg, NULL, 0, 0) > 0) {
		TranslateMessage(&msg);
		DispatchMessageW(&msg);
	}
	return (int) msg.wParam;
}

static void ensure_console_for_cli()
{
	if (!AttachConsole(ATTACH_PARENT_PROCESS)) {
		AllocConsole();
	}
	FILE* fp = nullptr;
	freopen_s(&fp, "CONOUT$", "w", stdout);
	freopen_s(&fp, "CONOUT$", "w", stderr);
	freopen_s(&fp, "CONIN$", "r", stdin);
}
#endif

static void usage(const char* prog) {
	printf(
		"用法: %s [选项]\n"
		"  -h              显示帮助\n"
		"  -v              显示版本号\n"
		"  -V              显示详细信息\n"
		"  -D              以后台服务(守护进程)方式启动\n"
		"  -s addr         监听地址 (默认 0.0.0.0:8080)\n"
		"  -d upload_dir   上传文件保存目录\n"
		"                  (macOS 默认 ~/Library/Application Support/webcool/data, 其他平台默认 ./uploads)\n"
		"  -w html_home     静态资源根目录 (默认 ./html)\n"
		"  -S sqlite_lib   sqlite 动态库路径 (例如 /usr/local/lib/sqlite3.so)\n"
		"  -F ffmpeg_path  ffmpeg 可执行文件路径 (例如 /opt/webcool/bin/ffmpeg)\n"
		"  -t threads      工作线程数 (默认 2)\n"
		"  -R              每线程独立监听 (SO_REUSEPORT)\n"
		"  -r rw_timeout   读写超时秒数 (默认 0=无超时)\n"
		"  -z stack_size   协程栈大小 (默认 128000)\n"
#ifdef _WIN32
		"  -e event_type   事件引擎: kernel|poll|select (默认 poll)\n"
		"  -c              进入 DOS 终端模式\n"
		"  -G              打开 Windows 控制界面 (Windows 默认)\n",
#else
		"  -e event_type   事件引擎: kernel|poll|select (默认 kernel)\n",
#endif
		prog);
}

// ────────────────────────────────────────────────────────────────
// main
// ────────────────────────────────────────────────────────────────
int main(int argc, char* argv[]) {
#ifdef _WIN32
	SetConsoleCP(CP_UTF8);
	SetConsoleOutputCP(CP_UTF8);

	int utf8_argc = 0;
	std::vector<std::string> utf8_args;
	std::vector<char*> utf8_argv;
	LPWSTR* wide_argv = CommandLineToArgvW(GetCommandLineW(), &utf8_argc);
	if (wide_argv != NULL) {
		utf8_args.reserve((size_t) utf8_argc);
		utf8_argv.reserve((size_t) utf8_argc + 1);
		for (int i = 0; i < utf8_argc; ++i) {
			std::string text;
			if (webcool_wide_to_utf8(wide_argv[i], text)) {
				utf8_args.push_back(text);
			} else {
				utf8_args.push_back("");
			}
		}
		LocalFree(wide_argv);
		for (size_t i = 0; i < utf8_args.size(); ++i) {
			utf8_argv.push_back(&utf8_args[i][0]);
		}
		utf8_argv.push_back(NULL);
		argc = (int) utf8_args.size();
		argv = utf8_argv.data();
	}
#endif

	acl::string addr("0.0.0.0:8080");
	int  nthreads    = 2;
	bool reuse_port  = false;
	bool daemon_mode = false;
	bool show_version = false;
	bool show_detail = false;
#ifdef _WIN32
	bool gui_mode = true;
	bool console_mode = false;
#endif
	int  ch;
	bool upload_dir_specified = false;

	while ((ch = getopt(argc, argv, "hvVDGcs:d:w:S:F:t:Rr:z:e:")) > 0) {
		switch (ch) {
		case 'h':
			usage(argv[0]);
			return 0;
		case 'v':
			show_version = true;
			break;
		case 'V':
			show_detail = true;
			break;
		case 'D':
			daemon_mode = true;
			break;
		case 'G':
#ifdef _WIN32
			gui_mode = true;
#endif
			break;
		case 'c':
#ifdef _WIN32
			gui_mode = false;
			console_mode = true;
#endif
			break;
		case 's':
			addr = optarg;
			break;
		case 'd':
			snprintf(g_upload_dir, sizeof(g_upload_dir), "%s", optarg);
			upload_dir_specified = true;
			break;
		case 'w':
			snprintf(g_html_home, sizeof(g_html_home), "%s", optarg);
			break;
		case 'S':
			snprintf(g_sqlite_lib, sizeof(g_sqlite_lib), "%s", optarg);
			break;
		case 'F':
			snprintf(g_ffmpeg_path, sizeof(g_ffmpeg_path), "%s", optarg);
			break;
		case 't':
			nthreads = atoi(optarg);
			break;
		case 'R':
			reuse_port = true;
			break;
		case 'r':
			g_rw_timeout = atoi(optarg);
			break;
		case 'z':
			g_stack_size = atoi(optarg);
			break;
		case 'e':
			if (strcasecmp(optarg, "poll") == 0) {
				g_event_type = acl::FIBER_EVENT_T_POLL;
			} else if (strcasecmp(optarg, "select") == 0) {
				g_event_type = acl::FIBER_EVENT_T_SELECT;
			} else {
				g_event_type = acl::FIBER_EVENT_T_KERNEL;
			}
			break;
		default:
			break;
		}
	}

#ifdef _WIN32
	if (console_mode) {
		ensure_console_for_cli();
	}
#endif

	if (show_detail) {
		apply_default_upload_dir(upload_dir_specified);
		print_detail_info(addr, nthreads, reuse_port, daemon_mode);
		return 0;
	}

	if (show_version) {
		printf("%s\n", g_webcool_version);
		return 0;
	}

	apply_default_upload_dir(upload_dir_specified);

	if (daemon_mode
#ifdef _WIN32
		&& !gui_mode
#endif
	) {
		if (!daemonize_process()) {
			fprintf(stderr, "切换到后台模式失败\n");
			return 1;
		}
	}

	webcool_service_options service_options;
	service_options.addr = addr;
	service_options.nthreads = nthreads;
	service_options.reuse_port = reuse_port;
	webcool_service_controller controller(service_options);

#ifdef _WIN32
	if (gui_mode) {
		return run_windows_control_gui(controller);
	}
#endif

	std::string service_err;
	if (!controller.start(service_err)) {
		fprintf(stderr, "%s\n", service_err.c_str());
		return 1;
	}
	controller.wait();
	return 0;

	acl::acl_cpp_init();
	acl::log::stdout_open(true);

	apply_default_upload_dir(upload_dir_specified);

	if (!action::make_dir_recursive(g_upload_dir)) {
		fprintf(stderr, "创建数据目录失败: %s\n", g_upload_dir);
		return 1;
	}

	if (g_sqlite_lib[0] != '\0') {
		action::runtime_sqlite_lib_set(g_sqlite_lib);
	}

	if (g_html_home[0] != '\0') {
		action::IndexAction::set_static_home_path(g_html_home);
	}


	if (g_ffmpeg_path[0] != '\0') {
		action::runtime_ffmpeg_path_set(g_ffmpeg_path);
	}

	printf("HTTP 文件上传服务器\n");
	printf("  监听地址: %s\n", addr.c_str());
	printf("  上传目录: %s\n", g_upload_dir);
	if (g_sqlite_lib[0] != '\0') {
		printf("  sqlite库: %s\n", g_sqlite_lib);
	}
	if (g_ffmpeg_path[0] != '\0') {
		printf("  ffmpeg路径: %s\n", g_ffmpeg_path);
	} else {
		const std::string ffmpeg_auto = action::choose_ffmpeg_path();
		if (!ffmpeg_auto.empty()) {
			printf("  ffmpeg路径: %s\n", ffmpeg_auto.c_str());
		}
	}
	printf("  工作线程: %d\n", nthreads);

	std::string resume_db_err;
	if (!action::init_video_resume_db(g_upload_dir, resume_db_err)) {
		fprintf(stderr, "初始化续播数据库失败: %s\n", resume_db_err.c_str());
		return 1;
	}
	printf("  续播数据库: 已初始化\n");

	std::string folder_db_err;
	if (!action::init_category_folder_db(g_upload_dir, folder_db_err)) {
		fprintf(stderr, "初始化分类文件夹数据库失败: %s\n", folder_db_err.c_str());
		return 1;
	}
	printf("  分类文件夹数据库: 已初始化\n");

	std::string recycle_db_err;
	if (!action::init_recycle_bin_db(g_upload_dir, recycle_db_err)) {
		fprintf(stderr, "初始化回收站数据库失败: %s\n", recycle_db_err.c_str());
		return 1;
	}
	printf("  回收站数据库: 已初始化\n");

	acl::server_socket server;

	if (!reuse_port) {
		if (!server.open(addr)) {
			fprintf(stderr, "监听 %s 失败: %s\n",
				addr.c_str(), acl::last_serror());
			return 1;
		}
		printf("监听 %s 成功\n", addr.c_str());
	}

	if (daemon_mode) {
		if (!daemonize_process()) {
			fprintf(stderr, "切换到后台模式失败\n");
			return 1;
		}
	}

	std::vector<acl::thread*> threads;
	for (int i = 0; i < nthreads; i++) {
		acl::thread* thr = reuse_port
			? new server_thread(addr.c_str())
			: new server_thread(server);
		thr->set_detachable(false);
		thr->start();
		threads.push_back(thr);
	}

	for (auto thr : threads) {
		thr->wait();
		delete thr;
	}

	return 0;
}
