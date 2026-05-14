#include "actions.h"
#include "action_util.h"
#include "../template/html_renderer.h"

namespace action {

bool IndexAction::run(request_t& req, response_t& res) {
	acl::string buf;
	if (!acl::ifstream::load("html/upload.html", &buf)) {
		return sendText(res, 500, "load html/upload.html failed\n",
			req.isKeepAlive());
	}

	return sendHtml(res, buf, req.isKeepAlive());
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
