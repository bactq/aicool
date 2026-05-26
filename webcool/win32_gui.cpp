#include "stdafx.h"
#include "action/actions.h"
#include "action/action_util.h"
#include "server_thread.h"
#include "win32_gui.h"
#include "config.h"

#ifdef _WIN32
enum {
	IDC_STATUS_TEXT = 1001,
	IDC_START_BTN = 1002,
	IDC_STOP_BTN = 1003,
	IDC_MINIMIZE_BTN = 1004,
	IDC_EXIT_BTN = 1005,
	IDC_BROWSER_BTN = 1006,
	IDC_DOS_BTN = 1007,
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
static bool g_dos_console_open = false;

static std::wstring utf8_to_wide_text(const char* text) {
	std::wstring wide;
	if (text == nullptr || !webcool_utf8_to_wide(text, wide)) {
		return L"";
	}
	return wide;
}

static std::string wide_to_utf8_text(const wchar_t* text) {
	std::string out;
	if (text == nullptr || !webcool_wide_to_utf8(text, out)) {
		return "";
	}
	return out;
}

static std::string get_window_utf8(HWND hwnd, int id) {
	HWND item = GetDlgItem(hwnd, id);
	if (item == NULL) {
		return "";
	}
	const int len = GetWindowTextLengthW(item);
	std::vector<wchar_t> buf((size_t) len + 1, L'\0');
	GetWindowTextW(item, &buf[0], len + 1);
	return wide_to_utf8_text(&buf[0]);
}

static void set_window_utf8(HWND hwnd, int id, const char* text) {
	SetWindowTextW(GetDlgItem(hwnd, id), utf8_to_wide_text(text).c_str());
}

static void set_control_font(HWND hwnd, int id, HFONT font) {
	SendMessageW(GetDlgItem(hwnd, id), WM_SETFONT, (WPARAM) font, TRUE);
}

static void update_dos_button_text(HWND hwnd) {
	SetWindowTextW(GetDlgItem(hwnd, IDC_DOS_BTN),
		g_dos_console_open ? L"关闭DOS" : L"打开DOS");
}

static void protect_dos_console_window() {
	HWND console = GetConsoleWindow();
	if (console == NULL) {
		return;
	}
	HMENU menu = GetSystemMenu(console, FALSE);
	if (menu != NULL) {
		EnableMenuItem(menu, SC_CLOSE, MF_BYCOMMAND | MF_GRAYED);
	}
}

static bool open_dos_console(HWND hwnd) {
	if (g_dos_console_open) {
		return true;
	}
	if (GetConsoleWindow() == NULL && !AllocConsole()) {
		MessageBoxW(hwnd, L"打开 DOS 终端失败", L"webcool",
			MB_OK | MB_ICONERROR);
		return false;
	}

	SetConsoleTitleW(L"webcool DOS 调试终端");
	FILE* fp = NULL;
	freopen_s(&fp, "CONOUT$", "w", stdout);
	freopen_s(&fp, "CONOUT$", "w", stderr);
	freopen_s(&fp, "CONIN$", "r", stdin);
	setvbuf(stdout, NULL, _IONBF, 0);
	setvbuf(stderr, NULL, _IONBF, 0);
	printf("webcool DOS debug console opened.\n");
	protect_dos_console_window();
	g_dos_console_open = true;
	update_dos_button_text(hwnd);
	return true;
}

static void close_dos_console(HWND hwnd) {
	if (!g_dos_console_open) {
		return;
	}
	fflush(stdout);
	fflush(stderr);
	FreeConsole();
	g_dos_console_open = false;
	update_dos_button_text(hwnd);
}

static void toggle_dos_console(HWND hwnd) {
	if (g_dos_console_open) {
		close_dos_console(hwnd);
	} else {
		open_dos_console(hwnd);
	}
}

static HICON load_webcool_icon() {
	HICON icon = (HICON) LoadImageW(GetModuleHandleW(NULL),
		MAKEINTRESOURCEW(IDI_WEBCOOL), IMAGE_ICON, 0, 0,
		LR_DEFAULTSIZE | LR_SHARED);
	return icon != NULL ? icon : LoadIconW(NULL, MAKEINTRESOURCEW(32512));
}

static bool choose_folder(HWND hwnd, int edit_id, const wchar_t* title) {
	BROWSEINFOW bi;
	memset(&bi, 0, sizeof(bi));
	bi.hwndOwner = hwnd;
	bi.lpszTitle = title;
	bi.ulFlags = BIF_RETURNONLYFSDIRS | BIF_USENEWUI;
	LPITEMIDLIST item = SHBrowseForFolderW(&bi);
	if (item == NULL) {
		return false;
	}
	wchar_t path[32768];
	memset(path, 0, sizeof(path));
	const BOOL ok = SHGetPathFromIDListW(item, path);
	CoTaskMemFree(item);
	if (!ok) {
		return false;
	}
	SetWindowTextW(GetDlgItem(hwnd, edit_id), path);
	return true;
}

static bool choose_file(HWND hwnd, int edit_id, const wchar_t* title,
	  const wchar_t* filter) {
	wchar_t path[32768];
	memset(path, 0, sizeof(path));
	GetWindowTextW(GetDlgItem(hwnd, edit_id), path,
		(int) (sizeof(path) / sizeof(path[0])));
	OPENFILENAMEW ofn;
	memset(&ofn, 0, sizeof(ofn));
	ofn.lStructSize = sizeof(ofn);
	ofn.hwndOwner = hwnd;
	ofn.lpstrTitle = title;
	ofn.lpstrFilter = filter;
	ofn.lpstrFile = path;
	ofn.nMaxFile = (DWORD) (sizeof(path) / sizeof(path[0]));
	ofn.Flags = OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR;
	if (!GetOpenFileNameW(&ofn)) {
		return false;
	}
	SetWindowTextW(GetDlgItem(hwnd, edit_id), path);
	return true;
}

static std::wstring browser_url_from_addr(const std::string& addr) {
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

static void open_service_browser(HWND hwnd) {
	webcool_controller* controller =
		(webcool_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
	if (controller == nullptr || !controller->running()) {
		return;
	}
	const std::wstring url = browser_url_from_addr(controller->options().addr.c_str());
	ShellExecuteW(hwnd, L"open", url.c_str(), NULL, NULL, SW_SHOWNORMAL);
}

static void add_tray_icon(HWND hwnd) {
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

static void remove_tray_icon(HWND hwnd) {
	NOTIFYICONDATAW nid;
	memset(&nid, 0, sizeof(nid));
	nid.cbSize = sizeof(nid);
	nid.hWnd = hwnd;
	nid.uID = WEBCOOL_TRAY_ID;
	Shell_NotifyIconW(NIM_DELETE, &nid);
}

static void hide_to_tray(HWND hwnd) {
	add_tray_icon(hwnd);
	ShowWindow(hwnd, SW_HIDE);
}

static void restore_from_tray(HWND hwnd) {
	remove_tray_icon(hwnd);
	ShowWindow(hwnd, SW_SHOWNORMAL);
	SetForegroundWindow(hwnd);
}

static void enable_config_controls(HWND hwnd, bool enabled) {
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

static bool read_control_config(HWND hwnd, webcool_options& options,
	  std::string& err) {
	err.clear();
	const std::string addr = get_window_utf8(hwnd, IDC_ADDR_EDIT);
	const std::string upload = get_window_utf8(hwnd, IDC_UPLOAD_EDIT);
	std::string html = get_window_utf8(hwnd, IDC_HTML_EDIT);
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
	html = normalize_static_home_path(html);
	const std::string index_html = join_config_path(html, "main.html");
	if (!readable_regular_file(index_html)) {
		err = "静态资源根目录无效，无法读取: ";
		err += index_html;
		return false;
	}
	const int threads = atoi(threads_text.c_str());
	if (threads <= 0) {
		err = "工作线程数必须大于 0";
		return false;
	}

	if (!set_config_text(g_upload_dir, sizeof(g_upload_dir),
		upload, "file save directory", err)
		|| !set_config_text(g_html_home, sizeof(g_html_home),
			html, "static resource root directory", err)
		|| !set_config_text(g_sqlite_lib, sizeof(g_sqlite_lib),
			sqlite, "sqlite dynamic library path", err)
		|| !set_config_text(g_ffmpeg_path, sizeof(g_ffmpeg_path),
			ffmpeg, "ffmpeg executable path", err))
	{
		return false;
	}
	options.addr = addr.c_str();
	options.nthreads = threads;
	set_window_utf8(hwnd, IDC_HTML_EDIT, g_html_home);
	return true;
}

static void update_control_window(HWND hwnd) {
	webcool_controller* controller =
		(webcool_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
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

static void update_control_window2(HWND hwnd) {
	webcool_controller* controller =
		(webcool_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
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
	  WPARAM wparam, LPARAM lparam) {
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
		CreateWindowW(L"BUTTON", L"打开DOS", WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON,
			288, 386, 78, 34, hwnd, (HMENU) IDC_DOS_BTN,
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
		update_dos_button_text(hwnd);
		SetWindowPos(GetDlgItem(hwnd, IDC_BROWSER_BTN), NULL, 168, 386, 84, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_DOS_BTN), NULL, 264, 386, 78, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_START_BTN), NULL, 354, 386, 70, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_STOP_BTN), NULL, 436, 386, 70, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_MINIMIZE_BTN), NULL, 518, 386, 74, 34, SWP_NOZORDER);
		SetWindowPos(GetDlgItem(hwnd, IDC_EXIT_BTN), NULL, 604, 386, 70, 34, SWP_NOZORDER);
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
		webcool_controller* controller =
			(webcool_controller*) cs->lpCreateParams;
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
		set_control_font(hwnd, IDC_DOS_BTN, ui_font);
		update_control_window2(hwnd);
		return 0;
	}
	case WM_COMMAND:
	{
		webcool_controller* controller =
			(webcool_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
		const int id = LOWORD(wparam);
		if (id == IDC_START_BTN && controller != nullptr) {
			std::string err;
			webcool_options options = controller->options();
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
		if (id == IDC_DOS_BTN) {
			toggle_dos_console(hwnd);
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
			close_dos_console(hwnd);
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
		webcool_controller* controller =
			(webcool_controller*) GetWindowLongPtrW(hwnd, GWLP_USERDATA);
		if (controller != nullptr) {
			controller->stop();
		}
		close_dos_console(hwnd);
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

int run_windows_control_gui(webcool_controller& controller) {
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

void ensure_console_for_cli() {
	if (!AttachConsole(ATTACH_PARENT_PROCESS)) {
		AllocConsole();
	}
	FILE* fp = nullptr;
	freopen_s(&fp, "CONOUT$", "w", stdout);
	freopen_s(&fp, "CONOUT$", "w", stderr);
	freopen_s(&fp, "CONIN$", "r", stdin);
}

#endif // _WIN32

