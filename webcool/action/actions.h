#pragma once

#include "../stdafx.h"
#include <map>
#include <string>

namespace action {

typedef ::request_t request_t;
typedef ::response_t response_t;

bool init_video_resume_db(const std::string& upload_dir, std::string& err);
bool init_category_folder_db(const std::string& upload_dir, std::string& err);
bool init_tag_db(const std::string& upload_dir, std::string& err);
bool init_recycle_bin_db(const std::string& upload_dir, std::string& err);
bool folder_lock_path_allows(const std::string& upload_dir,
	const std::string& relative_path, const std::string& password,
	bool& allowed, std::string& locked_path, std::string& err);
bool folder_lock_path_has_lock(const std::string& upload_dir,
	const std::string& relative_path, bool& locked, std::string& err);
bool folder_bind_file(const std::string& upload_dir, const std::string& file_name,
	long long folder_id, std::string& err);
bool folder_unbind_file(const std::string& upload_dir,
	const std::string& file_name, std::string& err);
bool tag_unbind_file(const std::string& upload_dir,
	const std::string& file_name, std::string& err);
bool tag_rename_file(const std::string& upload_dir,
	const std::string& old_file_name, const std::string& new_file_name,
	std::string& err);
bool tag_rename_folder_prefix(const std::string& upload_dir,
	const std::string& old_prefix, const std::string& new_prefix,
	std::string& err);
bool video_resume_rename_file(const std::string& upload_dir,
	const std::string& old_file_name, const std::string& new_file_name,
	std::string& err);
bool video_resume_rename_folder_prefix(const std::string& upload_dir,
	const std::string& old_prefix, const std::string& new_prefix,
	std::string& err);
bool folder_load_file_bindings(const std::string& upload_dir,
	std::map<std::string, long long>& file_to_folder_id,
	std::map<long long, std::string>& folder_id_to_name,
	std::string& err);

class IndexAction {
public:
	static bool run(request_t& req, response_t& res);
};

class TemplateReloadAction {
public:
	static bool run(request_t& req, response_t& res);
};

class FilesAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class DeleteAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class RestoreAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class MoveFileAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class DownloadAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class LocalDiskListAction {
public:
	static bool run(request_t& req, response_t& res);
};

class LocalDiskDownloadAction {
public:
	static bool run(request_t& req, response_t& res);
};

class UploadAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);

private:
	static bool readBody(request_t& req, long long content_length,
		acl::ofstream& fp, acl::http_mime& mime);

	static bool saveFiles(acl::http_mime& mime, const std::string& upload_dir,
		acl::json_node& files_array, int& saved_count,
		const std::string& folder_path);
};

class VideoConvertAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class VideoConvertProgressAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class VideoConvertTasksAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class VideoConvertCancelAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class VideoProbeAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class VideoResumeGetAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class VideoResumeSetAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderListAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderCreateAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderRenameAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderMoveAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderDeleteAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderLockAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderUnlockAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class FolderLockVerifyAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class TagListAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class TagCreateAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class TagRenameAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class TagDeleteAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class TagBindAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class TagUnbindAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class TagFilesAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

} // namespace action
