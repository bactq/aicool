#include "actions.h"
#include "action_util.h"

#include <dirent.h>
#include <errno.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

#include <algorithm>
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

static void append_folder_json(acl::json& json, acl::json_node& arr,
	const folder_node_t& node)
{
	acl::json_node& item = arr.add_child(false, true);
	item.add_text("name", node.name.c_str());
	item.add_text("path", node.path.c_str());
	item.add_text("parent_path", parent_relative_path(node.path).c_str());
	item.add_number("file_count", node.direct_file_count);
	acl::json_node& children = json.create_array();
	item.add_child("children", children);
	for (size_t i = 0; i < node.children.size(); ++i) {
		append_folder_json(json, children, node.children[i]);
	}
	item.add_number("folder_count", (long long) node.children.size());
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

} // namespace

bool init_category_folder_db(const std::string& upload_dir, std::string& err) {
	err.clear();
	if (!make_dir_recursive(upload_dir.c_str())) {
		err = "cannot access upload dir";
		return false;
	}
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
		append_folder_json(json, folders, root_node.children[i]);
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

	std::string target_parent;
	if (!normalize_relative_path(req.getParameter("folder"), target_parent, err, true)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (is_recycle_file_path(target_parent)) {
		json_error(res, 409, "cannot move folder into recycle folder", req.isKeepAlive());
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

	bool tag_updated = false;
	std::string rename_err;
	if (!tag_rename_folder_prefix(upload_dir, source_path, target_path, rename_err)) {
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
