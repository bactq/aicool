#include "stdafx.h"
#include "http_servlet.h"
#include <cstdlib>
#include <cstdio>
#include <cstring>
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

		printf("connection closed: fd=%d, fiber-%d, %s\n",
			conn->sock_handle(), acl::fiber::self(),
			acl::last_serror());
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
		"  -s addr         监听地址 (默认 0.0.0.0:8080)\n"
		"  -d upload_dir   上传文件保存目录 (默认 ./uploads)\n"
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
	acl::string addr("0.0.0.0:8080");
	int  nthreads    = 2;
	bool reuse_port  = false;
	int  ch;

	while ((ch = getopt(argc, argv, "hs:d:t:Rr:z:e:")) > 0) {
		switch (ch) {
		case 'h':
			usage(argv[0]);
			return 0;
		case 's':
			addr = optarg;
			break;
		case 'd':
			snprintf(g_upload_dir, sizeof(g_upload_dir), "%s", optarg);
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

	printf("HTTP 文件上传服务器\n");
	printf("  监听地址: %s\n", addr.c_str());
	printf("  上传目录: %s\n", g_upload_dir);
	printf("  工作线程: %d\n", nthreads);

	acl::server_socket server;

	if (!reuse_port) {
		if (!server.open(addr)) {
			fprintf(stderr, "监听 %s 失败: %s\n",
				addr.c_str(), acl::last_serror());
			return 1;
		}
		printf("监听 %s 成功\n", addr.c_str());
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
