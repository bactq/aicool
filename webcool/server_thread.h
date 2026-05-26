#pragma once
#include <map>
#include <mutex>
#include <thread>

// ──────────────────────────────────────
// 线程：每个线程独立运行一个协程调度器
// ──────────────────────────────────────
class server_thread final : public acl::thread {
public:
	// 共享监听模式：传入已 open 的 server_socket
	explicit server_thread(acl::server_socket &server);

	// SO_REUSEPORT 模式：每线程独立监听
	explicit server_thread(const char *addr);
	~server_thread() override;

	bool opened() const { return opened_; }

	void stop();

private:
	acl::server_socket *server_inner_;
	acl::server_socket *server_;
	bool opened_;
	std::mutex conns_mutex_;
	std::map<unsigned, std::shared_ptr<acl::fiber>> fibers_;
	acl::fiber_tbox2<bool> stop_signal_;
	acl::wait_group stop_wait_group_;

	// 每个连接的处理逻辑，运行在独立协程中
	void handle_conn(acl::socket_stream &conn);

	// @override
	void *run() override;
};

