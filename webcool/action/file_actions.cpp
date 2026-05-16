#include "actions.h"
#include "action_util.h"

#include <dirent.h>
#include <errno.h>
#include <strings.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>

#include <algorithm>
#include <stdlib.h>
#include <string>
#include <vector>

namespace action {

namespace {

struct file_entry_t {
	std::string name;
	std::string path;
	std::string folder_path;
	long long size;
	long long uploaded_at;
	std::string uploaded_time;
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

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	acl::json_node& files = json.create_array();
	root.add_child("files", files);
	long long count = 0;
	for (size_t i = 0; i < entries.size(); ++i) {
		const file_entry_t& item_ref = entries[i];
		if (!filter_folder.empty() && item_ref.folder_path != filter_folder) {
			continue;
		}
		acl::json_node& item = files.add_child(false, true);
		item.add_text("name", item_ref.name.c_str());
		item.add_text("path", item_ref.path.c_str());
		item.add_text("folder_path", item_ref.folder_path.c_str());
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

	const std::string fullpath = join_upload_path(upload_dir, file_path);
	if (::unlink(fullpath.c_str()) != 0) {
		json_error(res, 404, "file not found or delete failed", req.isKeepAlive());
		return true;
	}

	err.clear();
	if (!folder_unbind_file(upload_dir, file_path, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}
	if (!tag_unbind_file(upload_dir, file_path, err)) {
		json_error(res, 500, err.c_str(), req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("file", file_path.c_str());
	root.add_text("message", "deleted");
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

} // namespace action
