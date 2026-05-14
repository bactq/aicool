#include "stdafx.h"
#include "http_servlet.h"
#include "action/actions.h"
#include "action/action_util.h"
#include <map>

namespace {

typedef bool (http_servlet::*get_route_handler)(request_t& req, response_t& res);

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

	static const std::map<std::string, get_route_handler> routes = {
		{ "/api/v1/admin/template/reload", &http_servlet::routeTemplateReload },
		{ "/api/v1/delete", &http_servlet::routeDelete },
		{ "/api/v1/files", &http_servlet::routeFiles },
		{ "/api/v1/download", &http_servlet::routeDownload },
		{ "/api/v1/video/convert", &http_servlet::routeVideoConvert },
		{ "/api/v1/upload", &http_servlet::routeUpload },
	};
	std::map<std::string, get_route_handler>::const_iterator it = routes.find(path);
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

bool http_servlet::routeFiles(request_t& req, response_t& res) {
	return action::FilesAction::run(req, res, upload_dir_);
}

bool http_servlet::routeDownload(request_t& req, response_t& res) {
	return action::DownloadAction::run(req, res, upload_dir_);
}

bool http_servlet::routeUpload(request_t& req, response_t& res) {
	return action::UploadAction::run(req, res, upload_dir_);
}

bool http_servlet::routeVideoConvert(request_t& req, response_t& res) {
	return action::VideoConvertAction::run(req, res, upload_dir_);
}

// ────────────────────────────────────────────────────────────────
// doPost
// ────────────────────────────────────────────────────────────────
bool http_servlet::doPost(request_t& req, response_t& res) {
	const char* path = req.getPathInfo();
	if (path && strcmp(path, "/api/v1/upload") == 0) {
		return action::UploadAction::run(req, res, upload_dir_);
	}
	if (path && strcmp(path, "/api/v1/video/convert") == 0) {
		return action::VideoConvertAction::run(req, res, upload_dir_);
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
