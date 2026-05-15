#include "actions.h"
#include "action_util.h"
#include "../template/html_renderer.h"
#include <unistd.h>

namespace action {

namespace {

const char* resolve_index_html_path() {
	static const char* kCandidates[] = {
		"html/main.html",
		"webcool/html/main.html"
	};
	for (size_t i = 0; i < sizeof(kCandidates) / sizeof(kCandidates[0]); ++i) {
		if (access(kCandidates[i], R_OK) == 0) {
			return kCandidates[i];
		}
	}
	return NULL;
}

} // namespace

bool IndexAction::run(request_t& req, response_t& res) {
	acl::string buf;
	const char* html_path = resolve_index_html_path();
	if (html_path == NULL || !acl::ifstream::load(html_path, &buf)) {
		return sendText(res, 500, "load html/main.html failed\n",
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
