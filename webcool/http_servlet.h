#pragma once
#include "stdafx.h"
#include <string>

/**
 * HTTP 文件上传处理 Servlet
 *
 * 支持：
 *  - GET /                    : 返回前端页面
 *  - GET /api/v1/files           : 返回已上传文件 JSON 列表
 *  - GET /api/v1/download?file=  : 下载文件（二进制）
 *  - GET /api/v1/delete?file=    : 删除文件，返回 JSON
 *  - GET /api/v1/admin/template/reload : 清空模板缓存，返回 JSON
 *  - POST /api/v1/upload         : multipart 上传，返回 JSON
 */
class http_servlet : public acl::HttpServlet {
public:
	http_servlet(acl::socket_stream* stream, acl::session* session,
		const char* upload_dir);
	~http_servlet();

protected:
	// @override
	bool doGet(request_t& req, response_t& res);

	// @override
	bool doPost(request_t& req, response_t& res);

	// @override
	bool doError(request_t& req, response_t& res);

private:
	std::string upload_dir_;

	bool routeTemplateReload(request_t& req, response_t& res);
	bool routeDelete(request_t& req, response_t& res);
	bool routeRestore(request_t& req, response_t& res);
	bool routeMoveFile(request_t& req, response_t& res);
	bool routeFiles(request_t& req, response_t& res);
	bool routeDownload(request_t& req, response_t& res);
	bool routeLocalDiskList(request_t& req, response_t& res);
	bool routeLocalDiskDownload(request_t& req, response_t& res);
	bool routeVideoConvert(request_t& req, response_t& res);
	bool routeVideoConvertProgress(request_t& req, response_t& res);
	bool routeVideoConvertTasks(request_t& req, response_t& res);
	bool routeVideoConvertCancel(request_t& req, response_t& res);
	bool routeVideoProbe(request_t& req, response_t& res);
	bool routeVideoResumeGet(request_t& req, response_t& res);
	bool routeVideoResumeSet(request_t& req, response_t& res);
	bool routeFolderList(request_t& req, response_t& res);
	bool routeFolderCreate(request_t& req, response_t& res);
	bool routeFolderRename(request_t& req, response_t& res);
	bool routeFolderMove(request_t& req, response_t& res);
	bool routeFolderDelete(request_t& req, response_t& res);
	bool routeFolderLock(request_t& req, response_t& res);
	bool routeFolderUnlock(request_t& req, response_t& res);
	bool routeFolderLockVerify(request_t& req, response_t& res);
	bool routeTagList(request_t& req, response_t& res);
	bool routeTagCreate(request_t& req, response_t& res);
	bool routeTagRename(request_t& req, response_t& res);
	bool routeTagDelete(request_t& req, response_t& res);
	bool routeTagBind(request_t& req, response_t& res);
	bool routeTagUnbind(request_t& req, response_t& res);
	bool routeUpload(request_t& req, response_t& res);
	bool routeTagFiles(request_t& req, response_t& res);
};
