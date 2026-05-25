#include "actions.h"
#include "action_util.h"
#ifdef _WIN32
#include "../platform_compat.h"
#else
#include <sys/stat.h>
#include <time.h>
#include <strings.h>
#include <unistd.h>
#endif
#include <errno.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <time.h>

#include <string>

namespace action {

namespace {

static bool seek_file64(FILE* fp, long long offset)
{
#ifdef _WIN32
	return _fseeki64(fp, offset, SEEK_SET) == 0;
#else
	return fseeko(fp, (off_t) offset, SEEK_SET) == 0;
#endif
}

static bool copy_mime_body_to_file(const std::string& tmp_path,
	const std::string& dest, long long body_begin, long long body_end,
	long long& written, std::string& err)
{
	written = 0;
	err.clear();

	if (body_begin < 0 || body_end <= body_begin) {
		err = "invalid mime body range";
		return false;
	}

	FILE* in = fopen(tmp_path.c_str(), "rb");
	if (in == NULL) {
		err = strerror(errno);
		return false;
	}

	if (!seek_file64(in, body_begin)) {
		err = strerror(errno);
		fclose(in);
		return false;
	}

	FILE* out = fopen(dest.c_str(), "wb");
	if (out == NULL) {
		err = strerror(errno);
		fclose(in);
		return false;
	}

	char buf[8192];
	long long remaining = body_end - body_begin;
	bool ok = true;
	while (remaining > 0) {
		const size_t want = remaining > (long long) sizeof(buf)
			? sizeof(buf) : (size_t) remaining;
		const size_t n = fread(buf, 1, want, in);
		if (n == 0) {
			err = ferror(in) ? strerror(errno) : "unexpected end of mime temp file";
			ok = false;
			break;
		}
		if (fwrite(buf, 1, n, out) != n) {
			err = strerror(errno);
			ok = false;
			break;
		}
		written += (long long) n;
		remaining -= (long long) n;
	}

	if (fclose(out) != 0 && ok) {
		err = strerror(errno);
		ok = false;
	}
	fclose(in);

	if (!ok) {
		::unlink(dest.c_str());
		return false;
	}
	return true;
}

} // namespace

bool UploadAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	if (req.getRequestType() != acl::HTTP_REQUEST_MULTIPART_FORM) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "request type must be multipart/form-data");
		return sendJson(res, 400, root, req.isKeepAlive());
	}

	acl::http_mime* mime = req.getHttpMime();
	if (mime == NULL) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "getHttpMime failed");
		return sendJson(res, 400, root, req.isKeepAlive());
	}

	long long content_length = req.getContentLength();
	if (content_length <= 0) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "empty request body");
		return sendJson(res, 400, root, req.isKeepAlive());
	}

	if (!make_dir_recursive(upload_dir.c_str())) {
		fprintf(stderr, "Cannot create upload dir: %s\n", upload_dir.c_str());
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "cannot access upload dir");
		return sendJson(res, 500, root, req.isKeepAlive());
	}

	acl::string tmp_path;
	tmp_path.format("%s/.mime_tmp.%u.%d", upload_dir.c_str(),
		(unsigned) getpid(), acl::fiber::self());

	acl::ofstream fp;
	if (!fp.open_write(tmp_path.c_str())) {
		fprintf(stderr, "open tmp file %s error: %s\n",
			tmp_path.c_str(), acl::last_serror());
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "open temp file failed");
		return sendJson(res, 500, root, req.isKeepAlive());
	}

    printf(">>Begin write to %s\r\n", tmp_path.c_str());

	mime->set_saved_path(tmp_path.c_str());

	if (!readBody(req, content_length, fp, *mime)) {
		fp.close();
		::unlink(tmp_path.c_str());
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", false);
		root.add_text("error", "read request body failed");
		return sendJson(res, 500, root, req.isKeepAlive());
	}
	fp.close();

	// Verify temporary MIME file was actually written
	{
		acl::ifstream tmp_check;
		long long tmp_size = -1;
		if (tmp_check.open_read(tmp_path.c_str())) {
			tmp_size = tmp_check.fsize();
			tmp_check.close();
			fprintf(stderr, "[TMP-FILE] %s size=%lld bytes\n", tmp_path.c_str(), tmp_size);
		} else {
			fprintf(stderr, "[TMP-ERROR] Cannot open tmp file %s: %s\n", tmp_path.c_str(), acl::last_serror());
		}
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	acl::json_node& files = json.create_array();
	root.add_child("files", files);

	std::string folder_path;
	std::string path_err;
	if (!normalize_relative_path(req.getParameter("folder"), folder_path, path_err, true)) {
			::unlink(tmp_path.c_str());
			acl::json err;
			acl::json_node& eroot = err.create_node();
			eroot.add_bool("ok", false);
			eroot.add_text("error", path_err.c_str());
			return sendJson(res, 400, eroot, req.isKeepAlive());
		}
	if (!folder_path.empty() && !upload_directory_exists(upload_dir, folder_path)) {
		::unlink(tmp_path.c_str());
		acl::json err;
		acl::json_node& eroot = err.create_node();
		eroot.add_bool("ok", false);
		eroot.add_text("error", "target folder not found");
		return sendJson(res, 404, eroot, req.isKeepAlive());
	}
	{
		bool lock_allowed = false;
		std::string locked_path;
		std::string lock_err;
		if (!folder_lock_path_allows(upload_dir, folder_path,
			req.getParameter("folder_password") ? req.getParameter("folder_password") : "",
			lock_allowed, locked_path, lock_err))
		{
			::unlink(tmp_path.c_str());
			acl::json err;
			acl::json_node& eroot = err.create_node();
			eroot.add_bool("ok", false);
			eroot.add_text("error", lock_err.c_str());
			return sendJson(res, 500, eroot, req.isKeepAlive());
		}
		if (!lock_allowed) {
			::unlink(tmp_path.c_str());
			acl::json err;
			acl::json_node& eroot = err.create_node();
			eroot.add_bool("ok", false);
			eroot.add_text("error", "folder is locked");
			return sendJson(res, 403, eroot, req.isKeepAlive());
		}
	}

	int saved_count = 0;
	bool ok = saveFiles(*mime, upload_dir, tmp_path.c_str(), files, saved_count, folder_path);

	::unlink(tmp_path.c_str());

	if (!ok) {
		acl::json err;
		acl::json_node& eroot = err.create_node();
		eroot.add_bool("ok", false);
		eroot.add_text("error", "save files failed");
		return sendJson(res, 500, eroot, req.isKeepAlive());
	}

	root.add_number("count", saved_count);
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool UploadAction::readBody(request_t& req, long long content_length,
	acl::ofstream& fp, acl::http_mime& mime)
{
	acl::istream& in = req.getInputStream();
	char buf[8192];
	long long read_total = 0;

	fprintf(stderr, "[MIME-DEBUG] readBody: content_length=%lld\n", content_length);

	while (read_total < content_length) {
		size_t want = sizeof(buf);
		long long remain = content_length - read_total;
		if ((long long) want > remain) {
			want = (size_t) remain;
		}

		int n = in.read(buf, want);
		if (n < 0) {
			fprintf(stderr, "read request body error: %s\n", acl::last_serror());
			return false;
		}
		if (n == 0) {
			fprintf(stderr, "read request body got 0 bytes before completion\n");
			return false;
		}

		if (fp.write(buf, n) == -1) {
			fprintf(stderr, "write tmp file error: %s\n", acl::last_serror());
			return false;
		}

		read_total += n;
		(void) mime.update(buf, (size_t) n);
	}

	if (read_total != content_length) {
		fprintf(stderr, "request body incomplete: read=%lld, expect=%lld\n",
			read_total, content_length);
		return false;
	}

	fprintf(stderr, "[MIME-DEBUG] readBody completed: total_read=%lld\n", read_total);
	return true;
}

bool UploadAction::saveFiles(acl::http_mime& mime, const std::string& upload_dir,
	const std::string& tmp_path, acl::json_node& files_array, int& saved_count,
	const std::string& folder_path)
{
	saved_count = 0;

	const std::list<acl::http_mime_node*>& nodes = mime.get_nodes();
	fprintf(stderr, "[MIME-DEBUG] saveFiles: mime nodes count=%zu\n", nodes.size());

	for (std::list<acl::http_mime_node*>::const_iterator it = nodes.begin();
		it != nodes.end(); ++it)
	{
		const acl::http_mime_node* node = *it;
		
		fprintf(stderr, "[MIME-NODE] type=%d, filename=%s\n",
			node->get_mime_type(),
			node->get_filename() ? node->get_filename() : "(null)");

		if (node->get_mime_type() != acl::HTTP_MIME_FILE) {
			continue;
		}

		const char* filename = node->get_filename();
		if (filename == NULL || *filename == '\0') {
			continue;
		}

		const char* basename = acl_safe_basename(filename);
		if (basename == NULL || *basename == '\0') {
			continue;
		}

		const std::string relative_path = folder_path.empty()
			? std::string(basename)
			: (folder_path + "/" + basename);
		const std::string dest = join_upload_path(upload_dir, relative_path);
		acl::json_node& item = files_array.add_child(false, true);

		long long body_begin = node->get_bodyBegin();
		long long body_end = node->get_bodyEnd();
		item.add_number("mime_begin", body_begin);
		item.add_number("mime_end", body_end);
		item.add_number("mime_size", body_end > body_begin ? body_end - body_begin : 0);

		fprintf(stderr, "[MIME-BODY] file=%s, begin=%lld, end=%lld, size=%lld\n",
			basename, body_begin, body_end,
			body_end > body_begin ? body_end - body_begin : 0);

		// Additional node state info
		fprintf(stderr, "[NODE-STATE] name=%s\n",
			node->get_name() ? node->get_name() : "(null)");

		if (body_begin < 0 || body_end <= body_begin) {
			fprintf(stderr, "[MIME-ERROR] MIME parsed empty body for %s: begin=%lld end=%lld\n",
				basename, body_begin, body_end);
			item.add_text("name", basename);
			item.add_number("size", 0);
			item.add_bool("saved", false);
			item.add_text("error", "mime parsed empty body");
			continue;
		}

		std::string save_err;
		long long fsize = -1;
		fprintf(stderr, "[MIME-SAVE] Extracting %s to %s...\n", basename, dest.c_str());
		if (copy_mime_body_to_file(tmp_path.c_str(), dest, body_begin, body_end,
			fsize, save_err))
		{
			fprintf(stderr, "[FILE-CHECK] %s size=%lld\n", dest.c_str(), fsize);

			if (fsize <= 0) {
				fprintf(stderr, "[SAVE-FAIL] Saved file is empty or invalid: %s (%lld bytes), body_begin=%lld body_end=%lld\n",
					dest.c_str(), fsize, (long long) body_begin, (long long) body_end);
				::unlink(dest.c_str());
				item.add_text("name", basename);
				item.add_number("size", fsize);
				item.add_bool("saved", false);
				item.add_text("error", "empty or invalid file");
				continue;
			}

			item.add_text("name", basename);
			item.add_text("path", relative_path.c_str());
			item.add_text("folder_path", folder_path.c_str());
			item.add_number("size", fsize);
			item.add_bool("saved", true);
			saved_count++;
			printf("Saved: %s (%lld bytes), body_begin=%lld body_end=%lld\n", dest.c_str(), fsize, (long long) body_begin, (long long) body_end);
		} else {
			fprintf(stderr, "[SAVE-ERROR] node->save() failed for %s: %s, body_begin=%lld body_end=%lld\n",
				basename, save_err.c_str(), (long long) body_begin, (long long) body_end);
			item.add_text("name", basename);
			item.add_bool("saved", false);
			item.add_text("error", save_err.c_str());
		}
	}
	fprintf(stderr, "[MIME-DEBUG] saveFiles completed: saved_count=%d\n", saved_count);
	return true;
}

} // namespace action
