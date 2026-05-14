#pragma once

#include "actions.h"

namespace action {

bool make_dir(const char* path);

bool sendHtml(response_t& res, const acl::string& html,
	bool keep_alive = true);

bool sendText(response_t& res, int status, const char* text,
	bool keep_alive = true);

bool sendJson(response_t& res, int status, const acl::json_node& json,
	bool keep_alive = true);

bool sendJson(response_t& res, int status, const acl::string& json,
	bool keep_alive = true);

} // namespace action
