#include "actions.h"
#include "action_util.h"
#include "../template/html_renderer.h"
#ifdef _WIN32
#include "../platform_compat.h"
#else
#include <unistd.h>
#endif

namespace action {

namespace {

static std::string html_home = "/opt/webcool/html";

const char* get_index_html_path(acl::string& buff) {
	buff = html_home;
	buff += "/main.html";
	return buff.c_str();
}

const char* get_static_file_path(const char* path, acl::string& buff,
	  std::string& ctype) {
	buff.clear();

	acl::string tmp = path;
	static char static_prefix[] = "/webcool/html";
	char *pos = tmp.find(static_prefix);
	if (pos == nullptr) {
		return NULL;
	}
	pos += sizeof(static_prefix) - 1;
	acl::string relative_path = pos;
	relative_path.strip(".."); // Sanity check, to avoid access the root path.

	buff  = html_home;
	if (*pos != '/') {
		buff += '/';
	}
	buff += relative_path;

	static std::map<std::string, std::string> types = {
		{ ".text", "text/plain; charset=utf-8"              },
		{ ".txt",  "text/plain; charset=utf-8"              },
		{ ".html", "text/html; charset=utf-8"              },
		{ ".js",   "application/javascript; charset=utf-8" },
		{ ".css",  "text/css; charset=utf-8"               },
		{ ".png",  "image/png"                             },
		{ ".jpg",  "image/jpg"                             },
		{ ".gif",  "image/gif"                             },
	};

	pos = buff.rfind(".");
	if (pos == nullptr) {
		ctype = "application/octet-stream";
	} else {
		const auto it = types.find(pos);
		if (it == types.end()) {
			ctype = "application/octet-stream";
		} else {
			ctype = it->second.c_str();
		}
	}

	return buff.c_str();
}

} // namespace

void IndexAction::set_static_home_path(const char* html_home_path) {
	if (html_home_path != NULL && *html_home_path != '\0') {
		html_home = html_home_path;
	}
}

bool IndexAction::run(request_t& req, response_t& res) {
	const char* path = req.getPathInfo();
	const char* filepath = nullptr;
	std::string ctype = "text/html";
	acl::string buff;
	if (path == nullptr || *path == 0 || strcmp(path, "/") == 0) {
		filepath = get_index_html_path(buff);
	} else {
		filepath = get_static_file_path(path, buff, ctype);
	}

	logger_debug(DEBUG_PAGE, 1, "path=%s, filepath=%s\r\n", path, filepath);

	acl::string data;
	if (filepath == NULL || !acl::ifstream::load(filepath, &data)) {
		buff.format("load %s failed(%s)\r\n", path, acl::last_serror());
		return sendText(res, 500, buff.c_str(), req.isKeepAlive());
	}

	return sendData(res, data, ctype.c_str(), req.isKeepAlive());
}

bool TemplateReloadAction::run(request_t& req, response_t& res) {
	tpl::html_renderer::clear_cache();
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("message", "template cache cleared");
	return sendJson(res, 200, root, req.isKeepAlive());
}

} // namespace action
