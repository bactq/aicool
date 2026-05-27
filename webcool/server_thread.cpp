#include "stdafx.h"
#include "http_servlet.h"
#include "config.h"
#include "server_thread.h"

// ──────────────────────────────────────
// 空 session：文件上传服务不需要会话，实现抽象接口即可
// ──────────────────────────────────────
class null_session : public acl::session {
public:
	null_session() : acl::session(0) {}
	~null_session() {}

	bool remove() override { return true; }
	bool get_attrs(std::map<acl::string, acl::session_string>&) override { return true; }
	bool set_attrs(const std::map<acl::string, acl::session_string>&) override { return true; }
	bool set_timeout(time_t) override { return true; }
};

// ──────────────────────────────────────
// 线程：每个线程独立运行一个协程调度器
// ──────────────────────────────────────

// 共享监听模式：传入已 open 的 server_socket
server_thread::server_thread(acl::server_socket &server)
: server_inner_(nullptr), server_(&server), opened_(true)
{
}

// SO_REUSEPORT 模式：每线程独立监听
server_thread::server_thread(const char *addr) {
	server_inner_ = new acl::server_socket(acl::OPEN_FLAG_REUSEPORT, 256);
	if (!server_inner_->open(addr)) {
		fprintf(stderr, "listen %s error: %s\n", addr, acl::last_serror());
		opened_ = false;
	} else {
		opened_ = true;
	}
	server_ = server_inner_;
}

server_thread::~server_thread() { delete server_inner_; }

void server_thread::stop() {
	stop_signal_.push(true);
}

// 每个连接的处理逻辑，运行在独立协程中
void server_thread::handle_conn(acl::socket_stream &conn) {
	conn.set_rw_timeout(g_rw_timeout);

	null_session session;
	http_servlet servlet(&conn, &session, g_upload_dir);

	while (!g_service_stopping.load() && servlet.doRun()) {}

	logger_debug(DEBUG_CONN, 1, "connection closed: fd=%d, fiber-%d, %s",
		conn.sock_handle(), acl::fiber::self(), acl::last_serror());
}

void *server_thread::run() {
	acl::gofiber([this] {
		bool stop = false;
		stop_signal_.pop(stop);

		for (auto fiber : fibers_) {
			fiber.second->kill();
		}

		stop_wait_group_.wait();
	});

	// Accept 协程：accept 到连接后，为每个连接启动一个协程
	auto fiber = acl::gofiber([this] {
		while (!g_service_stopping.load()) {
			bool timed = false;
			acl::socket_stream* conn = server_->accept(500, &timed);
			if (conn == nullptr) {
				if (timed && !g_service_stopping.load()) {
					continue;
				}
				if (!g_service_stopping.load()) {
					fprintf(stderr, "accept error: %s\n", acl::last_serror());
				}
				break;
			}
			// C++11 lambda 协程：捕获连接指针，处理完后自动释放
			auto fb = acl::gofiber_stack([this, conn] {
				handle_conn(*conn);
				delete conn;
				fibers_.erase(acl::fiber::self());
				stop_wait_group_.done();
			}, g_stack_size);

			fibers_.insert({ fb->get_id(), fb });
			stop_wait_group_.add(1);
		}
		stop_wait_group_.done();
		acl::fiber::schedule_stop();
	});

	fibers_.insert({ fiber->get_id(), fiber });
	stop_wait_group_.add(1);

	// 启动本线程的协程调度器（阻塞直到无协程运行）
	acl::fiber::schedule_with(g_event_type);
	return nullptr;
}

