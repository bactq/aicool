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

} // namespace action
