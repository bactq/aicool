#pragma once

#include "actions.h"

#include <string>

namespace action {

bool make_dir(const char* path);
bool make_dir_recursive(const char* path);

bool normalize_relative_path(const char* input, std::string& normalized,
	std::string& err, bool allow_empty = false);

std::string join_upload_path(const std::string& upload_dir,
	const std::string& relative_path);

std::string parent_relative_path(const std::string& relative_path);

std::string base_name_from_relative_path(const std::string& relative_path);

bool upload_regular_file_exists(const std::string& upload_dir,
	const std::string& relative_path);

bool upload_directory_exists(const std::string& upload_dir,
	const std::string& relative_path);

const char* recycle_folder_name();

bool is_recycle_root_path(const std::string& relative_path);

bool is_recycle_file_path(const std::string& relative_path);

bool sendHtml(response_t& res, const acl::string& html,
	bool keep_alive = true);

bool sendText(response_t& res, int status, const char* text,
	bool keep_alive = true);

bool sendJson(response_t& res, int status, const acl::json_node& json,
	bool keep_alive = true);

bool sendJson(response_t& res, int status, const acl::string& json,
	bool keep_alive = true);

std::string choose_sqlite_lib_path();
std::string choose_ffmpeg_path();

struct remote_copy_task_snapshot_t {
	std::string id;
	std::string state;
	std::string message;
	std::string error;
	std::string source;
	std::string target;
	std::string path;
	long long total_bytes;
	long long copied_bytes;
	bool directory;
	bool cancel_requested;
};

std::string start_remote_copy_task(const std::string& source_full,
	const std::string& target_full, const std::string& path,
	bool directory);

bool remote_copy_task_snapshot(const std::string& task_id,
	remote_copy_task_snapshot_t& snapshot);

bool remote_copy_task_cancel(const std::string& task_id,
	remote_copy_task_snapshot_t& snapshot);

} // namespace action
