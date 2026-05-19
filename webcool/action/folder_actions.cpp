#include "actions.h"
#include "action_util.h"

#include <dirent.h>
#include <errno.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

#include <algorithm>
#include <cstdlib>
#include <fstream>
#include <map>
#include <mutex>
#include <sstream>
#include <string>
#include <vector>

namespace action {

namespace {

struct folder_node_t {
	std::string name;
	std::string path;
	long long direct_file_count;
	std::vector<folder_node_t> children;
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

static bool should_skip_entry(const char* name) {
	if (name == NULL || *name == '\0') {
		return true;
	}
	if (strcmp(name, ".") == 0 || strcmp(name, "..") == 0) {
		return true;
	}
	if (name[0] == '.') {
		return true;
	}
	return false;
}

static bool validate_folder_segment(const std::string& name, std::string& err) {
	err.clear();
	if (name.empty()) {
		err = "folder name is empty";
		return false;
	}
	if (name.size() > 120) {
		err = "folder name is too long";
		return false;
	}
	for (size_t i = 0; i < name.size(); ++i) {
		unsigned char c = (unsigned char) name[i];
		if (c < 32 || c == 127) {
			err = "folder name contains control character";
			return false;
		}
		if (name[i] == '/' || name[i] == '\\') {
			err = "folder name cannot contain slash";
			return false;
		}
	}
	if (name == "." || name == "..") {
		err = "invalid folder name";
		return false;
	}
	return true;
}

static bool list_folder_tree(const std::string& upload_dir,
	const std::string& relative_path, folder_node_t& node, std::string& err,
	long long& folder_count)
{
	err.clear();
	node.direct_file_count = 0;
	node.children.clear();

	std::string full = join_upload_path(upload_dir, relative_path);
	DIR* dir = opendir(full.c_str());
	if (dir == NULL) {
		err = strerror(errno);
		return false;
	}

	std::vector<folder_node_t> children;
	struct dirent* entry = NULL;
	while ((entry = readdir(dir)) != NULL) {
		if (should_skip_entry(entry->d_name)) {
			continue;
		}

		std::string child_name(entry->d_name);
		std::string child_rel = relative_path.empty()
			? child_name
			: (relative_path + "/" + child_name);
		std::string child_full = join_upload_path(upload_dir, child_rel);

		struct stat st;
		if (stat(child_full.c_str(), &st) != 0) {
			continue;
		}
		if (S_ISDIR(st.st_mode)) {
			folder_node_t child;
			child.name = child_name;
			child.path = child_rel;
			folder_count++;
			if (!list_folder_tree(upload_dir, child_rel, child, err, folder_count)) {
				closedir(dir);
				return false;
			}
			children.push_back(child);
		} else if (S_ISREG(st.st_mode)) {
			node.direct_file_count++;
		}
	}

	closedir(dir);
	std::sort(children.begin(), children.end(),
		[](const folder_node_t& a, const folder_node_t& b) {
			return a.name < b.name;
		});
	node.children.swap(children);
	return true;
}

static bool folder_lock_unlocked(
	const std::string& path,
	const std::map<std::string, std::string>& locks,
	const std::map<std::string, std::string>& unlocked_locks)
{
	std::map<std::string, std::string>::const_iterator lock_it = locks.find(path);
	if (lock_it == locks.end()) {
		return true;
	}
	std::map<std::string, std::string>::const_iterator unlocked_it = unlocked_locks.find(path);
	return unlocked_it != unlocked_locks.end() && unlocked_it->second == lock_it->second;
}

static void append_folder_json(acl::json& json, acl::json_node& arr,
	const folder_node_t& node, const std::map<std::string, std::string>& locks,
	const std::map<std::string, std::string>& unlocked_locks)
{
	const bool locked = locks.find(node.path) != locks.end();
	const bool unlocked = folder_lock_unlocked(node.path, locks, unlocked_locks);
	acl::json_node& item = arr.add_child(false, true);
	item.add_text("name", node.name.c_str());
	item.add_text("path", node.path.c_str());
	item.add_text("parent_path", parent_relative_path(node.path).c_str());
	item.add_bool("locked", locked);
	item.add_number("file_count", locked && !unlocked ? 0 : node.direct_file_count);
	acl::json_node& children = json.create_array();
	item.add_child("children", children);
	if (!locked || unlocked) {
		for (size_t i = 0; i < node.children.size(); ++i) {
			append_folder_json(json, children, node.children[i], locks, unlocked_locks);
		}
	}
	item.add_number("folder_count", locked && !unlocked ? 0 : (long long) node.children.size());
}

static bool folder_is_empty(const std::string& full_path, bool& empty,
	std::string& err)
{
	err.clear();
	empty = true;
	DIR* dir = opendir(full_path.c_str());
	if (dir == NULL) {
		err = strerror(errno);
		return false;
	}
	struct dirent* entry = NULL;
	while ((entry = readdir(dir)) != NULL) {
		if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
			continue;
		}
		empty = false;
		break;
	}
	closedir(dir);
	return true;
}

static bool is_same_or_child_path(const std::string& base_path,
	const std::string& test_path)
{
	if (base_path.empty()) {
		return true;
	}
	if (test_path == base_path) {
		return true;
	}
	return test_path.size() > base_path.size()
		&& test_path.compare(0, base_path.size(), base_path) == 0
		&& test_path[base_path.size()] == '/';
}

static std::mutex g_folder_lock_mutex;

static std::string folder_locks_file_path(const std::string& upload_dir) {
	return upload_dir + "/.folder_locks.txt";
}

static bool validate_lock_password(const std::string& password,
	std::string& err)
{
	err.clear();
	if (password.empty()) {
		err = "password is empty";
		return false;
	}
	if (password.size() > 120) {
		err = "password is too long";
		return false;
	}
	for (size_t i = 0; i < password.size(); ++i) {
		unsigned char c = (unsigned char) password[i];
		if (c < 32 || c == 127) {
			err = "password contains control character";
			return false;
		}
		if (password[i] == '\t') {
			err = "password cannot contain tab";
			return false;
		}
	}
	return true;
}

static bool load_folder_locks_locked(const std::string& upload_dir,
	std::map<std::string, std::string>& locks, std::string& err)
{
	err.clear();
	locks.clear();
	std::ifstream in(folder_locks_file_path(upload_dir).c_str());
	if (!in.good()) {
		return true;
	}

	std::string line;
	while (std::getline(in, line)) {
		if (line.empty()) {
			continue;
		}
		std::string::size_type pos = line.find('\t');
		if (pos == std::string::npos) {
			continue;
		}
		std::string path = line.substr(0, pos);
		std::string password = line.substr(pos + 1);
		if (!path.empty() && !password.empty()) {
			locks[path] = password;
		}
	}
	if (!in.eof() && in.fail()) {
		err = "read folder locks failed";
		return false;
	}
	return true;
}

static bool save_folder_locks_locked(const std::string& upload_dir,
	const std::map<std::string, std::string>& locks, std::string& err)
{
	err.clear();
	if (!make_dir_recursive(upload_dir.c_str())) {
		err = "cannot access upload dir";
		return false;
	}
	const std::string file_path = folder_locks_file_path(upload_dir);
	const std::string tmp_path = file_path + ".tmp";
	std::ofstream out(tmp_path.c_str(), std::ios::trunc);
	if (!out.good()) {
		err = "open folder locks file failed";
		return false;
	}
	for (std::map<std::string, std::string>::const_iterator it = locks.begin();
		it != locks.end(); ++it)
	{
		out << it->first << '\t' << it->second << '\n';
	}
	out.close();
	if (!out.good()) {
		err = "write folder locks file failed";
		return false;
	}
	if (::rename(tmp_path.c_str(), file_path.c_str()) != 0) {
		err = "save folder locks file failed";
		return false;
	}
	return true;
}

static bool find_locked_ancestor_locked(
	const std::map<std::string, std::string>& locks,
	const std::string& relative_path, std::string& locked_path)
{
	locked_path.clear();
	for (std::map<std::string, std::string>::const_iterator it = locks.begin();
		it != locks.end(); ++it)
	{
		if (is_same_or_child_path(it->first, relative_path)
			&& it->first.size() >= locked_path.size())
		{
			locked_path = it->first;
		}
	}
	return !locked_path.empty();
}

static bool rename_folder_locks_prefix(const std::string& upload_dir,
	const std::string& old_prefix, const std::string& new_prefix,
	std::string& err)
{
	err.clear();
	if (old_prefix.empty() || new_prefix.empty() || old_prefix == new_prefix) {
		return true;
	}
	std::lock_guard<std::mutex> guard(g_folder_lock_mutex);
	std::map<std::string, std::string> locks;
	if (!load_folder_locks_locked(upload_dir, locks, err)) {
		return false;
	}
	std::map<std::string, std::string> next;
	for (std::map<std::string, std::string>::const_iterator it = locks.begin();
		it != locks.end(); ++it)
	{
		std::string path = it->first;
		if (path == old_prefix) {
			path = new_prefix;
		} else if (path.size() > old_prefix.size()
			&& path.compare(0, old_prefix.size(), old_prefix) == 0
			&& path[old_prefix.size()] == '/')
		{
			path = new_prefix + path.substr(old_prefix.size());
		}
		next[path] = it->second;
	}
	return save_folder_locks_locked(upload_dir, next, err);
}

} // namespace

bool init_category_folder_db(const std::string& upload_dir, std::string& err) {
	err.clear();
	if (!make_dir_recursive(upload_dir.c_str())) {
		err = "cannot access upload dir";
		return false;
	}
	return true;
}

bool folder_lock_path_allows(const std::string& upload_dir,
	const std::string& relative_path, const std::string& password,
	bool& allowed, std::string& locked_path, std::string& err)
{
	allowed = false;
	locked_path.clear();
	std::lock_guard<std::mutex> guard(g_folder_lock_mutex);
	std::map<std::string, std::string> locks;
	if (!load_folder_locks_locked(upload_dir, locks, err)) {
		return false;
	}
	if (!find_locked_ancestor_locked(locks, relative_path, locked_path)) {
		allowed = true;
		return true;
	}
	std::map<std::string, std::string>::const_iterator it = locks.find(locked_path);
	allowed = it != locks.end() && it->second == password;
	return true;
}

bool folder_lock_path_has_lock(const std::string& upload_dir,
	const std::string& relative_path, bool& locked, std::string& err)
{
	locked = false;
	std::lock_guard<std::mutex> guard(g_folder_lock_mutex);
	std::map<std::string, std::string> locks;
	if (!load_folder_locks_locked(upload_dir, locks, err)) {
		return false;
	}
	locked = locks.find(relative_path) != locks.end();
	return true;
}

bool folder_bind_file(const std::string&, const std::string&, long long,
	std::string& err)
{
	err.clear();
	err = "folder binding by id is no longer supported";
	return false;
}

bool folder_unbind_file(const std::string&, const std::string&, std::string& err) {
	err.clear();
	return true;
}

bool folder_load_file_bindings(const std::string&,
	std::map<std::string, long long>& file_to_folder_id,
	std::map<long long, std::string>& folder_id_to_name,
	std::string& err)
{
	err.clear();
	file_to_folder_id.clear();
	folder_id_to_name.clear();
	return true;
}

bool FolderListAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	if (!make_dir_recursive(upload_dir.c_str())) {
		json_error(res, 500, "cannot access upload dir", req.isKeepAlive());
		return true;
	}

	std::string err;
	folder_node_t root_node;
	root_node.name = "根目录";
	root_node.path.clear();
	long long folder_count = 0;
	if (!list_folder_tree(upload_dir, std::string(), root_node, err, folder_count)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	std::map<std::string, std::string> locks;
	{
		std::lock_guard<std::mutex> guard(g_folder_lock_mutex);
		if (!load_folder_locks_locked(upload_dir, locks, err)) {
			json_error(res, 500, err.c_str(), req.isKeepAlive());
			return true;
		}
	}
	std::map<std::string, std::string> unlocked_locks;
	long long unlock_count = 0;
	const char* unlock_count_text = req.getParameter("unlock_count");
	if (unlock_count_text != NULL && *unlock_count_text != '\0') {
		unlock_count = atoll(unlock_count_text);
		if (unlock_count < 0 || unlock_count > 100) {
			json_error(res, 400, "invalid unlock count", req.isKeepAlive());
			return true;
		}
	}
	for (long long i = 0; i < unlock_count; ++i) {
		std::ostringstream path_key;
		path_key << "unlock_path_" << i;
		std::ostringstream password_key;
		password_key << "unlock_password_" << i;
		const char* path_text = req.getParameter(path_key.str().c_str());
		const char* password_text = req.getParameter(password_key.str().c_str());
		if (path_text == NULL || password_text == NULL) {
			continue;
		}
		std::string unlock_path;
		if (!normalize_relative_path(path_text, unlock_path, err, false)) {
			json_error(res, 400, err.c_str(), req.isKeepAlive());
			return true;
		}
		unlocked_locks[unlock_path] = password_text;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("root_name", root_node.name.c_str());
	root.add_text("root_path", "");
	root.add_number("file_count", root_node.direct_file_count);
	root.add_number("count", folder_count);
	acl::json_node& folders = json.create_array();
	root.add_child("folders", folders);
	for (size_t i = 0; i < root_node.children.size(); ++i) {
		append_folder_json(json, folders, root_node.children[i], locks, unlocked_locks);
	}
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderCreateAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string parent_path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("parent"), parent_path, err, true)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (is_recycle_file_path(parent_path)) {
		json_error(res, 409, "cannot create folder inside recycle folder", req.isKeepAlive());
		return true;
	}
	bool lock_allowed = false;
	std::string locked_path;
	if (!folder_lock_path_allows(upload_dir, parent_path,
		req.getParameter("folder_password") ? req.getParameter("folder_password") : "",
		lock_allowed, locked_path, err))
	{
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!lock_allowed) {
		json_error(res, 403, "folder is locked", req.isKeepAlive());
		return true;
	}

	std::string name = req.getParameter("name") ? req.getParameter("name") : "";
	if (!validate_folder_segment(name, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	if (!make_dir_recursive(upload_dir.c_str())) {
		json_error(res, 500, "cannot access upload dir", req.isKeepAlive());
		return true;
	}
	if (!parent_path.empty() && !upload_directory_exists(upload_dir, parent_path)) {
		json_error(res, 404, "parent folder not found", req.isKeepAlive());
		return true;
	}

	const std::string new_path = parent_path.empty() ? name : (parent_path + "/" + name);
	const std::string full = join_upload_path(upload_dir, new_path);
	struct stat st;
	if (stat(full.c_str(), &st) == 0) {
		json_error(res, 409, S_ISDIR(st.st_mode) ? "folder already exists" : "target path already exists", req.isKeepAlive());
		return true;
	}
	if (!make_dir(full.c_str())) {
		json_error(res, 500, "create folder failed", req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("name", name.c_str());
	root.add_text("path", new_path.c_str());
	root.add_text("parent_path", parent_path.c_str());
	root.add_text("message", "folder created");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderRenameAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string old_path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("path"), old_path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (is_recycle_root_path(old_path)) {
		json_error(res, 409, "recycle folder is protected", req.isKeepAlive());
		return true;
	}
	bool lock_allowed = false;
	std::string locked_path;
	if (!folder_lock_path_allows(upload_dir, old_path,
		req.getParameter("folder_password") ? req.getParameter("folder_password") : "",
		lock_allowed, locked_path, err))
	{
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!lock_allowed) {
		json_error(res, 403, "folder is locked", req.isKeepAlive());
		return true;
	}

	std::string new_name = req.getParameter("name") ? req.getParameter("name") : "";
	if (!validate_folder_segment(new_name, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!upload_directory_exists(upload_dir, old_path)) {
		json_error(res, 404, "folder not found", req.isKeepAlive());
		return true;
	}

	const std::string parent_path = parent_relative_path(old_path);
	const std::string new_path = parent_path.empty() ? new_name : (parent_path + "/" + new_name);
	if (is_recycle_root_path(new_path)) {
		json_error(res, 409, "recycle folder name is protected", req.isKeepAlive());
		return true;
	}
	if (new_path == old_path) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", true);
		root.add_text("path", old_path.c_str());
		root.add_text("message", "folder unchanged");
		return sendJson(res, 200, root, req.isKeepAlive());
	}
	if (upload_directory_exists(upload_dir, new_path)) {
		json_error(res, 409, "folder already exists", req.isKeepAlive());
		return true;
	}

	std::string old_full = join_upload_path(upload_dir, old_path);
	std::string new_full = join_upload_path(upload_dir, new_path);
	if (::rename(old_full.c_str(), new_full.c_str()) != 0) {
		json_error(res, 500, "rename folder failed", req.isKeepAlive());
		return true;
	}

	if (!rename_folder_locks_prefix(upload_dir, old_path, new_path, err)) {
		::rename(new_full.c_str(), old_full.c_str());
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	bool tag_updated = false;
	std::string rename_err;
	if (!tag_rename_folder_prefix(upload_dir, old_path, new_path, rename_err)) {
		std::string rollback_err;
		rename_folder_locks_prefix(upload_dir, new_path, old_path, rollback_err);
		::rename(new_full.c_str(), old_full.c_str());
		json_error(res, 500, rename_err.c_str(), req.isKeepAlive());
		return true;
	}
	tag_updated = true;
	if (!video_resume_rename_folder_prefix(upload_dir, old_path, new_path, rename_err)) {
		if (tag_updated) {
			std::string rollback_err;
			tag_rename_folder_prefix(upload_dir, new_path, old_path, rollback_err);
		}
		std::string lock_rollback_err;
		rename_folder_locks_prefix(upload_dir, new_path, old_path, lock_rollback_err);
		::rename(new_full.c_str(), old_full.c_str());
		json_error(res, 500, rename_err.c_str(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", new_path.c_str());
	root.add_text("old_path", old_path.c_str());
	root.add_text("name", new_name.c_str());
	root.add_text("message", "folder renamed");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderDeleteAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("path"), path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (is_recycle_root_path(path)) {
		json_error(res, 409, "recycle folder is protected", req.isKeepAlive());
		return true;
	}
	bool lock_allowed = false;
	std::string locked_path;
	if (!folder_lock_path_allows(upload_dir, path,
		req.getParameter("folder_password") ? req.getParameter("folder_password") : "",
		lock_allowed, locked_path, err))
	{
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!lock_allowed) {
		json_error(res, 403, "folder is locked", req.isKeepAlive());
		return true;
	}
	if (!upload_directory_exists(upload_dir, path)) {
		json_error(res, 404, "folder not found", req.isKeepAlive());
		return true;
	}

	std::string full = join_upload_path(upload_dir, path);
	bool empty = false;
	if (!folder_is_empty(full, empty, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!empty) {
		json_error(res, 409, "folder is not empty", req.isKeepAlive());
		return true;
	}
	if (::rmdir(full.c_str()) != 0) {
		json_error(res, 500, "delete folder failed", req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", path.c_str());
	root.add_text("message", "folder deleted");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderLockAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("path"), path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (is_recycle_root_path(path)) {
		json_error(res, 409, "recycle folder is protected", req.isKeepAlive());
		return true;
	}
	if (!upload_directory_exists(upload_dir, path)) {
		json_error(res, 404, "folder not found", req.isKeepAlive());
		return true;
	}
	bool lock_allowed = false;
	std::string locked_path;
	if (!folder_lock_path_allows(upload_dir, path,
		req.getParameter("folder_password") ? req.getParameter("folder_password") : "",
		lock_allowed, locked_path, err))
	{
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!lock_allowed) {
		json_error(res, 403, "folder is locked", req.isKeepAlive());
		return true;
	}

	const std::string password = req.getParameter("password") ? req.getParameter("password") : "";
	if (!validate_lock_password(password, err)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	{
		std::lock_guard<std::mutex> guard(g_folder_lock_mutex);
		std::map<std::string, std::string> locks;
		if (!load_folder_locks_locked(upload_dir, locks, err)) {
			json_error(res, 500, err.c_str(), req.isKeepAlive());
			return true;
		}
		locks[path] = password;
		if (!save_folder_locks_locked(upload_dir, locks, err)) {
			json_error(res, 500, err.c_str(), req.isKeepAlive());
			return true;
		}
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", path.c_str());
	root.add_text("message", "folder locked");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderUnlockAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("path"), path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	const std::string password = req.getParameter("password") ? req.getParameter("password") : "";

	{
		std::lock_guard<std::mutex> guard(g_folder_lock_mutex);
		std::map<std::string, std::string> locks;
		if (!load_folder_locks_locked(upload_dir, locks, err)) {
			json_error(res, 500, err.c_str(), req.isKeepAlive());
			return true;
		}
		std::map<std::string, std::string>::iterator it = locks.find(path);
		if (it == locks.end()) {
			json_error(res, 404, "folder lock not found", req.isKeepAlive());
			return true;
		}
		if (it->second != password) {
			json_error(res, 403, "password is incorrect", req.isKeepAlive());
			return true;
		}
		locks.erase(it);
		if (!save_folder_locks_locked(upload_dir, locks, err)) {
			json_error(res, 500, err.c_str(), req.isKeepAlive());
			return true;
		}
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", path.c_str());
	root.add_text("message", "folder unlocked");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderLockVerifyAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("path"), path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	const std::string password = req.getParameter("password") ? req.getParameter("password") : "";
	bool allowed = false;
	std::string locked_path;
	if (!folder_lock_path_allows(upload_dir, path, password, allowed, locked_path, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!allowed) {
		json_error(res, 403, "password is incorrect", req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", path.c_str());
	root.add_text("locked_path", locked_path.c_str());
	root.add_text("message", "folder lock verified");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderMoveAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string source_path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("path"), source_path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (is_recycle_root_path(source_path)) {
		json_error(res, 409, "recycle folder is protected", req.isKeepAlive());
		return true;
	}
	bool source_lock_allowed = false;
	std::string locked_path;
	if (!folder_lock_path_allows(upload_dir, source_path,
		req.getParameter("folder_password") ? req.getParameter("folder_password") : "",
		source_lock_allowed, locked_path, err))
	{
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!source_lock_allowed) {
		json_error(res, 403, "source folder is locked", req.isKeepAlive());
		return true;
	}

	std::string target_parent;
	if (!normalize_relative_path(req.getParameter("folder"), target_parent, err, true)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (is_recycle_file_path(target_parent)) {
		json_error(res, 409, "cannot move folder into recycle folder", req.isKeepAlive());
		return true;
	}
	bool target_lock_allowed = false;
	if (!folder_lock_path_allows(upload_dir, target_parent,
		req.getParameter("target_folder_password") ? req.getParameter("target_folder_password") : "",
		target_lock_allowed, locked_path, err))
	{
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!target_lock_allowed) {
		json_error(res, 403, "target folder is locked", req.isKeepAlive());
		return true;
	}

	if (!upload_directory_exists(upload_dir, source_path)) {
		json_error(res, 404, "folder not found", req.isKeepAlive());
		return true;
	}
	if (!target_parent.empty() && !upload_directory_exists(upload_dir, target_parent)) {
		json_error(res, 404, "target folder not found", req.isKeepAlive());
		return true;
	}
	if (is_same_or_child_path(source_path, target_parent)) {
		json_error(res, 409, "cannot move folder into itself or its child", req.isKeepAlive());
		return true;
	}

	const std::string folder_name = base_name_from_relative_path(source_path);
	const std::string target_path = target_parent.empty()
		? folder_name
		: (target_parent + "/" + folder_name);
	if (target_path == source_path) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", true);
		root.add_text("path", source_path.c_str());
		root.add_text("message", "folder unchanged");
		return sendJson(res, 200, root, req.isKeepAlive());
	}
	if (upload_directory_exists(upload_dir, target_path)) {
		json_error(res, 409, "target folder already exists", req.isKeepAlive());
		return true;
	}

	const std::string source_full = join_upload_path(upload_dir, source_path);
	const std::string target_full = join_upload_path(upload_dir, target_path);
	if (::rename(source_full.c_str(), target_full.c_str()) != 0) {
		json_error(res, 500, "move folder failed", req.isKeepAlive());
		return true;
	}

	if (!rename_folder_locks_prefix(upload_dir, source_path, target_path, err)) {
		::rename(target_full.c_str(), source_full.c_str());
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	bool tag_updated = false;
	std::string rename_err;
	if (!tag_rename_folder_prefix(upload_dir, source_path, target_path, rename_err)) {
		std::string lock_rollback_err;
		rename_folder_locks_prefix(upload_dir, target_path, source_path, lock_rollback_err);
		::rename(target_full.c_str(), source_full.c_str());
		json_error(res, 500, rename_err.c_str(), req.isKeepAlive());
		return true;
	}
	tag_updated = true;
	if (!video_resume_rename_folder_prefix(upload_dir, source_path, target_path, rename_err)) {
		if (tag_updated) {
			std::string rollback_err;
			tag_rename_folder_prefix(upload_dir, target_path, source_path, rollback_err);
		}
		std::string lock_rollback_err;
		rename_folder_locks_prefix(upload_dir, target_path, source_path, lock_rollback_err);
		::rename(target_full.c_str(), source_full.c_str());
		json_error(res, 500, rename_err.c_str(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("path", target_path.c_str());
	root.add_text("old_path", source_path.c_str());
	root.add_text("parent_path", target_parent.c_str());
	root.add_text("name", folder_name.c_str());
	root.add_text("message", "folder moved");
	return sendJson(res, 200, root, req.isKeepAlive());
}

} // namespace action
