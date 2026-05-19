#include "actions.h"
#include "action_util.h"

#include <dirent.h>
#include <errno.h>
#include <limits.h>
#include <string.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>

#include <algorithm>
#include <stdlib.h>
#include <string>
#include <vector>

namespace action {

namespace {

struct local_entry_t {
	std::string name;
	std::string path;
	bool directory;
	bool empty_directory;
	long long size;
	long long modified_at;
	std::string modified_time;
};

static void json_error(response_t& res, int status, const char* msg,
	bool keep_alive)
{
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", false);
	root.add_text("error", msg ? msg : "unknown error");
	sendJson(res, status, root, keep_alive);
}

static bool normalize_local_path(const char* input, std::string& out,
	std::string& err)
{
	err.clear();
	const char* home = getenv("HOME");
	std::string text = input && *input ? input : (home && *home ? home : "/");
	if (text[0] != '/') {
		err = "absolute path is required";
		return false;
	}

	char resolved[PATH_MAX];
	if (realpath(text.c_str(), resolved) == NULL) {
		err = strerror(errno);
		return false;
	}
	out = resolved;
	return true;
}

static std::string current_home_path() {
	const char* home = getenv("HOME");
	if (home == NULL || *home == '\0') {
		return "/";
	}
	char resolved[PATH_MAX];
	if (realpath(home, resolved) == NULL) {
		return home;
	}
	return resolved;
}

static std::string parent_path(const std::string& path) {
	if (path.empty() || path == "/") {
		return "/";
	}
	std::string text = path;
	while (text.size() > 1 && text[text.size() - 1] == '/') {
		text.erase(text.size() - 1);
	}
	std::string::size_type pos = text.rfind('/');
	if (pos == std::string::npos || pos == 0) {
		return "/";
	}
	return text.substr(0, pos);
}

static std::string join_local_path(const std::string& parent,
	const char* name)
{
	if (parent == "/") {
		return std::string("/") + name;
	}
	return parent + "/" + name;
}

static std::string local_base_name(const std::string& path) {
	if (path.empty() || path == "/") {
		return "";
	}
	std::string text = path;
	while (text.size() > 1 && text[text.size() - 1] == '/') {
		text.erase(text.size() - 1);
	}
	std::string::size_type pos = text.rfind('/');
	return pos == std::string::npos ? text : text.substr(pos + 1);
}

static bool is_same_or_child_path(const std::string& base,
	const std::string& candidate)
{
	if (base == candidate) {
		return true;
	}
	if (base == "/") {
		return !candidate.empty() && candidate[0] == '/';
	}
	return candidate.size() > base.size()
		&& candidate.compare(0, base.size(), base) == 0
		&& candidate[base.size()] == '/';
}

static bool is_system_level_directory_path(const std::string& path)
{
	static const char* protected_paths[] = {
		"/",
		"/Applications",
		"/Library",
		"/System",
		"/Users",
		"/Volumes",
		"/bin",
		"/boot",
		"/dev",
		"/etc",
		"/home",
		"/lib",
		"/lib64",
		"/opt",
		"/private",
		"/private/etc",
		"/private/tmp",
		"/private/var",
		"/proc",
		"/root",
		"/run",
		"/sbin",
		"/sys",
		"/tmp",
		"/usr",
		"/var",
	};
	for (size_t i = 0; i < sizeof(protected_paths) / sizeof(protected_paths[0]); ++i) {
		if (path == protected_paths[i]) {
			return true;
		}
	}
	return false;
}

static bool validate_local_name(const std::string& name, std::string& err) {
	err.clear();
	if (name.empty()) {
		err = "directory name is empty";
		return false;
	}
	if (name == "." || name == "..") {
		err = "invalid directory name";
		return false;
	}
	if (name.size() > 120) {
		err = "directory name is too long";
		return false;
	}
	for (size_t i = 0; i < name.size(); ++i) {
		unsigned char c = (unsigned char) name[i];
		if (c < 32 || c == 127) {
			err = "directory name contains control character";
			return false;
		}
		if (name[i] == '/' || name[i] == '\\') {
			err = "directory name cannot contain slash";
			return false;
		}
	}
	return true;
}

static bool directory_is_empty(const std::string& path) {
	DIR* dir = opendir(path.c_str());
	if (dir == NULL) {
		return false;
	}
	struct dirent* entry = NULL;
	while ((entry = readdir(dir)) != NULL) {
		if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
			continue;
		}
		closedir(dir);
		return false;
	}
	closedir(dir);
	return true;
}

static void format_time(time_t ts, char* buf, size_t size) {
	if (buf == NULL || size == 0) {
		return;
	}
	struct tm tmv;
	if (localtime_r(&ts, &tmv) == NULL
		|| strftime(buf, size, "%Y-%m-%d %H:%M:%S", &tmv) == 0)
	{
		buf[0] = '\0';
	}
}

static bool ends_with_ignore_case(const std::string& text, const char* suffix) {
	size_t suffix_len = suffix ? strlen(suffix) : 0;
	if (suffix_len == 0 || text.size() < suffix_len) {
		return false;
	}
	const size_t start = text.size() - suffix_len;
	for (size_t i = 0; i < suffix_len; ++i) {
		unsigned char a = (unsigned char) text[start + i];
		unsigned char b = (unsigned char) suffix[i];
		if (a >= 'A' && a <= 'Z') {
			a = (unsigned char) (a - 'A' + 'a');
		}
		if (b >= 'A' && b <= 'Z') {
			b = (unsigned char) (b - 'A' + 'a');
		}
		if (a != b) {
			return false;
		}
	}
	return true;
}

static const char* content_type_for_file(const std::string& name) {
	if (ends_with_ignore_case(name, ".png")) return "image/png";
	if (ends_with_ignore_case(name, ".jpg") || ends_with_ignore_case(name, ".jpeg")) return "image/jpeg";
	if (ends_with_ignore_case(name, ".gif")) return "image/gif";
	if (ends_with_ignore_case(name, ".mp4")) return "video/mp4";
	if (ends_with_ignore_case(name, ".mkv")) return "video/x-matroska";
	if (ends_with_ignore_case(name, ".avi")) return "video/x-msvideo";
	if (ends_with_ignore_case(name, ".mp3")) return "audio/mpeg";
	if (ends_with_ignore_case(name, ".m4a")) return "audio/mp4";
	if (ends_with_ignore_case(name, ".aac")) return "audio/aac";
	if (ends_with_ignore_case(name, ".wav")) return "audio/wav";
	if (ends_with_ignore_case(name, ".ogg")) return "audio/ogg";
	if (ends_with_ignore_case(name, ".flac")) return "audio/flac";
	if (ends_with_ignore_case(name, ".txt") || ends_with_ignore_case(name, ".md")
		|| ends_with_ignore_case(name, ".log") || ends_with_ignore_case(name, ".csv")
		|| ends_with_ignore_case(name, ".json") || ends_with_ignore_case(name, ".xml")
		|| ends_with_ignore_case(name, ".js") || ends_with_ignore_case(name, ".ts")
		|| ends_with_ignore_case(name, ".cpp") || ends_with_ignore_case(name, ".h")
		|| ends_with_ignore_case(name, ".py") || ends_with_ignore_case(name, ".sh"))
	{
		return "text/plain; charset=utf-8";
	}
	return "application/octet-stream";
}

} // namespace

bool LocalDiskListAction::run(request_t& req, response_t& res)
{
	std::string path;
	std::string err;
	if (!normalize_local_path(req.getParameter("path"), path, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	struct stat st;
	if (stat(path.c_str(), &st) != 0 || !S_ISDIR(st.st_mode)) {
		json_error(res, 404, "directory not found", req.isKeepAlive());
		return true;
	}

	DIR* dir = opendir(path.c_str());
	if (dir == NULL) {
		json_error(res, 403, strerror(errno), req.isKeepAlive());
		return true;
	}

	std::vector<local_entry_t> entries;
	const char* show_hidden_text = req.getParameter("show_hidden");
	const bool show_hidden = show_hidden_text != NULL
		&& (strcmp(show_hidden_text, "1") == 0
			|| strcasecmp(show_hidden_text, "true") == 0
			|| strcasecmp(show_hidden_text, "yes") == 0);
	struct dirent* entry = NULL;
	while ((entry = readdir(dir)) != NULL) {
		if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
			continue;
		}
		if (!show_hidden && entry->d_name[0] == '.') {
			continue;
		}
		const std::string child_path = join_local_path(path, entry->d_name);
		struct stat child_st;
		if (stat(child_path.c_str(), &child_st) != 0) {
			continue;
		}
		if (!S_ISDIR(child_st.st_mode) && !S_ISREG(child_st.st_mode)) {
			continue;
		}

		char time_buf[32];
		format_time(child_st.st_mtime, time_buf, sizeof(time_buf));
		local_entry_t item;
		item.name = entry->d_name;
		item.path = child_path;
		item.directory = S_ISDIR(child_st.st_mode);
		item.empty_directory = item.directory && directory_is_empty(child_path);
		item.size = item.directory ? 0 : (long long) child_st.st_size;
		item.modified_at = (long long) child_st.st_mtime;
		item.modified_time = time_buf;
		entries.push_back(item);
	}
	closedir(dir);

	std::sort(entries.begin(), entries.end(),
		[](const local_entry_t& a, const local_entry_t& b) {
			if (a.directory != b.directory) {
				return a.directory > b.directory;
			}
			return a.name < b.name;
		});

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", path.c_str());
	root.add_text("parent_path", parent_path(path).c_str());
	root.add_text("home_path", current_home_path().c_str());
	acl::json_node& items = json.create_array();
	root.add_child("items", items);
	for (size_t i = 0; i < entries.size(); ++i) {
		acl::json_node& item = items.add_child(false, true);
		item.add_text("name", entries[i].name.c_str());
		item.add_text("path", entries[i].path.c_str());
		item.add_bool("directory", entries[i].directory);
		item.add_bool("empty_directory", entries[i].empty_directory);
		item.add_number("size", entries[i].size);
		item.add_number("modified_at", entries[i].modified_at);
		item.add_text("modified_time", entries[i].modified_time.c_str());
	}
	root.add_number("count", (long long) entries.size());
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool LocalDiskDownloadAction::run(request_t& req, response_t& res)
{
	std::string path;
	std::string err;
	if (!normalize_local_path(req.getParameter("path"), path, err)) {
		return sendText(res, 400, err.c_str(), req.isKeepAlive());
	}

	struct stat st;
	if (stat(path.c_str(), &st) != 0 || !S_ISREG(st.st_mode)) {
		return sendText(res, 404, "file not found\n", req.isKeepAlive());
	}

	acl::ifstream in;
	if (!in.open_read(path.c_str())) {
		return sendText(res, 403, "file cannot be read\n", req.isKeepAlive());
	}

	const long long fsize = in.fsize();
	const std::string name = path.substr(path.rfind('/') == std::string::npos ? 0 : path.rfind('/') + 1);
	const char* ctype = content_type_for_file(name);
	res.setStatus(200)
		.setKeepAlive(req.isKeepAlive())
		.setContentType(ctype)
		.setHeader("Content-Disposition", "inline")
		.setContentLength(fsize);

	char buf[8192];
	while (!in.eof()) {
		int n = in.read(buf, sizeof(buf), false);
		if (n < 0) {
			in.close();
			return false;
		}
		if (n == 0) {
			continue;
		}
		if (!res.write(buf, (size_t) n)) {
			in.close();
			return false;
		}
	}
	in.close();
	return res.write(NULL, 0);
}

bool LocalDiskDeleteAction::run(request_t& req, response_t& res)
{
	std::string path;
	std::string err;
	if (!normalize_local_path(req.getParameter("path"), path, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	struct stat st;
	if (stat(path.c_str(), &st) != 0) {
		json_error(res, 404, "path not found", req.isKeepAlive());
		return true;
	}
	const bool is_dir = S_ISDIR(st.st_mode);
	const bool is_file = S_ISREG(st.st_mode);
	if (!is_dir && !is_file) {
		json_error(res, 400, "only files and directories can be deleted", req.isKeepAlive());
		return true;
	}
	if (path == "/") {
		json_error(res, 409, "root directory cannot be deleted", req.isKeepAlive());
		return true;
	}

	if (is_dir) {
		if (::rmdir(path.c_str()) != 0) {
			json_error(res, errno == ENOTEMPTY ? 409 : 500,
				errno == ENOTEMPTY ? "directory is not empty" : strerror(errno),
				req.isKeepAlive());
			return true;
		}
	} else {
		if (::unlink(path.c_str()) != 0) {
			json_error(res, 500, strerror(errno), req.isKeepAlive());
			return true;
		}
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", path.c_str());
	root.add_text("message", is_dir ? "directory deleted" : "file deleted");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool LocalDiskCreateDirAction::run(request_t& req, response_t& res)
{
	std::string parent;
	std::string err;
	if (!normalize_local_path(req.getParameter("path"), parent, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	struct stat st;
	if (stat(parent.c_str(), &st) != 0 || !S_ISDIR(st.st_mode)) {
		json_error(res, 404, "parent directory not found", req.isKeepAlive());
		return true;
	}

	const char* name_param = req.getParameter("name");
	std::string name = name_param ? name_param : "";
	while (!name.empty() && (name[0] == ' ' || name[0] == '\t')) {
		name.erase(0, 1);
	}
	while (!name.empty() && (name[name.size() - 1] == ' ' || name[name.size() - 1] == '\t')) {
		name.erase(name.size() - 1);
	}
	if (!validate_local_name(name, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	const std::string new_path = join_local_path(parent, name.c_str());
	if (::mkdir(new_path.c_str(), 0755) != 0) {
		json_error(res, errno == EEXIST ? 409 : 500,
			errno == EEXIST ? "directory already exists" : strerror(errno),
			req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", new_path.c_str());
	root.add_text("name", name.c_str());
	root.add_text("message", "directory created");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool LocalDiskMoveAction::run(request_t& req, response_t& res)
{
	std::string source;
	std::string target;
	std::string err;
	const char* source_param = req.getParameter("path");
	const char* target_param = req.getParameter("target");
	if (source_param == NULL || *source_param == '\0'
		|| target_param == NULL || *target_param == '\0')
	{
		json_error(res, 400, "source path and target directory are required",
			req.isKeepAlive());
		return true;
	}
	if (!normalize_local_path(source_param, source, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!normalize_local_path(target_param, target, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	struct stat source_st;
	if (stat(source.c_str(), &source_st) != 0) {
		json_error(res, 404, "source path not found", req.isKeepAlive());
		return true;
	}
	const bool source_is_dir = S_ISDIR(source_st.st_mode);
	if (!source_is_dir && !S_ISREG(source_st.st_mode)) {
		json_error(res, 400, "only files and directories can be moved",
			req.isKeepAlive());
		return true;
	}
	if (source == "/") {
		json_error(res, 409, "root directory cannot be moved", req.isKeepAlive());
		return true;
	}
	if (source_is_dir && is_system_level_directory_path(source)) {
		json_error(res, 409, "system directory cannot be moved",
			req.isKeepAlive());
		return true;
	}

	struct stat target_st;
	if (stat(target.c_str(), &target_st) != 0 || !S_ISDIR(target_st.st_mode)) {
		json_error(res, 404, "target directory not found", req.isKeepAlive());
		return true;
	}
	if (source_is_dir && is_same_or_child_path(source, target)) {
		json_error(res, 409, "directory cannot be moved into itself",
			req.isKeepAlive());
		return true;
	}
	if (parent_path(source) == target) {
		json_error(res, 409, "source is already in target directory",
			req.isKeepAlive());
		return true;
	}

	const std::string name = local_base_name(source);
	if (name.empty()) {
		json_error(res, 400, "invalid source path", req.isKeepAlive());
		return true;
	}
	const std::string dest = join_local_path(target, name.c_str());
	struct stat dest_st;
	if (stat(dest.c_str(), &dest_st) == 0) {
		json_error(res, 409, "target already contains a path with same name",
			req.isKeepAlive());
		return true;
	}
	if (errno != ENOENT) {
		json_error(res, 500, strerror(errno), req.isKeepAlive());
		return true;
	}

	if (::rename(source.c_str(), dest.c_str()) != 0) {
		json_error(res, errno == EXDEV ? 409 : 500,
			errno == EXDEV ? "cannot move across different file systems" : strerror(errno),
			req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", dest.c_str());
	root.add_text("old_path", source.c_str());
	root.add_text("target", target.c_str());
	root.add_text("message", source_is_dir ? "directory moved" : "file moved");
	return sendJson(res, 200, root, req.isKeepAlive());
}

} // namespace action
