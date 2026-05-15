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

namespace action {

static std::mutex g_resume_mutex;
static std::string g_resume_db_file;
static bool g_resume_db_ready = false;
static const char* g_video_resume_create_table_sql =
	"CREATE TABLE IF NOT EXISTS video_resume ("
	"file_name TEXT PRIMARY KEY NOT NULL,"
	"position_ms INTEGER NOT NULL DEFAULT 0,"
	"updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))"
	")";

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

static bool parse_non_negative_i64(const char* text, long long& out) {
	if (text == NULL || *text == '\0') {
		return false;
	}

	errno = 0;
	char* end = NULL;
	long long v = strtoll(text, &end, 10);
	if (errno != 0 || end == text || *end != '\0' || v < 0) {
		return false;
	}
	out = v;
	return true;
}

static void json_error(response_t& res, int status, const char* msg,
	bool keep_alive)
{
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", false);
	root.add_text("error", msg ? msg : "unknown error");
	sendJson(res, status, root, keep_alive);
}

static bool ensure_resume_table_exists_locked(std::string& err) {
	err.clear();
	if (g_resume_db_file.empty()) {
		err = "resume database file is empty";
		return false;
	}

	acl::db_sqlite db(g_resume_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}

	db.set_busy_timeout(3000);
	acl::query query;
	query.create(g_video_resume_create_table_sql);
	if (!db.exec_update(query)) {
		err = db.get_error();
		return false;
	}

	return true;
}

static bool ensure_video_resume_db_for_request(const std::string& upload_dir,
	std::string& err)
{
	err.clear();

	if (!g_resume_db_ready || g_resume_db_file.empty()) {
		if (!init_video_resume_db(upload_dir, err)) {
			return false;
		}
	}

	std::lock_guard<std::mutex> guard(g_resume_mutex);
	if (!ensure_resume_table_exists_locked(err)) {
		g_resume_db_ready = false;
		return false;
	}

	g_resume_db_ready = true;
	return true;
}

bool init_video_resume_db(const std::string& upload_dir, std::string& err) {
	err.clear();

	std::lock_guard<std::mutex> guard(g_resume_mutex);
	if (g_resume_db_ready) {
		return true;
	}

	std::string sqlite_lib_path = choose_sqlite_lib_path();
	if (sqlite_lib_path.empty()) {
		err = "sqlite dynamic library not found";
		return false;
	}

	acl::db_handle::set_loadpath(sqlite_lib_path.c_str());

	acl::string db_file;
	db_file.format("%s/.video_resume.db", upload_dir.c_str());
	g_resume_db_file = db_file.c_str();

	if (!ensure_resume_table_exists_locked(err)) {
		return false;
	}

	g_resume_db_ready = true;
	return true;
}

bool VideoResumeGetAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string db_err;
	if (!ensure_video_resume_db_for_request(upload_dir, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}

	const char* file = req.getParameter("file");
	if (file == NULL || *file == '\0') {
		json_error(res, 400, "missing query parameter: file", req.isKeepAlive());
		return true;
	}

	const char* basename = acl_safe_basename(file);
	if (basename == NULL || *basename == '\0' || strcmp(basename, file) != 0) {
		json_error(res, 400, "invalid file name", req.isKeepAlive());
		return true;
	}

	{
		std::lock_guard<std::mutex> guard(g_resume_mutex);
		if (!g_resume_db_ready || g_resume_db_file.empty()) {
			json_error(res, 500, "resume database not initialized", req.isKeepAlive());
			return true;
		}

		acl::db_sqlite db(g_resume_db_file.c_str(), "utf-8");
		if (!db.open()) {
			json_error(res, 500, db.get_error(), req.isKeepAlive());
			return true;
		}
		db.set_busy_timeout(3000);

		acl::query query;
		query.create("SELECT position_ms FROM video_resume WHERE file_name=:file")
			.set_parameter("file", basename);

		if (!db.exec_select(query)) {
			json_error(res, 500, db.get_error(), req.isKeepAlive());
			return true;
		}

		long long position_ms = 0;
		bool found = false;
		if (!db.empty()) {
			const acl::db_row* row = db.get_first_row();
			if (row != NULL) {
				const char* v = (*row)["position_ms"];
				if (v != NULL) {
					position_ms = atoll(v);
					if (position_ms < 0) {
						position_ms = 0;
					}
				}
				found = true;
			}
		}
		db.free_result();

		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", true);
		root.add_text("file", basename);
		root.add_bool("found", found);
		root.add_number("position_ms", position_ms);
		return sendJson(res, 200, root, req.isKeepAlive());
	}
}

bool VideoResumeSetAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string db_err;
	if (!ensure_video_resume_db_for_request(upload_dir, db_err)) {
		json_error(res, 500, db_err.c_str(), req.isKeepAlive());
		return true;
	}

	const char* file = req.getParameter("file");
	if (file == NULL || *file == '\0') {
		json_error(res, 400, "missing query parameter: file", req.isKeepAlive());
		return true;
	}

	const char* basename = acl_safe_basename(file);
	if (basename == NULL || *basename == '\0' || strcmp(basename, file) != 0) {
		json_error(res, 400, "invalid file name", req.isKeepAlive());
		return true;
	}

	long long position_ms = 0;
	const char* position = req.getParameter("position_ms");
	if (!parse_non_negative_i64(position, position_ms)) {
		json_error(res, 400, "invalid query parameter: position_ms", req.isKeepAlive());
		return true;
	}

	{
		std::lock_guard<std::mutex> guard(g_resume_mutex);
		if (!g_resume_db_ready || g_resume_db_file.empty()) {
			json_error(res, 500, "resume database not initialized", req.isKeepAlive());
			return true;
		}

		acl::db_sqlite db(g_resume_db_file.c_str(), "utf-8");
		if (!db.open()) {
			json_error(res, 500, db.get_error(), req.isKeepAlive());
			return true;
		}
		db.set_busy_timeout(3000);

		acl::query query;
		query.create(
			"INSERT INTO video_resume(file_name, position_ms, updated_at) "
			"VALUES(:file, :position_ms, strftime('%s','now')) "
			"ON CONFLICT(file_name) DO UPDATE SET "
			"position_ms=excluded.position_ms, updated_at=excluded.updated_at")
			.set_parameter("file", basename)
			.set_parameter("position_ms", position_ms);

		if (!db.exec_update(query)) {
			json_error(res, 500, db.get_error(), req.isKeepAlive());
			return true;
		}
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("file", basename);
	root.add_number("position_ms", position_ms);
	root.add_text("message", "resume position saved");
	return sendJson(res, 200, root, req.isKeepAlive());
}

} // namespace action
