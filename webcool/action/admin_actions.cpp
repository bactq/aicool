#include "actions.h"
#include "action_util.h"

#include <dirent.h>
#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>

#include <mutex>
#include <string>
#include <thread>
#include <vector>

namespace action {
namespace {

std::mutex g_runtime_upload_mutex;
std::string g_runtime_upload_dir;

struct storage_move_item_t {
	std::string source;
	std::string target;
	bool directory;
	long long size;
};

struct storage_migrate_task_t {
	std::string id;
	std::string state;
	std::string message;
	std::string error;
	std::string source_dir;
	std::string target_dir;
	long long total_bytes;
	long long moved_bytes;
	int total_files;
	int moved_files;
};

std::mutex g_storage_migrate_mutex;
storage_migrate_task_t g_storage_migrate_task;
unsigned long long g_storage_migrate_seq = 0;

static void json_error(response_t& res, int status, const char* msg,
	bool keep_alive)
{
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", false);
	root.add_text("error", msg ? msg : "unknown error");
	sendJson(res, status, root, keep_alive);
}

static std::string make_task_id()
{
	std::lock_guard<std::mutex> guard(g_storage_migrate_mutex);
	++g_storage_migrate_seq;
	return std::string("storage-migrate-") + std::to_string((long long) time(NULL))
		+ "-" + std::to_string((long long) getpid())
		+ "-" + std::to_string((long long) g_storage_migrate_seq);
}

static void update_task(const storage_migrate_task_t& task)
{
	std::lock_guard<std::mutex> guard(g_storage_migrate_mutex);
	g_storage_migrate_task = task;
}

static bool canonical_existing_path(const std::string& input,
	std::string& out, std::string& err)
{
	char resolved[PATH_MAX];
	if (realpath(input.c_str(), resolved) == NULL) {
		err = strerror(errno);
		return false;
	}
	out = resolved;
	return true;
}

static bool ensure_storage_target_path(const std::string& input,
	std::string& out, std::string& err)
{
	if (input.empty() || input[0] != '/') {
		err = "target path must be absolute";
		return false;
	}
	if (!make_dir_recursive(input.c_str())) {
		err = "cannot create target storage path";
		return false;
	}
	return canonical_existing_path(input, out, err);
}

static bool is_same_or_child_path(const std::string& base,
	const std::string& candidate)
{
	if (base == candidate) {
		return true;
	}
	if (base == "/") {
		return !candidate.empty() && candidate[0] == '/';
	}
	return candidate.size() > base.size()
		&& candidate.compare(0, base.size(), base) == 0
		&& candidate[base.size()] == '/';
}

static bool collect_move_items(const std::string& source,
	const std::string& target, std::vector<storage_move_item_t>& items,
	std::string& err)
{
	DIR* dir = opendir(source.c_str());
	if (dir == NULL) {
		err = strerror(errno);
		return false;
	}
	struct dirent* entry = NULL;
	while ((entry = readdir(dir)) != NULL) {
		if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
			continue;
		}
		const std::string child_source = source + "/" + entry->d_name;
		const std::string child_target = target + "/" + entry->d_name;
		struct stat st;
		if (lstat(child_source.c_str(), &st) != 0) {
			err = strerror(errno);
			closedir(dir);
			return false;
		}
		struct stat target_st;
		if (lstat(child_target.c_str(), &target_st) == 0) {
			err = "target already contains: ";
			err += entry->d_name;
			closedir(dir);
			return false;
		}
		if (S_ISDIR(st.st_mode)) {
			storage_move_item_t dir_item;
			dir_item.source = child_source;
			dir_item.target = child_target;
			dir_item.directory = true;
			dir_item.size = 0;
			items.push_back(dir_item);
			if (!collect_move_items(child_source, child_target, items, err)) {
				closedir(dir);
				return false;
			}
		} else if (S_ISREG(st.st_mode)) {
			storage_move_item_t file_item;
			file_item.source = child_source;
			file_item.target = child_target;
			file_item.directory = false;
			file_item.size = (long long) st.st_size;
			items.push_back(file_item);
		}
	}
	closedir(dir);
	return true;
}

static bool copy_file_with_progress(const storage_move_item_t& item,
	storage_migrate_task_t& task, std::string& err)
{
	FILE* in = fopen(item.source.c_str(), "rb");
	if (in == NULL) {
		err = strerror(errno);
		return false;
	}
	FILE* out = fopen(item.target.c_str(), "wb");
	if (out == NULL) {
		err = strerror(errno);
		fclose(in);
		return false;
	}
	char buf[1024 * 64];
	bool ok = true;
	while (true) {
		const size_t n = fread(buf, 1, sizeof(buf), in);
		if (n > 0 && fwrite(buf, 1, n, out) != n) {
			err = strerror(errno);
			ok = false;
			break;
		}
		if (n > 0) {
			task.moved_bytes += (long long) n;
			update_task(task);
		}
		if (n < sizeof(buf)) {
			if (ferror(in)) {
				err = strerror(errno);
				ok = false;
			}
			break;
		}
	}
	if (fclose(out) != 0 && ok) {
		err = strerror(errno);
		ok = false;
	}
	fclose(in);
	if (!ok) {
		::unlink(item.target.c_str());
	}
	return ok;
}

static void remove_empty_dirs_reverse(const std::vector<storage_move_item_t>& items)
{
	for (std::vector<storage_move_item_t>::const_reverse_iterator it = items.rbegin();
		it != items.rend(); ++it)
	{
		if (it->directory) {
			(void) rmdir(it->source.c_str());
		}
	}
}

static void run_storage_migration(storage_migrate_task_t task,
	std::vector<storage_move_item_t> items)
{
	task.state = "running";
	task.message = "正在准备移动";
	update_task(task);

	std::string err;
	for (size_t i = 0; i < items.size(); ++i) {
		if (items[i].directory) {
			if (!make_dir_recursive(items[i].target.c_str())) {
				task.state = "failed";
				task.error = "cannot create target directory";
				update_task(task);
				return;
			}
			continue;
		}
		task.message = std::string("正在移动：") + items[i].source;
		update_task(task);
		if (!copy_file_with_progress(items[i], task, err)) {
			task.state = "failed";
			task.error = err;
			update_task(task);
			return;
		}
		if (::unlink(items[i].source.c_str()) != 0) {
			task.state = "failed";
			task.error = strerror(errno);
			update_task(task);
			return;
		}
		task.moved_files += 1;
		update_task(task);
	}

	remove_empty_dirs_reverse(items);

	std::string init_err;
	if (!init_video_resume_db(task.target_dir, init_err)
		|| !init_tag_db(task.target_dir, init_err)
		|| !init_recycle_bin_db(task.target_dir, init_err)
		|| !init_category_folder_db(task.target_dir, init_err))
	{
		task.state = "failed";
		task.error = init_err;
		update_task(task);
		return;
	}
	runtime_upload_dir_set(task.target_dir);
	task.state = "done";
	task.message = "移动完成";
	task.moved_bytes = task.total_bytes;
	update_task(task);
}

} // namespace

void runtime_upload_dir_init(const std::string& upload_dir)
{
	std::lock_guard<std::mutex> guard(g_runtime_upload_mutex);
	if (g_runtime_upload_dir.empty()) {
		g_runtime_upload_dir = upload_dir;
	}
}

std::string runtime_upload_dir_get()
{
	std::lock_guard<std::mutex> guard(g_runtime_upload_mutex);
	return g_runtime_upload_dir;
}

void runtime_upload_dir_set(const std::string& upload_dir)
{
	std::lock_guard<std::mutex> guard(g_runtime_upload_mutex);
	g_runtime_upload_dir = upload_dir;
}

bool AdminStorageInfoAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", upload_dir.c_str());
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool AdminStorageMigrateAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string source_dir, target_dir, err;
	if (!canonical_existing_path(upload_dir, source_dir, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!ensure_storage_target_path(req.getParameter("path") ? req.getParameter("path") : "",
		target_dir, err))
	{
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (source_dir == target_dir) {
		json_error(res, 409, "target path is current storage path", req.isKeepAlive());
		return true;
	}
	if (is_same_or_child_path(source_dir, target_dir)) {
		json_error(res, 409, "target path cannot be inside current storage path", req.isKeepAlive());
		return true;
	}
	{
		std::lock_guard<std::mutex> guard(g_storage_migrate_mutex);
		if (g_storage_migrate_task.state == "queued"
			|| g_storage_migrate_task.state == "running")
		{
			json_error(res, 409, "storage migration is already running", req.isKeepAlive());
			return true;
		}
	}

	std::vector<storage_move_item_t> items;
	if (!collect_move_items(source_dir, target_dir, items, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	storage_migrate_task_t task;
	task.id = make_task_id();
	task.state = "queued";
	task.message = "等待移动";
	task.source_dir = source_dir;
	task.target_dir = target_dir;
	task.total_bytes = 0;
	task.moved_bytes = 0;
	task.total_files = 0;
	task.moved_files = 0;
	for (size_t i = 0; i < items.size(); ++i) {
		if (!items[i].directory) {
			task.total_files += 1;
			task.total_bytes += items[i].size;
		}
	}
	update_task(task);
	std::thread(run_storage_migration, task, items).detach();

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("task_id", task.id.c_str());
	root.add_number("total_files", task.total_files);
	root.add_number("total_bytes", task.total_bytes);
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool AdminStorageMigrateProgressAction::run(request_t& req, response_t& res)
{
	storage_migrate_task_t task;
	{
		std::lock_guard<std::mutex> guard(g_storage_migrate_mutex);
		task = g_storage_migrate_task;
	}
	const char* task_id = req.getParameter("task_id");
	if (task_id != NULL && *task_id != '\0' && task.id != task_id) {
		json_error(res, 404, "task not found", req.isKeepAlive());
		return true;
	}
	const double progress = task.total_bytes > 0
		? ((double) task.moved_bytes * 100.0 / (double) task.total_bytes)
		: (task.state == "done" ? 100.0 : 0.0);
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("task_id", task.id.c_str());
	root.add_text("state", task.state.c_str());
	root.add_text("message", task.message.c_str());
	root.add_text("error", task.error.c_str());
	root.add_text("source_dir", task.source_dir.c_str());
	root.add_text("target_dir", task.target_dir.c_str());
	root.add_number("progress", progress);
	root.add_number("total_bytes", task.total_bytes);
	root.add_number("moved_bytes", task.moved_bytes);
	root.add_number("total_files", task.total_files);
	root.add_number("moved_files", task.moved_files);
	return sendJson(res, 200, root, req.isKeepAlive());
}

} // namespace action
