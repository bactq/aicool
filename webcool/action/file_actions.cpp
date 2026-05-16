#include "actions.h"
#include "action_util.h"

#include <dirent.h>
#include <errno.h>
#include <strings.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>

#include <algorithm>
#include <map>
#include <mutex>
#include <stdlib.h>
#include <string>
#include <vector>

namespace action {

namespace {

static std::mutex g_recycle_mutex;
static std::string g_recycle_db_file;
static bool g_recycle_db_ready = false;
static unsigned long g_recycle_seq = 0;

static const char* g_recycle_table_create_sql =
	"CREATE TABLE IF NOT EXISTS recycle_bin ("
	"id INTEGER PRIMARY KEY AUTOINCREMENT,"
	"recycle_name TEXT NOT NULL UNIQUE,"
	"original_path TEXT NOT NULL,"
	"original_name TEXT NOT NULL,"
	"deleted_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))"
	")";

static const char* g_recycle_table_index_sql =
	"CREATE INDEX IF NOT EXISTS idx_recycle_bin_deleted_at"
	" ON recycle_bin(deleted_at DESC)";

struct file_entry_t {
	std::string name;
	std::string path;
	std::string folder_path;
	std::string recycle_original_name;
	std::string recycle_original_path;
	long long size;
	long long uploaded_at;
	std::string uploaded_time;
};

struct recycle_record_t {
	std::string original_path;
	std::string original_name;
};

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

static bool ensure_recycle_tables_locked(std::string& err) {
	err.clear();
	if (g_recycle_db_file.empty()) {
		err = "recycle database file is empty";
		return false;
	}

	acl::db_sqlite db(g_recycle_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query q1;
	q1.create(g_recycle_table_create_sql);
	if (!db.exec_update(q1)) {
		err = db.get_error();
		return false;
	}

	acl::query q2;
	q2.create(g_recycle_table_index_sql);
	if (!db.exec_update(q2)) {
		err = db.get_error();
		return false;
	}

	return true;
}

static bool ensure_recycle_db_for_request(const std::string& upload_dir,
	std::string& err)
{
	err.clear();
	if (!g_recycle_db_ready || g_recycle_db_file.empty()) {
		if (!init_recycle_bin_db(upload_dir, err)) {
			return false;
		}
	}

	std::lock_guard<std::mutex> guard(g_recycle_mutex);
	if (!ensure_recycle_tables_locked(err)) {
		g_recycle_db_ready = false;
		return false;
	}
	g_recycle_db_ready = true;
	return true;
}

static std::string make_recycle_unique_name(const std::string& original_name) {
	const time_t now = time(NULL);
	char buf[128];
	++g_recycle_seq;
	snprintf(buf, sizeof(buf), "%lld_%d_%lu_%s",
		(long long) now, (int) getpid(), g_recycle_seq, original_name.c_str());
	return std::string(buf);
}

static std::string build_restore_candidate_path(const std::string& original_path,
	int attempt)
{
	if (attempt <= 0) {
		return original_path;
	}

	const std::string parent = parent_relative_path(original_path);
	const std::string base = base_name_from_relative_path(original_path);
	std::string stem = base;
	std::string ext;
	const std::string::size_type dot = base.rfind('.');
	if (dot != std::string::npos && dot > 0) {
		stem = base.substr(0, dot);
		ext = base.substr(dot);
	}

	char suffix[48];
	snprintf(suffix, sizeof(suffix), " (restore %d)", attempt);
	const std::string renamed = stem + suffix + ext;
	return parent.empty() ? renamed : (parent + "/" + renamed);
}

static bool alloc_recycle_target_path(const std::string& upload_dir,
	const std::string& original_name, std::string& recycle_rel, std::string& err)
{
	err.clear();
	recycle_rel.clear();
	if (!make_dir_recursive(join_upload_path(upload_dir, recycle_folder_name()).c_str())) {
		err = "cannot access recycle folder";
		return false;
	}

	for (int i = 0; i < 1024; ++i) {
		std::string unique_name = make_recycle_unique_name(original_name);
		std::string candidate = std::string(recycle_folder_name()) + "/" + unique_name;
		if (!upload_regular_file_exists(upload_dir, candidate)) {
			recycle_rel = candidate;
			return true;
		}
	}

	err = "cannot allocate recycle file name";
	return false;
}

static bool insert_recycle_record(const std::string& upload_dir,
	const std::string& recycle_rel, const std::string& original_path,
	std::string& err)
{
	err.clear();
	if (!ensure_recycle_db_for_request(upload_dir, err)) {
		return false;
	}

	const std::string recycle_name = base_name_from_relative_path(recycle_rel);
	const std::string original_name = base_name_from_relative_path(original_path);

	std::lock_guard<std::mutex> guard(g_recycle_mutex);
	acl::db_sqlite db(g_recycle_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query q;
	q.create("INSERT INTO recycle_bin(recycle_name, original_path, original_name, deleted_at)"
		" VALUES(:recycle_name, :original_path, :original_name, strftime('%s','now'))")
		.set_parameter("recycle_name", recycle_name.c_str())
		.set_parameter("original_path", original_path.c_str())
		.set_parameter("original_name", original_name.c_str());
	if (!db.exec_update(q)) {
		err = db.get_error();
		return false;
	}
	return true;
}

static bool load_recycle_records_map(const std::string& upload_dir,
	std::map<std::string, recycle_record_t>& out, std::string& err)
{
	err.clear();
	out.clear();
	if (!ensure_recycle_db_for_request(upload_dir, err)) {
		return false;
	}

	std::lock_guard<std::mutex> guard(g_recycle_mutex);
	acl::db_sqlite db(g_recycle_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query q;
	q.create("SELECT recycle_name, original_path, original_name FROM recycle_bin");
	if (!db.exec_select(q)) {
		err = db.get_error();
		return false;
	}

	for (size_t i = 0; i < db.length(); ++i) {
		const acl::db_row* row = db[i];
		if (row == NULL) {
			continue;
		}
		const char* recycle_name = (*row)["recycle_name"];
		if (recycle_name == NULL || *recycle_name == '\0') {
			continue;
		}
		recycle_record_t rec;
		const char* original_path = (*row)["original_path"];
		const char* original_name = (*row)["original_name"];
		rec.original_path = original_path ? original_path : "";
		rec.original_name = original_name ? original_name : "";
		out[recycle_name] = rec;
	}
	db.free_result();
	return true;
}

static bool get_recycle_record(const std::string& upload_dir,
	const std::string& recycle_rel, recycle_record_t& rec,
	bool& found, std::string& err)
{
	err.clear();
	found = false;
	rec.original_name.clear();
	rec.original_path.clear();
	if (!ensure_recycle_db_for_request(upload_dir, err)) {
		return false;
	}

	const std::string recycle_name = base_name_from_relative_path(recycle_rel);
	std::lock_guard<std::mutex> guard(g_recycle_mutex);
	acl::db_sqlite db(g_recycle_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query q;
	q.create("SELECT original_path, original_name FROM recycle_bin WHERE recycle_name=:recycle_name")
		.set_parameter("recycle_name", recycle_name.c_str());
	if (!db.exec_select(q)) {
		err = db.get_error();
		return false;
	}

	if (!db.empty()) {
		const acl::db_row* row = db.get_first_row();
		if (row != NULL) {
			const char* original_path = (*row)["original_path"];
			const char* original_name = (*row)["original_name"];
			rec.original_path = original_path ? original_path : "";
			rec.original_name = original_name ? original_name : "";
			found = true;
		}
	}
	db.free_result();
	return true;
}

static bool resolve_restore_target_path(const std::string& upload_dir,
	const recycle_record_t& rec, std::string& target_path,
	std::string& err)
{
	err.clear();
	target_path.clear();
	if (rec.original_path.empty()) {
		err = "recycle record missing original path";
		return false;
	}
	if (is_recycle_file_path(rec.original_path)) {
		err = "invalid recycle record";
		return false;
	}

	for (int i = 0; i < 1024; ++i) {
		const std::string candidate = build_restore_candidate_path(rec.original_path, i);
		if (!upload_regular_file_exists(upload_dir, candidate)
			&& !upload_directory_exists(upload_dir, candidate))
		{
			target_path = candidate;
			return true;
		}
	}

	err = "cannot allocate restore target path";
	return false;
}

static bool delete_recycle_record(const std::string& upload_dir,
	const std::string& recycle_rel, std::string& err)
{
	err.clear();
	if (!ensure_recycle_db_for_request(upload_dir, err)) {
		return false;
	}

	const std::string recycle_name = base_name_from_relative_path(recycle_rel);
	std::lock_guard<std::mutex> guard(g_recycle_mutex);
	acl::db_sqlite db(g_recycle_db_file.c_str(), "utf-8");
	if (!db.open()) {
		err = db.get_error();
		return false;
	}
	db.set_busy_timeout(3000);

	acl::query q;
	q.create("DELETE FROM recycle_bin WHERE recycle_name=:recycle_name")
		.set_parameter("recycle_name", recycle_name.c_str());
	if (!db.exec_update(q)) {
		err = db.get_error();
		return false;
	}
	return true;
}

static bool soft_delete_to_recycle(const std::string& upload_dir,
	const std::string& file_path, std::string& recycle_path, std::string& err)
{
	err.clear();
	recycle_path.clear();

	const std::string original_name = base_name_from_relative_path(file_path);
	if (original_name.empty()) {
		err = "invalid file path";
		return false;
	}
	if (!alloc_recycle_target_path(upload_dir, original_name, recycle_path, err)) {
		return false;
	}

	const std::string from_full = join_upload_path(upload_dir, file_path);
	const std::string to_full = join_upload_path(upload_dir, recycle_path);
	if (::rename(from_full.c_str(), to_full.c_str()) != 0) {
		err = "move file to recycle bin failed";
		return false;
	}

	bool tag_renamed = false;
	if (!tag_rename_file(upload_dir, file_path, recycle_path, err)) {
		(void) ::rename(to_full.c_str(), from_full.c_str());
		return false;
	}
	tag_renamed = true;

	if (!video_resume_rename_file(upload_dir, file_path, recycle_path, err)) {
		if (tag_renamed) {
			std::string rollback_err;
			tag_rename_file(upload_dir, recycle_path, file_path, rollback_err);
		}
		(void) ::rename(to_full.c_str(), from_full.c_str());
		return false;
	}

	if (!insert_recycle_record(upload_dir, recycle_path, file_path, err)) {
		std::string rollback_err;
		video_resume_rename_file(upload_dir, recycle_path, file_path, rollback_err);
		tag_rename_file(upload_dir, recycle_path, file_path, rollback_err);
		(void) ::rename(to_full.c_str(), from_full.c_str());
		return false;
	}

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

static void format_upload_time(time_t ts, char* buf, size_t size) {
	if (buf == NULL || size == 0) {
		return;
	}
	if (ts <= 0) {
		buf[0] = '\0';
		return;
	}
	struct tm tmv;
	if (localtime_r(&ts, &tmv) == NULL) {
		buf[0] = '\0';
		return;
	}
	if (strftime(buf, size, "%Y-%m-%d %H:%M:%S", &tmv) == 0) {
		buf[0] = '\0';
	}
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

static bool is_image_file(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	return dot != NULL && (
		strcasecmp(dot, ".png") == 0 || strcasecmp(dot, ".jpg") == 0
		|| strcasecmp(dot, ".jpeg") == 0 || strcasecmp(dot, ".gif") == 0);
}

static bool is_video_file(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	return dot != NULL && (
		strcasecmp(dot, ".mp4") == 0 || strcasecmp(dot, ".avi") == 0
		|| strcasecmp(dot, ".mkv") == 0 || strcasecmp(dot, ".rmvb") == 0);
}

static bool is_audio_file(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	return dot != NULL && (
		strcasecmp(dot, ".mp3") == 0 || strcasecmp(dot, ".m4a") == 0
		|| strcasecmp(dot, ".aac") == 0 || strcasecmp(dot, ".wav") == 0
		|| strcasecmp(dot, ".ogg") == 0 || strcasecmp(dot, ".flac") == 0);
}

static bool is_text_file(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	return dot != NULL && (
		strcasecmp(dot, ".txt") == 0 || strcasecmp(dot, ".md") == 0
		|| strcasecmp(dot, ".log") == 0 || strcasecmp(dot, ".csv") == 0
		|| strcasecmp(dot, ".json") == 0 || strcasecmp(dot, ".xml") == 0
		|| strcasecmp(dot, ".yaml") == 0 || strcasecmp(dot, ".yml") == 0
		|| strcasecmp(dot, ".ini") == 0 || strcasecmp(dot, ".conf") == 0
		|| strcasecmp(dot, ".c") == 0 || strcasecmp(dot, ".h") == 0
		|| strcasecmp(dot, ".cpp") == 0 || strcasecmp(dot, ".hpp") == 0
		|| strcasecmp(dot, ".cc") == 0 || strcasecmp(dot, ".java") == 0
		|| strcasecmp(dot, ".py") == 0 || strcasecmp(dot, ".js") == 0
		|| strcasecmp(dot, ".ts") == 0 || strcasecmp(dot, ".sh") == 0
		|| strcasecmp(dot, ".go") == 0 || strcasecmp(dot, ".sql") == 0
		|| strcasecmp(dot, ".proto") == 0);
}

static const char* image_content_type(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	if (dot == NULL) {
		return "application/octet-stream";
	}
	if (strcasecmp(dot, ".png") == 0) {
		return "image/png";
	}
	if (strcasecmp(dot, ".jpg") == 0 || strcasecmp(dot, ".jpeg") == 0) {
		return "image/jpeg";
	}
	if (strcasecmp(dot, ".gif") == 0) {
		return "image/gif";
	}
	return "application/octet-stream";
}

static const char* video_content_type(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	if (dot == NULL) {
		return "application/octet-stream";
	}
	if (strcasecmp(dot, ".mp4") == 0) {
		return "video/mp4";
	}
	if (strcasecmp(dot, ".avi") == 0) {
		return "video/x-msvideo";
	}
	if (strcasecmp(dot, ".mkv") == 0) {
		return "video/x-matroska";
	}
	if (strcasecmp(dot, ".rmvb") == 0) {
		return "application/vnd.rn-realmedia-vbr";
	}
	return "application/octet-stream";
}

static const char* audio_content_type(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	if (dot == NULL) {
		return "application/octet-stream";
	}
	if (strcasecmp(dot, ".mp3") == 0) {
		return "audio/mpeg";
	}
	if (strcasecmp(dot, ".m4a") == 0) {
		return "audio/mp4";
	}
	if (strcasecmp(dot, ".aac") == 0) {
		return "audio/aac";
	}
	if (strcasecmp(dot, ".wav") == 0) {
		return "audio/wav";
	}
	if (strcasecmp(dot, ".ogg") == 0) {
		return "audio/ogg";
	}
	if (strcasecmp(dot, ".flac") == 0) {
		return "audio/flac";
	}
	return "application/octet-stream";
}

static const char* text_content_type(const char* filename) {
	const char* dot = filename ? strrchr(filename, '.') : NULL;
	if (dot == NULL) {
		return "text/plain; charset=utf-8";
	}
	if (strcasecmp(dot, ".json") == 0) {
		return "application/json; charset=utf-8";
	}
	if (strcasecmp(dot, ".xml") == 0) {
		return "application/xml; charset=utf-8";
	}
	if (strcasecmp(dot, ".csv") == 0) {
		return "text/csv; charset=utf-8";
	}
	return "text/plain; charset=utf-8";
}

static bool parse_range_value(const char* s, long long& out) {
	if (s == NULL || *s == '\0') {
		return false;
	}
	errno = 0;
	char* end = NULL;
	long long v = strtoll(s, &end, 10);
	if (errno != 0 || end == s || *end != '\0' || v < 0) {
		return false;
	}
	out = v;
	return true;
}

static bool parse_range_header(const char* range, long long size,
	long long& begin, long long& end)
{
	if (range == NULL || size <= 0) {
		return false;
	}
	if (strncasecmp(range, "bytes=", 6) != 0) {
		return false;
	}
	const char* expr = range + 6;
	if (*expr == '\0' || strchr(expr, ',') != NULL) {
		return false;
	}
	const char* dash = strchr(expr, '-');
	if (dash == NULL) {
		return false;
	}
	if (dash == expr) {
		long long suffix = 0;
		if (!parse_range_value(dash + 1, suffix) || suffix <= 0) {
			return false;
		}
		if (suffix > size) {
			suffix = size;
		}
		begin = size - suffix;
		end = size - 1;
		return true;
	}

	acl::string left(expr, (size_t) (dash - expr));
	long long start = 0;
	if (!parse_range_value(left.c_str(), start) || start >= size) {
		return false;
	}
	if (*(dash + 1) == '\0') {
		begin = start;
		end = size - 1;
		return true;
	}

	long long stop = 0;
	if (!parse_range_value(dash + 1, stop) || stop < start) {
		return false;
	}
	if (stop >= size) {
		stop = size - 1;
	}
	begin = start;
	end = stop;
	return true;
}

static bool collect_files_recursive(const std::string& upload_dir,
	const std::string& relative_dir, std::vector<file_entry_t>& out,
	std::string& err)
{
	err.clear();
	const std::string full_dir = join_upload_path(upload_dir, relative_dir);
	DIR* dir = opendir(full_dir.c_str());
	if (dir == NULL) {
		err = strerror(errno);
		return false;
	}

	struct dirent* entry = NULL;
	while ((entry = readdir(dir)) != NULL) {
		if (should_skip_entry(entry->d_name)) {
			continue;
		}
		const std::string name(entry->d_name);
		const std::string rel_path = relative_dir.empty() ? name : (relative_dir + "/" + name);
		const std::string full_path = join_upload_path(upload_dir, rel_path);
		struct stat st;
		if (stat(full_path.c_str(), &st) != 0) {
			continue;
		}
		if (S_ISDIR(st.st_mode)) {
			if (!collect_files_recursive(upload_dir, rel_path, out, err)) {
				closedir(dir);
				return false;
			}
			continue;
		}
		if (!S_ISREG(st.st_mode)) {
			continue;
		}

		char uploaded_time[32];
		uploaded_time[0] = '\0';
		format_upload_time(st.st_mtime, uploaded_time, sizeof(uploaded_time));

		file_entry_t item;
		item.name = name;
		item.path = rel_path;
		item.folder_path = relative_dir;
		item.size = (long long) st.st_size;
		item.uploaded_at = (long long) st.st_mtime;
		item.uploaded_time = uploaded_time;
		out.push_back(item);
	}
	closedir(dir);
	return true;
}

} // namespace

bool FilesAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	if (!make_dir_recursive(upload_dir.c_str())) {
		json_error(res, 500, "cannot access upload dir", req.isKeepAlive());
		return true;
	}

	std::string filter_folder;
	std::string err;
	const char* folder_text = req.getParameter("folder");
	if (folder_text != NULL && *folder_text != '\0'
		&& !normalize_relative_path(folder_text, filter_folder, err, true))
	{
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	std::vector<file_entry_t> entries;
	if (!collect_files_recursive(upload_dir, std::string(), entries, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	std::sort(entries.begin(), entries.end(),
		[](const file_entry_t& a, const file_entry_t& b) {
			return a.path < b.path;
		});

	std::map<std::string, recycle_record_t> recycle_records;
	bool need_recycle_records = false;
	for (size_t i = 0; i < entries.size(); ++i) {
		if (is_recycle_file_path(entries[i].path)) {
			need_recycle_records = true;
			break;
		}
	}
	if (need_recycle_records && !load_recycle_records_map(upload_dir, recycle_records, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	acl::json_node& files = json.create_array();
	root.add_child("files", files);
	long long count = 0;
	for (size_t i = 0; i < entries.size(); ++i) {
		file_entry_t item_ref = entries[i];
		if (is_recycle_file_path(item_ref.path)) {
			const std::string recycle_name = base_name_from_relative_path(item_ref.path);
			std::map<std::string, recycle_record_t>::const_iterator it = recycle_records.find(recycle_name);
			if (it != recycle_records.end()) {
				item_ref.recycle_original_name = it->second.original_name;
				item_ref.recycle_original_path = it->second.original_path;
				if (!item_ref.recycle_original_name.empty()) {
					item_ref.name = item_ref.recycle_original_name;
				}
			}
		}
		if (!filter_folder.empty() && item_ref.folder_path != filter_folder) {
			continue;
		}
		acl::json_node& item = files.add_child(false, true);
		item.add_text("name", item_ref.name.c_str());
		item.add_text("path", item_ref.path.c_str());
		item.add_text("folder_path", item_ref.folder_path.c_str());
		item.add_text("recycle_original_name", item_ref.recycle_original_name.c_str());
		item.add_text("recycle_original_path", item_ref.recycle_original_path.c_str());
		item.add_number("size", item_ref.size);
		item.add_number("uploaded_at", item_ref.uploaded_at);
		item.add_text("uploaded_time", item_ref.uploaded_time.c_str());
		count++;
	}
	if (!filter_folder.empty()) {
		root.add_text("folder", filter_folder.c_str());
	}
	root.add_number("count", count);
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool DeleteAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string file_path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("file"), file_path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}

	if (!upload_regular_file_exists(upload_dir, file_path)) {
		json_error(res, 404, "file not found", req.isKeepAlive());
		return true;
	}

	const bool hard_delete = is_recycle_file_path(file_path);
	if (hard_delete) {
		const std::string fullpath = join_upload_path(upload_dir, file_path);
		if (::unlink(fullpath.c_str()) != 0) {
			json_error(res, 404, "file not found or delete failed", req.isKeepAlive());
			return true;
		}

		err.clear();
		if (!delete_recycle_record(upload_dir, file_path, err)
			|| !folder_unbind_file(upload_dir, file_path, err)
			|| !tag_unbind_file(upload_dir, file_path, err))
		{
			json_error(res, 500, err.c_str(), req.isKeepAlive());
			return true;
		}
	} else {
		std::string recycle_path;
		if (!soft_delete_to_recycle(upload_dir, file_path, recycle_path, err)) {
			json_error(res, 500, err.c_str(), req.isKeepAlive());
			return true;
		}
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("file", file_path.c_str());
	root.add_text("message", hard_delete ? "deleted permanently" : "moved to recycle bin");
	root.add_bool("permanent", hard_delete);
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool RestoreAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string file_path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("file"), file_path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!is_recycle_file_path(file_path)) {
		json_error(res, 400, "restore only supports recycle files", req.isKeepAlive());
		return true;
	}
	if (!upload_regular_file_exists(upload_dir, file_path)) {
		json_error(res, 404, "recycle file not found", req.isKeepAlive());
		return true;
	}

	recycle_record_t rec;
	bool found = false;
	if (!get_recycle_record(upload_dir, file_path, rec, found, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!found) {
		json_error(res, 404, "recycle record not found", req.isKeepAlive());
		return true;
	}

	std::string target_path;
	if (!resolve_restore_target_path(upload_dir, rec, target_path, err)) {
		json_error(res, 409, err.c_str(), req.isKeepAlive());
		return true;
	}

	const std::string target_parent = parent_relative_path(target_path);
	if (!target_parent.empty()) {
		const std::string parent_full = join_upload_path(upload_dir, target_parent);
		if (!make_dir_recursive(parent_full.c_str())) {
			json_error(res, 500, "cannot restore target folder", req.isKeepAlive());
			return true;
		}
	}

	const std::string from_full = join_upload_path(upload_dir, file_path);
	const std::string to_full = join_upload_path(upload_dir, target_path);
	if (::rename(from_full.c_str(), to_full.c_str()) != 0) {
		json_error(res, 500, "restore file failed", req.isKeepAlive());
		return true;
	}

	bool tag_renamed = false;
	if (!tag_rename_file(upload_dir, file_path, target_path, err)) {
		(void) ::rename(to_full.c_str(), from_full.c_str());
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	tag_renamed = true;

	if (!video_resume_rename_file(upload_dir, file_path, target_path, err)) {
		if (tag_renamed) {
			std::string rollback_err;
			tag_rename_file(upload_dir, target_path, file_path, rollback_err);
		}
		(void) ::rename(to_full.c_str(), from_full.c_str());
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	if (!delete_recycle_record(upload_dir, file_path, err)) {
		std::string rollback_err;
		video_resume_rename_file(upload_dir, target_path, file_path, rollback_err);
		tag_rename_file(upload_dir, target_path, file_path, rollback_err);
		(void) ::rename(to_full.c_str(), from_full.c_str());
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("file", file_path.c_str());
	root.add_text("path", target_path.c_str());
	root.add_text("message", "restored");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool MoveFileAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string file_path;
	std::string target_folder;
	std::string err;
	if (!normalize_relative_path(req.getParameter("file"), file_path, err, false)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!normalize_relative_path(req.getParameter("folder"), target_folder, err, true)) {
		json_error(res, 400, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!upload_regular_file_exists(upload_dir, file_path)) {
		json_error(res, 404, "source file not found", req.isKeepAlive());
		return true;
	}
	if (!target_folder.empty() && !upload_directory_exists(upload_dir, target_folder)) {
		json_error(res, 404, "target folder not found", req.isKeepAlive());
		return true;
	}

	const std::string target_path = target_folder.empty()
		? base_name_from_relative_path(file_path)
		: (target_folder + "/" + base_name_from_relative_path(file_path));
	if (target_path == file_path) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", true);
		root.add_text("file", file_path.c_str());
		root.add_text("path", target_path.c_str());
		root.add_text("message", "file unchanged");
		return sendJson(res, 200, root, req.isKeepAlive());
	}
	if (upload_regular_file_exists(upload_dir, target_path)) {
		json_error(res, 409, "target file already exists", req.isKeepAlive());
		return true;
	}

	const std::string from_full = join_upload_path(upload_dir, file_path);
	const std::string to_full = join_upload_path(upload_dir, target_path);
	if (::rename(from_full.c_str(), to_full.c_str()) != 0) {
		json_error(res, 500, "move file failed", req.isKeepAlive());
		return true;
	}

	std::string rename_err;
	if (!tag_rename_file(upload_dir, file_path, target_path, rename_err)
		|| !video_resume_rename_file(upload_dir, file_path, target_path, rename_err))
	{
		(void) ::rename(to_full.c_str(), from_full.c_str());
		json_error(res, 500, rename_err.c_str(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("file", file_path.c_str());
	root.add_text("path", target_path.c_str());
	root.add_text("folder_path", target_folder.c_str());
	root.add_text("message", "file moved");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool DownloadAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	std::string file_path;
	std::string err;
	if (!normalize_relative_path(req.getParameter("file"), file_path, err, false)) {
		return sendText(res, 400, "invalid file name\n", req.isKeepAlive());
	}

	const std::string fullpath = join_upload_path(upload_dir, file_path);
	const std::string basename = base_name_from_relative_path(file_path);

	acl::ifstream in;
	if (!in.open_read(fullpath.c_str())) {
		return sendText(res, 404, "file not found\n", req.isKeepAlive());
	}

	long long fsize = in.fsize();
	if (fsize < 0) {
		in.close();
		return sendText(res, 500, "cannot read file size\n", req.isKeepAlive());
	}
	if (fsize == 0) {
		in.close();
		return sendText(res, 409, "file is empty, please re-upload\n", req.isKeepAlive());
	}

	const bool is_image = is_image_file(basename.c_str());
	const bool is_video = is_video_file(basename.c_str());
	const bool is_audio = is_audio_file(basename.c_str());
	const bool is_text = is_text_file(basename.c_str());
	const char* preview = req.getParameter("preview");
	const bool inline_preview = (is_image || is_video || is_audio || is_text)
		&& preview != NULL && strcmp(preview, "1") == 0;
	const char* range = req.getHeader("Range");
	long long range_begin = 0;
	long long range_end = 0;
	const bool has_range = parse_range_header(range, fsize, range_begin, range_end);
	const bool want_range = range != NULL && *range != '\0';
	if (want_range && !has_range) {
		acl::string cr;
		cr.format("bytes */%lld", fsize);
		res.setStatus(416)
			.setKeepAlive(req.isKeepAlive())
			.setHeader("Content-Range", cr.c_str())
			.setHeader("Accept-Ranges", "bytes")
			.setContentType("text/plain; charset=utf-8");
		const char* msg = "invalid range\n";
		res.setContentLength((long long) strlen(msg));
		return res.write(msg, strlen(msg)) && res.write(NULL, 0);
	}

	acl::string dispo;
	if (inline_preview) {
		dispo.format("inline; filename=\"%s\"", basename.c_str());
	} else {
		dispo.format("attachment; filename=\"%s\"", basename.c_str());
	}

	const char* ctype = "application/octet-stream";
	if (is_image) {
		ctype = image_content_type(basename.c_str());
	} else if (is_video) {
		ctype = video_content_type(basename.c_str());
	} else if (is_audio) {
		ctype = audio_content_type(basename.c_str());
	} else if (is_text) {
		ctype = text_content_type(basename.c_str());
	}

	long long send_begin = has_range ? range_begin : 0;
	long long send_end = has_range ? range_end : (fsize - 1);
	long long send_size = send_end - send_begin + 1;
	if (send_size < 0) {
		return sendText(res, 500, "invalid send size\n", req.isKeepAlive());
	}
	if (send_begin > 0 && in.fseek(send_begin, SEEK_SET) < 0) {
		in.close();
		return sendText(res, 500, "seek file failed\n", req.isKeepAlive());
	}

	if (has_range) {
		acl::string content_range;
		content_range.format("bytes %lld-%lld/%lld", send_begin, send_end, fsize);
		printf("content range: %s\n", content_range.c_str());
		res.setStatus(206)
			.setKeepAlive(req.isKeepAlive())
			.setContentType(ctype)
			.setHeader("Content-Disposition", dispo.c_str())
			.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
			.setHeader("Pragma", "no-cache")
			.setHeader("Expires", "0")
			.setHeader("Accept-Ranges", "bytes")
			.setHeader("Content-Range", content_range.c_str())
			.setContentLength(send_size);
	} else {
		res.setStatus(200)
			.setKeepAlive(req.isKeepAlive())
			.setContentType(ctype)
			.setHeader("Content-Disposition", dispo.c_str())
			.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
			.setHeader("Pragma", "no-cache")
			.setHeader("Expires", "0")
			.setHeader("Accept-Ranges", "bytes")
			.setContentLength(fsize);
	}

	char buf[8192];
	long long remain = send_size;
	long long total_sent = 0;
	while (remain > 0 && !in.eof()) {
		size_t want = sizeof(buf);
		if ((long long) want > remain) {
			want = (size_t) remain;
		}
		int n = in.read(buf, want, false);
		if (n == -1) {
			break;
		}
		if (n == 0) {
			continue;
		}
		if (!res.write(buf, (size_t) n)) {
			in.close();
			printf("1->sent remain %lld bytes, total sent %lld bytes\n",remain, total_sent);
			return false;
		}
		remain -= n;
		total_sent += n;
		//printf("sent %d bytes, remain %lld bytes, total sent %lld bytes\n", n, remain, total_sent);
	}

	printf("2->sent remain %lld bytes, total sent %lld bytes\n",remain, total_sent);
	in.close();
	return res.write(NULL, 0);
}

bool init_recycle_bin_db(const std::string& upload_dir, std::string& err) {
	err.clear();

	std::lock_guard<std::mutex> guard(g_recycle_mutex);
	if (g_recycle_db_ready) {
		return true;
	}

	if (!make_dir_recursive(upload_dir.c_str())) {
		err = "cannot access upload dir";
		return false;
	}
	const std::string recycle_dir = join_upload_path(upload_dir, recycle_folder_name());
	if (!make_dir_recursive(recycle_dir.c_str())) {
		err = "cannot access recycle folder";
		return false;
	}

	std::string sqlite_lib_path = choose_sqlite_lib_path();
	if (sqlite_lib_path.empty()) {
		err = "sqlite dynamic library not found";
		return false;
	}
	acl::db_handle::set_loadpath(sqlite_lib_path.c_str());

	acl::string db_file;
	db_file.format("%s/.recycle_bin.db", upload_dir.c_str());
	g_recycle_db_file = db_file.c_str();

	if (!ensure_recycle_tables_locked(err)) {
		return false;
	}

	g_recycle_db_ready = true;
	return true;
}

} // namespace action
