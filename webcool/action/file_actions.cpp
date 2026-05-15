#include "actions.h"
#include "action_util.h"
#include <sys/stat.h>
#include <time.h>
#include <strings.h>
#include <errno.h>
#include <stdlib.h>
#include <map>

namespace action {

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

static bool is_image_file(const char* filename) {
	if (filename == NULL) {
		return false;
	}

	const char* dot = strrchr(filename, '.');
	if (dot == NULL || *(dot + 1) == '\0') {
		return false;
	}

	return strcasecmp(dot, ".png") == 0
		|| strcasecmp(dot, ".jpg") == 0
		|| strcasecmp(dot, ".jpeg") == 0
		|| strcasecmp(dot, ".gif") == 0;
}

static bool is_video_file(const char* filename) {
	if (filename == NULL) {
		return false;
	}

	const char* dot = strrchr(filename, '.');
	if (dot == NULL || *(dot + 1) == '\0') {
		return false;
	}

	return strcasecmp(dot, ".mp4") == 0
		|| strcasecmp(dot, ".avi") == 0
		|| strcasecmp(dot, ".mkv") == 0
		|| strcasecmp(dot, ".rmvb") == 0;
}

static bool is_audio_file(const char* filename) {
	if (filename == NULL) {
		return false;
	}

	const char* dot = strrchr(filename, '.');
	if (dot == NULL || *(dot + 1) == '\0') {
		return false;
	}

	return strcasecmp(dot, ".mp3") == 0
		|| strcasecmp(dot, ".m4a") == 0
		|| strcasecmp(dot, ".aac") == 0
		|| strcasecmp(dot, ".wav") == 0
		|| strcasecmp(dot, ".ogg") == 0
		|| strcasecmp(dot, ".flac") == 0;
}

static bool is_text_file(const char* filename) {
	if (filename == NULL) {
		return false;
	}

	const char* dot = strrchr(filename, '.');
	if (dot == NULL || *(dot + 1) == '\0') {
		return false;
	}

	return strcasecmp(dot, ".txt") == 0
		|| strcasecmp(dot, ".md") == 0
		|| strcasecmp(dot, ".log") == 0
		|| strcasecmp(dot, ".csv") == 0
		|| strcasecmp(dot, ".json") == 0
		|| strcasecmp(dot, ".xml") == 0
		|| strcasecmp(dot, ".yaml") == 0
		|| strcasecmp(dot, ".yml") == 0
		|| strcasecmp(dot, ".ini") == 0
		|| strcasecmp(dot, ".conf") == 0
		|| strcasecmp(dot, ".c") == 0
		|| strcasecmp(dot, ".h") == 0
		|| strcasecmp(dot, ".cpp") == 0
		|| strcasecmp(dot, ".hpp") == 0
		|| strcasecmp(dot, ".cc") == 0
		|| strcasecmp(dot, ".java") == 0
		|| strcasecmp(dot, ".py") == 0
		|| strcasecmp(dot, ".js") == 0
		|| strcasecmp(dot, ".ts") == 0
		|| strcasecmp(dot, ".sh") == 0
		|| strcasecmp(dot, ".go") == 0
		|| strcasecmp(dot, ".sql") == 0
		|| strcasecmp(dot, ".proto") == 0;
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

bool FilesAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	long long filter_folder_id = 0;
	const char* folder_id_text = req.getParameter("folder_id");
	if (folder_id_text != NULL && *folder_id_text != '\0') {
		errno = 0;
		char* end = NULL;
		long long v = strtoll(folder_id_text, &end, 10);
		if (errno != 0 || end == folder_id_text || *end != '\0' || v <= 0) {
			acl::json json;
			acl::json_node& root = json.create_node();
			root.add_bool("ok", false);
			root.add_text("error", "invalid folder_id");
			return sendJson(res, 400, root, req.isKeepAlive());
		}
		filter_folder_id = v;
	}

	std::map<std::string, long long> file_to_folder_id;
	std::map<long long, std::string> folder_id_to_name;
	std::string rel_err;
	if (!folder_load_file_bindings(upload_dir, file_to_folder_id,
		folder_id_to_name, rel_err))
	{
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", rel_err.c_str());
		return sendJson(res, 500, root, req.isKeepAlive());
	}

	if (!make_dir(upload_dir.c_str())) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "cannot access upload dir");
		return sendJson(res, 500, root, req.isKeepAlive());
	}

	acl::scan_dir scanner;
	if (!scanner.open(upload_dir.c_str(), false, false)) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "open upload dir failed");
		return sendJson(res, 500, root, req.isKeepAlive());
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	acl::json_node& files = json.create_array();
	root.add_child("files", files);

	int count = 0;
	const char* name;
	while ((name = scanner.next_file(false)) != NULL) {
		if (strcmp(name, ".video_resume.db") == 0) {
			continue;
		}
		if (strcmp(name, ".folder_catalog.db") == 0) {
			continue;
		}

		acl::string full;
		full.format("%s/%s", upload_dir.c_str(), name);

		struct stat st;
		if (stat(full.c_str(), &st) == 0 && !S_ISREG(st.st_mode)) {
			continue;
		}

		long long file_folder_id = 0;
		std::string file_folder_name;
		std::map<std::string, long long>::const_iterator fit =
			file_to_folder_id.find(name);
		if (fit != file_to_folder_id.end()) {
			file_folder_id = fit->second;
			std::map<long long, std::string>::const_iterator nit =
				folder_id_to_name.find(file_folder_id);
			if (nit != folder_id_to_name.end()) {
				file_folder_name = nit->second;
			}
		}

		if (filter_folder_id > 0 && file_folder_id != filter_folder_id) {
			continue;
		}

		acl::ifstream in;
		long long fsize = -1;
		if (in.open_read(full.c_str())) {
			fsize = in.fsize();
			in.close();
		}

		time_t uploaded_at = 0;
		char uploaded_time[32];
		uploaded_time[0] = '\0';
		if (stat(full.c_str(), &st) == 0) {
			uploaded_at = st.st_mtime;
			format_upload_time(uploaded_at, uploaded_time, sizeof(uploaded_time));
		}

		acl::json_node& item = files.add_child(false, true);
		item.add_text("name", name);
		item.add_number("size", fsize);
		item.add_number("uploaded_at", (long long) uploaded_at);
		item.add_text("uploaded_time", uploaded_time);
		item.add_number("folder_id", file_folder_id);
		item.add_text("folder_name", file_folder_name.c_str());
		count++;
	}

	if (filter_folder_id > 0) {
		root.add_number("folder_id", filter_folder_id);
	}
	root.add_number("count", count);
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool DeleteAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	const char* file = req.getParameter("file");
	if (file == NULL || *file == '\0') {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "missing query parameter: file");
		return sendJson(res, 400, root, req.isKeepAlive());
	}

	const char* basename = acl_safe_basename(file);
	if (basename == NULL || *basename == '\0' || strcmp(basename, file) != 0) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "invalid file name");
		return sendJson(res, 400, root, req.isKeepAlive());
	}

	acl::string fullpath;
	fullpath.format("%s/%s", upload_dir.c_str(), basename);

	if (::unlink(fullpath.c_str()) != 0) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "file not found or delete failed");
		return sendJson(res, 404, root, req.isKeepAlive());
	}

	std::string rel_err;
	if (!folder_unbind_file(upload_dir, basename, rel_err)) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", rel_err.c_str());
		return sendJson(res, 500, root, req.isKeepAlive());
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("message", "deleted");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool DownloadAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	const char* file = req.getParameter("file");
	if (file == NULL || *file == '\0') {
		return sendText(res, 400, "missing query parameter: file\n",
			req.isKeepAlive());
	}

	const char* basename = acl_safe_basename(file);
	if (basename == NULL || *basename == '\0' || strcmp(basename, file) != 0) {
		return sendText(res, 400, "invalid file name\n", req.isKeepAlive());
	}

	acl::string fullpath;
	fullpath.format("%s/%s", upload_dir.c_str(), basename);

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

	const bool is_image = is_image_file(basename);
	const bool is_video = is_video_file(basename);
	const bool is_audio = is_audio_file(basename);
	const bool is_text = is_text_file(basename);
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
		dispo.format("inline; filename=\"%s\"", basename);
	} else {
		dispo.format("attachment; filename=\"%s\"", basename);
	}

	const char* ctype = "application/octet-stream";
	if (is_image) {
		ctype = image_content_type(basename);
	} else if (is_video) {
		ctype = video_content_type(basename);
	} else if (is_audio) {
		ctype = audio_content_type(basename);
	} else if (is_text) {
		ctype = text_content_type(basename);
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
			return false;
		}
		remain -= n;
	}

	in.close();
	return res.write(NULL, 0);
}

} // namespace action
