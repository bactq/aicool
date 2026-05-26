#include "stdafx.h"
#include "action/action_util.h"
#include "config.h"
#include "win32_gui.h"
#include "webcool_controller.h"
#include "server_thread.h"

static const char* g_webcool_version = "1.0.7";

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
	  int nthreads, bool reuse_port, bool daemon_mode) {
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

// ──────────────────────────────────────
// 用法帮助
// ──────────────────────────────────────
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

// ───────────────────────────────────────
// main
// ───────────────────────────────────────
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
	std::string config_err;

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
			if (!set_config_text(g_upload_dir, sizeof(g_upload_dir),
				  optarg ? optarg : "", "file save directory", config_err)) {
				fprintf(stderr, "%s\n", config_err.c_str());
				return 1;
			}
			upload_dir_specified = true;
			break;
		case 'w':
			if (!set_config_text(g_html_home, sizeof(g_html_home),
				  optarg ? optarg : "",
				  "static resource root directory", config_err)) {
				fprintf(stderr, "%s\n", config_err.c_str());
				return 1;
			}
			break;
		case 'S':
			if (!set_config_text(g_sqlite_lib, sizeof(g_sqlite_lib),
				  optarg ? optarg : "", "sqlite dynamic library path", config_err)) {
				fprintf(stderr, "%s\n", config_err.c_str());
				return 1;
			}
			break;
		case 'F':
			if (!set_config_text(g_ffmpeg_path, sizeof(g_ffmpeg_path),
				  optarg ? optarg : "", "ffmpeg executable path", config_err)) {
				fprintf(stderr, "%s\n", config_err.c_str());
				return 1;
			}
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

	acl::acl_cpp_init();
	acl::log::stdout_open(true);

#ifdef _WIN32
	if (console_mode) {
		ensure_console_for_cli();
	}
#endif

	apply_default_upload_dir(upload_dir_specified);

	if (show_detail) {
		print_detail_info(addr, nthreads, reuse_port, daemon_mode);
		return 0;
	}

	if (show_version) {
		printf("%s\n", g_webcool_version);
		return 0;
	}

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

	webcool_options service_options;
	service_options.addr = addr;
	service_options.nthreads = nthreads;
	service_options.reuse_port = reuse_port;
	webcool_controller controller(service_options);

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
}

