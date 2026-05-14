#include "action_util.h"
#include <sys/stat.h>

namespace action {

bool make_dir(const char* path) {
	struct stat st;
	if (stat(path, &st) == 0) {
		return S_ISDIR(st.st_mode);
	}
	return mkdir(path, 0755) == 0;
}

bool sendHtml(response_t& res, const acl::string& html, bool keep_alive) {
	res.setContentType("text/html; charset=utf-8");
	res.setKeepAlive(keep_alive);
	res.setContentLength(html.size());
	return res.write(html) && res.write(NULL, 0);
}

bool sendText(response_t& res, int status, const char* text, bool keep_alive) {
	res.setStatus(status);
	res.setContentType("text/plain; charset=utf-8");
	res.setKeepAlive(keep_alive);
	res.setContentLength((long long) strlen(text));
	return res.write(text, strlen(text)) && res.write(NULL, 0);
}

bool sendJson(response_t& res, int status,
	const acl::json_node& json, bool keep_alive)
{
	const acl::string& text = json.to_string();
	return sendJson(res, status, text, keep_alive);
}

bool sendJson(response_t& res, int status,
	const acl::string& json, bool keep_alive)
{
	res.setStatus(status);
	res.setContentType("application/json; charset=utf-8");
	res.setKeepAlive(keep_alive);
	res.setContentLength((long long) json.size());
	return res.write(json) && res.write(NULL, 0);
}

} // namespace action
