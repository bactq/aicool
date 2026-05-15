#include "actions.h"
#include "action_util.h"

#include <errno.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

#include <mutex>
#include <string>
#include <vector>
#include <map>

namespace action {

static std::mutex g_folder_mutex;
static std::string g_folder_db_file;
static bool g_folder_db_ready = false;
static const char* g_folder_root_name = "分类";
static const char* g_folder_table_create_sql =
	"CREATE TABLE IF NOT EXISTS folder_catalog ("
	"id INTEGER PRIMARY KEY AUTOINCREMENT,"
	"folder_name TEXT NOT NULL UNIQUE,"
	"created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),"
	"updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))"
	")";
static const char* g_file_rel_table_create_sql =
	"CREATE TABLE IF NOT EXISTS file_folder_rel ("
	"file_name TEXT PRIMARY KEY,"
	"folder_id INTEGER NOT NULL,"
	"updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),"
	"FOREIGN KEY(folder_id) REFERENCES folder_catalog(id) ON DELETE CASCADE"
	")";

static void json_error(response_t& res, int status, const char* msg,
	bool keep_alive)
{
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", false);
	root.add_text("error", msg ? msg : "unknown error");
	sendJson(res, status, root, keep_alive);
}

static bool file_exists_readable(const char* path) {
	if (path == NULL || *path == '\0') {
		return false;
	}
	return access(path, R_OK) == 0;
}

static std::string choose_sqlite_lib_path() {
	const char* env_path = getenv("AICOOL_SQLITE_LIB");
	if (env_path && *env_path && file_exists_readable(env_path)) {
		return std::string(env_path);
	}

	const std::vector<std::string> candidates = {
		"../third-party/sqlite/lib/sqlite3.so",
		"third-party/sqlite/lib/sqlite3.so",
	};

	for (size_t i = 0; i < candidates.size(); ++i) {
		if (file_exists_readable(candidates[i].c_str())) {
			return candidates[i];
		}
	}

	return std::string();
}

static std::string trim_copy(const char* text) {
	const char* s = text ? text : "";
	while (*s && (*s == ' ' || *s == '\t' || *s == '\r' || *s == '\n')) {
		++s;
	}

	const char* e = s + strlen(s);
	while (e > s && (*(e - 1) == ' ' || *(e - 1) == '\t'
		|| *(e - 1) == '\r' || *(e - 1) == '\n'))
	{
		--e;
	}

	return std::string(s, (size_t) (e - s));
}

static bool validate_folder_name(const std::string& name, std::string& err) {
	err.clear();
	if (name.empty()) {
		err = "folder name is empty";
		return false;
	}
	if (name == "." || name == "..") {
		err = "invalid folder name";
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

	return true;
}

static bool parse_positive_i64(const char* text, long long& out) {
	if (text == NULL || *text == '\0') {
		return false;
	}

	errno = 0;
	char* end = NULL;
	long long v = strtoll(text, &end, 10);
	if (errno != 0 || end == text || *end != '\0' || v <= 0) {
		return false;
	}
	out = v;
	return true;
}

static std::string category_root_path(const std::string& upload_dir) {
	acl::string path;
	path.format("%s/%s", upload_dir.c_str(), g_folder_root_name);
	return std::string(path.c_str());
}

static bool ensure_category_root_dir(const std::string& upload_dir,
	std::string& err)
{
	err.clear();
	if (!make_dir(upload_dir.c_str())) {
		err = "cannot access upload dir";
		return false;
	}

	std::string root = category_root_path(upload_dir);
	if (!make_dir(root.c_str())) {
		err = "cannot create category root dir";
		return false;
	}
	return true;
}

static bool ensure_folder_table_exists_locked(std::string& err) {
	err.clear();
	if (g_folder_db_file.empty()) {
		err = "folder database file is empty";
		return false;
	}

	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}

	db.set_busy_timeout(3000);
	acl::query qfk;
	qfk.create("PRAGMA foreign_keys=ON");
	if (!db.exec_update(qfk)) {
		err = db.get_error();
		return false;
	}

	acl::query query;
	query.create(g_folder_table_create_sql);
	if (!db.exec_update(query)) {
		err = db.get_error();
		return false;
	}

	acl::query qrel;
	qrel.create(g_file_rel_table_create_sql);
	if (!db.exec_update(qrel)) {
		err = db.get_error();
		return false;
	}

	return true;
}

static bool ensure_folder_db_for_request(const std::string& upload_dir,
	std::string& err)
{
	err.clear();

	if (!g_folder_db_ready || g_folder_db_file.empty()) {
		if (!init_category_folder_db(upload_dir, err)) {
			return false;
		}
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	if (!ensure_category_root_dir(upload_dir, err)) {
		g_folder_db_ready = false;
		return false;
	}
	if (!ensure_folder_table_exists_locked(err)) {
		g_folder_db_ready = false;
		return false;
	}

	g_folder_db_ready = true;
	return true;
}

bool init_category_folder_db(const std::string& upload_dir, std::string& err) {
	err.clear();

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	if (g_folder_db_ready) {
		return true;
	}

	std::string sqlite_lib_path = choose_sqlite_lib_path();
	if (sqlite_lib_path.empty()) {
		err = "sqlite dynamic library not found";
		return false;
	}

	acl::db_handle::set_loadpath(sqlite_lib_path.c_str());

	if (!ensure_category_root_dir(upload_dir, err)) {
		return false;
	}

	acl::string db_file;
	db_file.format("%s/.folder_catalog.db", upload_dir.c_str());
	g_folder_db_file = db_file.c_str();

	if (!ensure_folder_table_exists_locked(err)) {
		return false;
	}

	g_folder_db_ready = true;
	return true;
}

static bool folder_id_exists(acl::db_sqlite& db, long long folder_id,
	std::string& err)
{
	err.clear();
	acl::query query;
	query.create("SELECT id FROM folder_catalog WHERE id=:id")
		.set_parameter("id", folder_id);
	if (!db.exec_select(query)) {
		err = db.get_error();
		return false;
	}

	bool ok = !db.empty();
	db.free_result();
	return ok;
}

bool folder_bind_file(const std::string& upload_dir, const std::string& file_name,
	long long folder_id, std::string& err)
{
	err.clear();
	if (file_name.empty()) {
		err = "file name is empty";
		return false;
	}
	if (folder_id <= 0) {
		err = "invalid folder id";
		return false;
	}

	if (!ensure_folder_db_for_request(upload_dir, err)) {
		return false;
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query qfk;
	qfk.create("PRAGMA foreign_keys=ON");
	if (!db.exec_update(qfk)) {
		err = db.get_error();
		return false;
	}

	if (!folder_id_exists(db, folder_id, err)) {
		if (err.empty()) {
			err = "folder not found";
		}
		return false;
	}

	acl::query q;
	q.create("INSERT INTO file_folder_rel(file_name, folder_id, updated_at)"
		" VALUES(:file, :fid, strftime('%s','now'))"
		" ON CONFLICT(file_name) DO UPDATE SET"
		" folder_id=excluded.folder_id,"
		" updated_at=strftime('%s','now')")
		.set_parameter("file", file_name.c_str())
		.set_parameter("fid", folder_id);
	if (!db.exec_update(q)) {
		err = db.get_error();
		return false;
	}

	return true;
}

bool folder_unbind_file(const std::string& upload_dir,
	const std::string& file_name, std::string& err)
{
	err.clear();
	if (file_name.empty()) {
		return true;
	}

	if (!ensure_folder_db_for_request(upload_dir, err)) {
		return false;
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query q;
	q.create("DELETE FROM file_folder_rel WHERE file_name=:file")
		.set_parameter("file", file_name.c_str());
	if (!db.exec_update(q)) {
		err = db.get_error();
		return false;
	}

	return true;
}

bool folder_load_file_bindings(const std::string& upload_dir,
	std::map<std::string, long long>& file_to_folder_id,
	std::map<long long, std::string>& folder_id_to_name,
	std::string& err)
{
	err.clear();
	file_to_folder_id.clear();
	folder_id_to_name.clear();

	if (!ensure_folder_db_for_request(upload_dir, err)) {
		return false;
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query qfk;
	qfk.create("PRAGMA foreign_keys=ON");
	if (!db.exec_update(qfk)) {
		err = db.get_error();
		return false;
	}

	acl::query q;
	q.create("SELECT r.file_name, r.folder_id, f.folder_name"
		" FROM file_folder_rel r"
		" JOIN folder_catalog f ON f.id=r.folder_id");
	if (!db.exec_select(q)) {
		err = db.get_error();
		return false;
	}

	for (size_t i = 0; i < db.length(); ++i) {
		const acl::db_row* row = db[i];
		if (row == NULL) {
			continue;
		}

		const char* file_name = (*row)["file_name"];
		const char* folder_id = (*row)["folder_id"];
		const char* folder_name = (*row)["folder_name"];
		if (file_name == NULL || *file_name == '\0' || folder_id == NULL) {
			continue;
		}

		long long id = atoll(folder_id);
		file_to_folder_id[file_name] = id;
		if (folder_name != NULL) {
			folder_id_to_name[id] = folder_name;
		}
	}

	db.free_result();
	return true;
}

static bool load_folder_name_by_id(acl::db_sqlite& db, long long id,
	std::string& name, std::string& err)
{
	err.clear();
	name.clear();

	acl::query query;
	query.create("SELECT folder_name FROM folder_catalog WHERE id=:id")
		.set_parameter("id", id);
	if (!db.exec_select(query)) {
		err = db.get_error();
		return false;
	}

	if (!db.empty()) {
		const acl::db_row* row = db.get_first_row();
		if (row != NULL) {
			const char* value = (*row)["folder_name"];
			if (value != NULL) {
				name = value;
			}
		}
	}
	db.free_result();
	return true;
}

static bool folder_name_exists(acl::db_sqlite& db, const char* name,
	bool& exists, std::string& err)
{
	err.clear();
	exists = false;

	acl::query query;
	query.create("SELECT id FROM folder_catalog WHERE folder_name=:name")
		.set_parameter("name", name ? name : "");
	if (!db.exec_select(query)) {
		err = db.get_error();
		return false;
	}

	exists = !db.empty();
	db.free_result();
	return true;
}

bool FolderListAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string db_err;
	if (!ensure_folder_db_for_request(upload_dir, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}
	db.set_busy_timeout(3000);

	acl::query query;
	query.create("SELECT id, folder_name, created_at, updated_at"
		" FROM folder_catalog ORDER BY id ASC");
	if (!db.exec_select(query)) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("root", g_folder_root_name);
	acl::json_node& arr = json.create_array();
	root.add_child("folders", arr);
	long long count = 0;

	for (size_t i = 0; i < db.length(); ++i) {
		const acl::db_row* row = db[i];
		if (row == NULL) {
			continue;
		}
		count++;
		acl::json_node& item = arr.add_child(false, true);

		long long id = 0;
		const char* id_text = (*row)["id"];
		if (id_text != NULL) {
			id = atoll(id_text);
		}
		item.add_number("id", id);

		const char* name = (*row)["folder_name"];
		item.add_text("name", name ? name : "");

		long long created_at = 0;
		const char* created_text = (*row)["created_at"];
		if (created_text != NULL) {
			created_at = atoll(created_text);
		}
		item.add_number("created_at", created_at);

		long long updated_at = 0;
		const char* updated_text = (*row)["updated_at"];
		if (updated_text != NULL) {
			updated_at = atoll(updated_text);
		}
		item.add_number("updated_at", updated_at);
	}

	db.free_result();
	root.add_number("count", count);
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderCreateAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string db_err;
	if (!ensure_folder_db_for_request(upload_dir, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}

	std::string folder_name = trim_copy(req.getParameter("name"));
	std::string valid_err;
	if (!validate_folder_name(folder_name, valid_err)) {
		json_error(res, 400, valid_err.c_str(), req.isKeepAlive());
		return true;
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}
	db.set_busy_timeout(3000);

	bool exists = false;
	if (!folder_name_exists(db, folder_name.c_str(), exists, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}
	if (exists) {
		json_error(res, 409, "folder already exists", req.isKeepAlive());
		return true;
	}

	acl::string folder_path;
	folder_path.format("%s/%s/%s", upload_dir.c_str(), g_folder_root_name,
		folder_name.c_str());

	struct stat st;
	if (stat(folder_path.c_str(), &st) == 0) {
		if (!S_ISDIR(st.st_mode)) {
			json_error(res, 409, "target path exists and is not a directory",
				req.isKeepAlive());
			return true;
		}
	} else if (::mkdir(folder_path.c_str(), 0755) != 0) {
		json_error(res, 500, "create folder directory failed", req.isKeepAlive());
		return true;
	}

	acl::query query;
	query.create("INSERT INTO folder_catalog(folder_name, created_at, updated_at)"
		" VALUES(:name, strftime('%s','now'), strftime('%s','now'))")
		.set_parameter("name", folder_name.c_str());
	if (!db.exec_update(query)) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}

	long long new_id = 0;
	acl::query qid;
	qid.create("SELECT id FROM folder_catalog WHERE folder_name=:name")
		.set_parameter("name", folder_name.c_str());
	if (!db.exec_select(qid)) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}
	if (!db.empty()) {
		const acl::db_row* row = db.get_first_row();
		if (row != NULL) {
			const char* text = (*row)["id"];
			if (text != NULL) {
				new_id = atoll(text);
			}
		}
	}
	db.free_result();

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_number("id", new_id);
	root.add_text("name", folder_name.c_str());
	root.add_text("message", "folder created");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderRenameAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string db_err;
	if (!ensure_folder_db_for_request(upload_dir, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}

	long long id = 0;
	if (!parse_positive_i64(req.getParameter("id"), id)) {
		json_error(res, 400, "invalid id", req.isKeepAlive());
		return true;
	}

	std::string new_name = trim_copy(req.getParameter("name"));
	std::string valid_err;
	if (!validate_folder_name(new_name, valid_err)) {
		json_error(res, 400, valid_err.c_str(), req.isKeepAlive());
		return true;
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}
	db.set_busy_timeout(3000);

	std::string old_name;
	if (!load_folder_name_by_id(db, id, old_name, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}
	if (old_name.empty()) {
		json_error(res, 404, "folder not found", req.isKeepAlive());
		return true;
	}
	if (old_name == new_name) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", true);
		root.add_number("id", id);
		root.add_text("name", new_name.c_str());
		root.add_text("message", "folder unchanged");
		return sendJson(res, 200, root, req.isKeepAlive());
	}

	bool exists = false;
	if (!folder_name_exists(db, new_name.c_str(), exists, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}
	if (exists) {
		json_error(res, 409, "folder name already exists", req.isKeepAlive());
		return true;
	}

	acl::string old_path;
	old_path.format("%s/%s/%s", upload_dir.c_str(), g_folder_root_name,
		old_name.c_str());
	acl::string new_path;
	new_path.format("%s/%s/%s", upload_dir.c_str(), g_folder_root_name,
		new_name.c_str());

	if (::rename(old_path.c_str(), new_path.c_str()) != 0) {
		json_error(res, 500, "rename folder directory failed", req.isKeepAlive());
		return true;
	}

	acl::query query;
	query.create("UPDATE folder_catalog"
		" SET folder_name=:name, updated_at=strftime('%s','now')"
		" WHERE id=:id")
		.set_parameter("name", new_name.c_str())
		.set_parameter("id", id);
	if (!db.exec_update(query)) {
		(void) ::rename(new_path.c_str(), old_path.c_str());
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_number("id", id);
	root.add_text("name", new_name.c_str());
	root.add_text("message", "folder renamed");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool FolderDeleteAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string db_err;
	if (!ensure_folder_db_for_request(upload_dir, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}

	long long id = 0;
	if (!parse_positive_i64(req.getParameter("id"), id)) {
		json_error(res, 400, "invalid id", req.isKeepAlive());
		return true;
	}

	std::lock_guard<std::mutex> guard(g_folder_mutex);
	acl::db_sqlite db(g_folder_db_file.c_str(), "utf-8");
	if (!db.open()) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}
	db.set_busy_timeout(3000);

	std::string folder_name;
	if (!load_folder_name_by_id(db, id, folder_name, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}
	if (folder_name.empty()) {
		json_error(res, 404, "folder not found", req.isKeepAlive());
		return true;
	}

	acl::query qcheck;
	qcheck.create("SELECT 1 FROM file_folder_rel WHERE folder_id=:id LIMIT 1")
		.set_parameter("id", id);
	if (!db.exec_select(qcheck)) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}
	bool has_bindings = !db.empty();
	db.free_result();
	if (has_bindings) {
		json_error(res, 409, "folder still has files", req.isKeepAlive());
		return true;
	}

	acl::string folder_path;
	folder_path.format("%s/%s/%s", upload_dir.c_str(), g_folder_root_name,
		folder_name.c_str());

	struct stat st;
	if (stat(folder_path.c_str(), &st) == 0 && S_ISDIR(st.st_mode)) {
		if (::rmdir(folder_path.c_str()) != 0) {
			if (errno == ENOTEMPTY || errno == EEXIST) {
				json_error(res, 409, "folder is not empty", req.isKeepAlive());
			} else {
				json_error(res, 500, "delete folder directory failed", req.isKeepAlive());
			}
			return true;
		}
	}

	acl::query query;
	query.create("DELETE FROM folder_catalog WHERE id=:id")
		.set_parameter("id", id);
	if (!db.exec_update(query)) {
		json_error(res, 500, db.get_error(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_number("id", id);
	root.add_text("name", folder_name.c_str());
	root.add_text("message", "folder deleted");
	return sendJson(res, 200, root, req.isKeepAlive());
}

} // namespace action
