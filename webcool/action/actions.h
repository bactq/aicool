#pragma once

#include "../stdafx.h"
#include <string>

namespace action {

typedef ::request_t request_t;
typedef ::response_t response_t;

bool init_video_resume_db(const std::string& upload_dir, std::string& err);

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

class DownloadAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);
};

class UploadAction {
public:
	static bool run(request_t& req, response_t& res,
		const std::string& upload_dir);

private:
	static bool readBody(request_t& req, long long content_length,
		acl::ofstream& fp, acl::http_mime& mime);

	static bool saveFiles(acl::http_mime& mime, const std::string& upload_dir,
		acl::json_node& files_array, int& saved_count);
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

} // namespace action
