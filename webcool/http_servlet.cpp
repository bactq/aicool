#include "stdafx.h"
#include "http_servlet.h"
#include "action/actions.h"
#include "action/action_util.h"
#include <map>
#include <unistd.h>

namespace {

typedef bool (http_servlet::*route_handler)(request_t& req, response_t& res);

const char* resolve_static_file_path(const char* local_path,
	const char* workspace_path)
{
	static thread_local acl::string resolved;
	if (local_path != NULL && access(local_path, R_OK) == 0) {
		resolved.clear();
		resolved = local_path;
		return resolved.c_str();
	}
	if (workspace_path != NULL && access(workspace_path, R_OK) == 0) {
		resolved.clear();
		resolved = workspace_path;
		return resolved.c_str();
	}
	resolved.clear();
	return NULL;
}

bool send_static_file(const char* file_path, const char* content_type,
	request_t& req, response_t& res)
{
	acl::string body;
	if (!acl::ifstream::load(file_path, &body)) {
		return false;
	}

	res.setStatus(200);
	res.setContentType(content_type);
	res.setKeepAlive(req.isKeepAlive());
	res.setContentLength((long long) body.size());
	return res.write(body) && res.write(NULL, 0);
}

bool try_route_static_asset(const char* path, request_t& req, response_t& res) {
	if (path == NULL || *path == '\0') {
		return false;
	}

	if (strcmp(path, "/webcool/html/main.css") == 0
		|| strcmp(path, "/html/main.css") == 0
		|| strcmp(path, "/main.css") == 0)
	{
		const char* file_path = resolve_static_file_path("html/main.css",
			"webcool/html/main.css");
		return file_path != NULL
			? send_static_file(file_path, "text/css; charset=utf-8", req, res)
			: false;
	}

	if (strcmp(path, "/webcool/html/main.js") == 0
		|| strcmp(path, "/html/main.js") == 0
		|| strcmp(path, "/main.js") == 0)
	{
		const char* file_path = resolve_static_file_path("html/main.js",
			"webcool/html/main.js");
		return file_path != NULL
			? send_static_file(file_path, "application/javascript; charset=utf-8", req, res)
			: false;
	}

	return false;
}

} // namespace

// ────────────────────────────────────────────────────────────────
// 构造 / 析构
// ────────────────────────────────────────────────────────────────
http_servlet::http_servlet(acl::socket_stream* stream,
	acl::session* session, const char* upload_dir)
: acl::HttpServlet(stream, session)
, upload_dir_(upload_dir)
{
}

http_servlet::~http_servlet() {}

// ────────────────────────────────────────────────────────────────
// doGet：路由分发
// ────────────────────────────────────────────────────────────────
bool http_servlet::doGet(request_t& req, response_t& res) {
	const char* path = req.getPathInfo();
	if (path == NULL || *path == '\0') {
		return action::IndexAction::run(req, res);
	}
	if (strcmp(path, "/") == 0) {
		return action::IndexAction::run(req, res);
	}

	if (try_route_static_asset(path, req, res)) {
		return true;
	}

	static const std::map<std::string, route_handler> routes = {
		{ "/api/v1/admin/template/reload", &http_servlet::routeTemplateReload },
		{ "/api/v1/delete", &http_servlet::routeDelete },
		{ "/api/v1/restore", &http_servlet::routeRestore },
		{ "/api/v1/files/move", &http_servlet::routeMoveFile },
		{ "/api/v1/files", &http_servlet::routeFiles },
		{ "/api/v1/download", &http_servlet::routeDownload },
		{ "/api/v1/local-disk/list", &http_servlet::routeLocalDiskList },
		{ "/api/v1/local-disk/download", &http_servlet::routeLocalDiskDownload },
		{ "/api/v1/local-disk/delete", &http_servlet::routeLocalDiskDelete },
		{ "/api/v1/video/convert", &http_servlet::routeVideoConvert },
		{ "/api/v1/video/convert/cancel", &http_servlet::routeVideoConvertCancel },
		{ "/api/v1/video/convert/progress", &http_servlet::routeVideoConvertProgress },
		{ "/api/v1/video/convert/tasks", &http_servlet::routeVideoConvertTasks },
		{ "/api/v1/video/probe", &http_servlet::routeVideoProbe },
		{ "/api/v1/video/resume", &http_servlet::routeVideoResumeGet },
		{ "/api/v1/video/resume/save", &http_servlet::routeVideoResumeSet },
		{ "/api/v1/folders", &http_servlet::routeFolderList },
		{ "/api/v1/folders/create", &http_servlet::routeFolderCreate },
		{ "/api/v1/folders/rename", &http_servlet::routeFolderRename },
		{ "/api/v1/folders/move", &http_servlet::routeFolderMove },
		{ "/api/v1/folders/delete", &http_servlet::routeFolderDelete },
		{ "/api/v1/folders/lock", &http_servlet::routeFolderLock },
		{ "/api/v1/folders/unlock", &http_servlet::routeFolderUnlock },
		{ "/api/v1/folders/lock/verify", &http_servlet::routeFolderLockVerify },
		{ "/api/v1/tags", &http_servlet::routeTagList },
		{ "/api/v1/tags/rename", &http_servlet::routeTagRename },
		{ "/api/v1/tag-files", &http_servlet::routeTagFiles },
		{ "/api/v1/upload", &http_servlet::routeUpload },
	};
	std::map<std::string, route_handler>::const_iterator it = routes.find(path);
	if (it == routes.end()) {
		return action::IndexAction::run(req, res);
	}

	return (this->*(it->second))(req, res);
}

bool http_servlet::routeTemplateReload(request_t& req, response_t& res) {
	return action::TemplateReloadAction::run(req, res);
}

bool http_servlet::routeDelete(request_t& req, response_t& res) {
	return action::DeleteAction::run(req, res, upload_dir_);
}

bool http_servlet::routeRestore(request_t& req, response_t& res) {
	return action::RestoreAction::run(req, res, upload_dir_);
}

bool http_servlet::routeMoveFile(request_t& req, response_t& res) {
	return action::MoveFileAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFiles(request_t& req, response_t& res) {
	return action::FilesAction::run(req, res, upload_dir_);
}

bool http_servlet::routeDownload(request_t& req, response_t& res) {
	return action::DownloadAction::run(req, res, upload_dir_);
}

bool http_servlet::routeLocalDiskList(request_t& req, response_t& res) {
	return action::LocalDiskListAction::run(req, res);
}

bool http_servlet::routeLocalDiskDownload(request_t& req, response_t& res) {
	return action::LocalDiskDownloadAction::run(req, res);
}

bool http_servlet::routeLocalDiskDelete(request_t& req, response_t& res) {
	return action::LocalDiskDeleteAction::run(req, res);
}

bool http_servlet::routeUpload(request_t& req, response_t& res) {
	return action::UploadAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoConvert(request_t& req, response_t& res) {
	return action::VideoConvertAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoConvertProgress(request_t& req, response_t& res) {
	return action::VideoConvertProgressAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoConvertTasks(request_t& req, response_t& res) {
	return action::VideoConvertTasksAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoConvertCancel(request_t& req, response_t& res) {
	return action::VideoConvertCancelAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoProbe(request_t& req, response_t& res) {
	return action::VideoProbeAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoResumeGet(request_t& req, response_t& res) {
	return action::VideoResumeGetAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoResumeSet(request_t& req, response_t& res) {
	return action::VideoResumeSetAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderList(request_t& req, response_t& res) {
	return action::FolderListAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderCreate(request_t& req, response_t& res) {
	return action::FolderCreateAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderRename(request_t& req, response_t& res) {
	return action::FolderRenameAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderMove(request_t& req, response_t& res) {
	return action::FolderMoveAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderDelete(request_t& req, response_t& res) {
	return action::FolderDeleteAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderLock(request_t& req, response_t& res) {
	return action::FolderLockAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderUnlock(request_t& req, response_t& res) {
	return action::FolderUnlockAction::run(req, res, upload_dir_);
}

bool http_servlet::routeFolderLockVerify(request_t& req, response_t& res) {
	return action::FolderLockVerifyAction::run(req, res, upload_dir_);
}

bool http_servlet::routeTagList(request_t& req, response_t& res) {
	return action::TagListAction::run(req, res, upload_dir_);
}

bool http_servlet::routeTagCreate(request_t& req, response_t& res) {
	return action::TagCreateAction::run(req, res, upload_dir_);
}

bool http_servlet::routeTagRename(request_t& req, response_t& res) {
	return action::TagRenameAction::run(req, res, upload_dir_);
}

bool http_servlet::routeTagDelete(request_t& req, response_t& res) {
	return action::TagDeleteAction::run(req, res, upload_dir_);
}

bool http_servlet::routeTagBind(request_t& req, response_t& res) {
	return action::TagBindAction::run(req, res, upload_dir_);
}

bool http_servlet::routeTagUnbind(request_t& req, response_t& res) {
	return action::TagUnbindAction::run(req, res, upload_dir_);
}

bool http_servlet::routeTagFiles(request_t& req, response_t& res) {
	return action::TagFilesAction::run(req, res, upload_dir_);
}

// ────────────────────────────────────────────────────────────────
// doPost
// ────────────────────────────────────────────────────────────────
bool http_servlet::doPost(request_t& req, response_t& res) {
	const char* path = req.getPathInfo();
	static const std::map<std::string, route_handler> routes = {
		{ "/api/v1/upload", &http_servlet::routeUpload },
		{ "/api/v1/restore", &http_servlet::routeRestore },
		{ "/api/v1/files/move", &http_servlet::routeMoveFile },
		{ "/api/v1/video/convert", &http_servlet::routeVideoConvert },
		{ "/api/v1/video/convert/cancel", &http_servlet::routeVideoConvertCancel },
		{ "/api/v1/video/convert/progress", &http_servlet::routeVideoConvertProgress },
		{ "/api/v1/video/convert/tasks", &http_servlet::routeVideoConvertTasks },
		{ "/api/v1/video/probe", &http_servlet::routeVideoProbe },
		{ "/api/v1/video/resume/save", &http_servlet::routeVideoResumeSet },
		{ "/api/v1/folders/create", &http_servlet::routeFolderCreate },
		{ "/api/v1/folders/rename", &http_servlet::routeFolderRename },
		{ "/api/v1/folders/move", &http_servlet::routeFolderMove },
		{ "/api/v1/folders/delete", &http_servlet::routeFolderDelete },
		{ "/api/v1/folders/lock", &http_servlet::routeFolderLock },
		{ "/api/v1/folders/unlock", &http_servlet::routeFolderUnlock },
		{ "/api/v1/folders/lock/verify", &http_servlet::routeFolderLockVerify },
		{ "/api/v1/local-disk/delete", &http_servlet::routeLocalDiskDelete },
		{ "/api/v1/tags/create", &http_servlet::routeTagCreate },
		{ "/api/v1/tags/rename", &http_servlet::routeTagRename },
		{ "/api/v1/tags/delete", &http_servlet::routeTagDelete },
		{ "/api/v1/tags/bind", &http_servlet::routeTagBind },
		{ "/api/v1/tags/unbind", &http_servlet::routeTagUnbind },
	};
	if (path != NULL) {
		std::map<std::string, route_handler>::const_iterator it = routes.find(path);
		if (it != routes.end()) {
			return (this->*(it->second))(req, res);
		}
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", false);
	root.add_text("error", "unsupported api path");
	return action::sendJson(res, 404, root, req.isKeepAlive());
}

// ────────────────────────────────────────────────────────────────
// doError
// ────────────────────────────────────────────────────────────────
bool http_servlet::doError(request_t&, response_t& res) {
	res.setStatus(400);
	res.setContentType("text/plain; charset=utf-8");
	const char* msg = "400 Bad Request\r\n";
	res.setContentLength(strlen(msg));
	res.write(msg, strlen(msg));
	res.write(NULL, 0);
	return false;
}
