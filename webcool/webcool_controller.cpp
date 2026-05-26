#include "stdafx.h"
#include "config.h"
#include "action/action_util.h"
#include "server_thread.h"
#include "webcool_controller.h"

webcool_controller::webcool_controller(const webcool_options& options)
: options_(options), server_(nullptr), running_(false) {
}

webcool_controller::~webcool_controller() {
	stop();
}

bool webcool_controller::start(std::string& err) {
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

void webcool_controller::stop() {
	std::lock_guard<std::mutex> guard(mutex_);
	stop_locked();
}

void webcool_controller::wait() {
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

bool webcool_controller::running() const {
	std::lock_guard<std::mutex> guard(mutex_);
	return running_;
}

void webcool_controller::configure(const webcool_options& options) {
	std::lock_guard<std::mutex> guard(mutex_);
	if (!running_) {
		options_ = options;
	}
}

const webcool_options &webcool_controller::options() const {
	return options_;
}

bool webcool_controller::prepare_runtime(std::string& err) {
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
		std::string html_home = normalize_static_home_path(g_html_home);
		const std::string index_html = join_config_path(html_home, "main.html");
		if (!readable_regular_file(index_html)) {
			err = "静态资源根目录无效，无法读取: " + index_html;
			return false;
		}
		if (!set_config_text(g_html_home, sizeof(g_html_home),
			html_home, "static resource root directory", err))
		{
			return false;
		}
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

void webcool_controller::stop_locked() {
	if (!running_ && threads_.empty() && server_ == nullptr) {
		return;
	}

	g_service_stopping.store(true);
	for (size_t i = 0; i < threads_.size(); ++i) {
		threads_[i]->stop();
	}
	for (size_t i = 0; i < threads_.size(); ++i) {
		threads_[i]->wait();
		delete threads_[i];
	}
	threads_.clear();

	if (server_ != nullptr) {
		server_->close();
		delete server_;
		server_ = nullptr;
	}
	running_ = false;
	g_service_stopping.store(false);
}

