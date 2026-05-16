#include "action_util.h"

#include <sys/stat.h>

#include <string>

namespace action {

namespace {

static const char* kRecycleFolderName = "回收站";

} // namespace

bool make_dir(const char* path) {
	struct stat st;
	if (stat(path, &st) == 0) {
		return S_ISDIR(st.st_mode);
	}
	return mkdir(path, 0755) == 0;
}

bool make_dir_recursive(const char* path) {
	if (path == NULL || *path == '\0') {
		return false;
	}
	if (make_dir(path)) {
		return true;
	}

	std::string text(path);
	if (text.empty()) {
		return false;
	}

	if (text[text.size() - 1] == '/') {
		text.erase(text.size() - 1);
	}
	if (text.empty()) {
		return false;
	}

	std::string current;
	if (text[0] == '/') {
		current = "/";
	}

	for (size_t i = (text[0] == '/') ? 1 : 0; i <= text.size(); ++i) {
		if (i < text.size() && text[i] != '/') {
			current.push_back(text[i]);
			continue;
		}
		if (!current.empty() && current != "/" && !make_dir(current.c_str())) {
			return false;
		}
		if (i < text.size()) {
			current.push_back('/');
		}
	}

	return make_dir(path);
}

bool normalize_relative_path(const char* input, std::string& normalized,
	std::string& err, bool allow_empty)
{
	normalized.clear();
	err.clear();

	std::string text = input ? input : "";
	for (size_t i = 0; i < text.size(); ++i) {
		if (text[i] == '\\') {
			text[i] = '/';
		}
	}

	while (!text.empty() && text[0] == ' ') {
		text.erase(0, 1);
	}
	while (!text.empty() && text[text.size() - 1] == ' ') {
		text.erase(text.size() - 1);
	}

	if (text.empty()) {
		if (allow_empty) {
			return true;
		}
		err = "path is empty";
		return false;
	}
	if (text[0] == '/') {
		err = "absolute path is not allowed";
		return false;
	}

	std::string segment;
	for (size_t i = 0; i <= text.size(); ++i) {
		const bool at_end = i == text.size();
		const char ch = at_end ? '/' : text[i];
		if (ch != '/') {
			unsigned char c = (unsigned char) ch;
			if (c < 32 || c == 127) {
				err = "path contains control character";
				return false;
			}
			segment.push_back(ch);
			continue;
		}

		if (segment.empty()) {
			err = "path contains empty segment";
			return false;
		}
		if (segment == "." || segment == "..") {
			err = "path contains invalid segment";
			return false;
		}
		if (!normalized.empty()) {
			normalized.push_back('/');
		}
		normalized.append(segment);
		segment.clear();
	}

	return true;
}

std::string join_upload_path(const std::string& upload_dir,
	const std::string& relative_path)
{
	if (relative_path.empty()) {
		return upload_dir;
	}
	return upload_dir + "/" + relative_path;
}

std::string parent_relative_path(const std::string& relative_path) {
	if (relative_path.empty()) {
		return std::string();
	}
	std::string::size_type pos = relative_path.rfind('/');
	if (pos == std::string::npos) {
		return std::string();
	}
	return relative_path.substr(0, pos);
}

std::string base_name_from_relative_path(const std::string& relative_path) {
	if (relative_path.empty()) {
		return std::string();
	}
	std::string::size_type pos = relative_path.rfind('/');
	if (pos == std::string::npos) {
		return relative_path;
	}
	return relative_path.substr(pos + 1);
}

bool upload_regular_file_exists(const std::string& upload_dir,
	const std::string& relative_path)
{
	if (relative_path.empty()) {
		return false;
	}
	struct stat st;
	std::string full = join_upload_path(upload_dir, relative_path);
	return stat(full.c_str(), &st) == 0 && S_ISREG(st.st_mode);
}

bool upload_directory_exists(const std::string& upload_dir,
	const std::string& relative_path)
{
	struct stat st;
	std::string full = join_upload_path(upload_dir, relative_path);
	return stat(full.c_str(), &st) == 0 && S_ISDIR(st.st_mode);
}

const char* recycle_folder_name() {
	return kRecycleFolderName;
}

bool is_recycle_root_path(const std::string& relative_path) {
	return relative_path == recycle_folder_name();
}

bool is_recycle_file_path(const std::string& relative_path) {
	if (is_recycle_root_path(relative_path)) {
		return true;
	}
	const std::string prefix = std::string(recycle_folder_name()) + "/";
	return relative_path.size() > prefix.size()
		&& relative_path.compare(0, prefix.size(), prefix) == 0;
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
