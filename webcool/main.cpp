#include "stdafx.h"
#include "http_servlet.h"
#include "action/actions.h"
#include "action/action_util.h"
#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <csignal>
#ifdef _WIN32
#include "platform_compat.h"
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
static acl::fiber_event_t    g_event_type    = acl::FIBER_EVENT_T_KERNEL;
static char                  g_upload_dir[256] = "./uploads";
static char                  g_html_home[512] = "./html";
static char                  g_sqlite_lib[512] = "";
static char                  g_ffmpeg_path[512] = "";
static const char*           g_webcool_version = "1.0.6";

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
	: server_inner_(nullptr), server_(&server) {}

	// SO_REUSEPORT 模式：每线程独立监听
	explicit server_thread(const char* addr) {
		server_inner_ = new acl::server_socket(acl::OPEN_FLAG_REUSEPORT, 256);
		if (!server_inner_->open(addr)) {
			fprintf(stderr, "listen %s error: %s\n",
				addr, acl::last_serror());
			exit(1);
		}
		server_ = server_inner_;
	}

	~server_thread() { delete server_inner_; }

private:
	acl::server_socket* server_inner_;
	acl::server_socket* server_;

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
			while (true) {
				acl::socket_stream* conn = server_->accept();
				if (conn == nullptr) {
					fprintf(stderr, "accept error: %s\n",
						acl::last_serror());
					break;
				}
				// C++11 lambda 协程：捕获连接指针，处理完后自动释放
				go_stack(g_stack_size)[this, conn] {
					handle_conn(conn);
				};
			}
			exit(1);
		};

		// 启动本线程的协程调度器（阻塞直到无协程运行）
		acl::fiber::schedule_with(g_event_type);
		return nullptr;
	}
};

// ────────────────────────────────────────────────────────────────
// 用法帮助
// ────────────────────────────────────────────────────────────────
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
		"  -e event_type   事件引擎: kernel|poll|select (默认 kernel)\n",
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
	int  ch;
	bool upload_dir_specified = false;

	while ((ch = getopt(argc, argv, "hvVDs:d:w:S:F:t:Rr:z:e:")) > 0) {
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

	if (show_detail) {
		apply_default_upload_dir(upload_dir_specified);
		print_detail_info(addr, nthreads, reuse_port, daemon_mode);
		return 0;
	}

	if (show_version) {
		printf("%s\n", g_webcool_version);
		return 0;
	}

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
