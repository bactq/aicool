#include "actions.h"
#include "action_util.h"
#include <sys/stat.h>
#include <errno.h>
#include <signal.h>
#include <strings.h>
#include <stdio.h>
#include <stdlib.h>
#include <atomic>
#include <map>
#include <memory>
#include <mutex>
#include <vector>

#ifndef _WIN32
#include <unistd.h>
#endif

namespace action {

struct transcode_task_t {
	std::string id;
	std::string file_name;
	std::string output_name;
	std::string error;
	std::string message;
	double progress;
	long process_pid;
	bool done;
	bool success;
	bool cancel_requested;
	long long size;
	transcode_task_t()
	: progress(0), process_pid(-1), done(false), success(false)
	, cancel_requested(false), size(-1) {}
};

struct transcode_task_snapshot_t {
	std::string id;
	std::string file_name;
	std::string output_name;
	std::string error;
	std::string message;
	double progress;
	long process_pid;
	bool done;
	bool success;
	bool cancel_requested;
	long long size;
	transcode_task_snapshot_t()
	: progress(0), process_pid(-1), done(false), success(false)
	, cancel_requested(false), size(-1) {}
};

static std::mutex g_transcode_mutex;
static std::map<std::string, std::shared_ptr<transcode_task_t> > g_transcode_tasks;
static std::map<std::string, std::string> g_running_task_by_file;
static std::atomic<unsigned long> g_transcode_seq(1);

static bool is_video_name(const char* filename) {
	if (filename == NULL) {
		return false;
	}

	const char* dot = strrchr(filename, '.');
	if (dot == NULL || *(dot + 1) == '\0') {
		return false;
	}

	return strcasecmp(dot, ".mp4") == 0
		|| strcasecmp(dot, ".mkv") == 0
		|| strcasecmp(dot, ".avi") == 0
		|| strcasecmp(dot, ".rmvb") == 0
		|| strcasecmp(dot, ".mov") == 0
		|| strcasecmp(dot, ".wmv") == 0;
}

static long long file_size_of(const char* path) {
	if (path == NULL || *path == '\0') {
		return -1;
	}

	struct stat st;
	if (stat(path, &st) != 0) {
		return -1;
	}

	return (long long) st.st_size;
}

static std::string shell_quote(const std::string& s) {
	std::string out;
	out.reserve(s.size() + 8);
	out.push_back('\'');
	for (size_t i = 0; i < s.size(); ++i) {
		if (s[i] == '\'') {
			out += "'\\''";
		} else {
			out.push_back(s[i]);
		}
	}
	out.push_back('\'');
	return out;
}

static int run_command_capture(const std::string& command, std::string& output) {
	output.clear();
	FILE* fp = popen(command.c_str(), "r");
	if (fp == NULL) {
		return -1;
	}

	char buf[4096];
	while (fgets(buf, (int) sizeof(buf), fp) != NULL) {
		output.append(buf);
	}

	int code = pclose(fp);
	if (code == -1) {
		return -1;
	}

	return WEXITSTATUS(code);
}

static std::string trim_text(const std::string& s) {
	size_t b = 0;
	while (b < s.size() && (s[b] == ' ' || s[b] == '\t' || s[b] == '\r' || s[b] == '\n')) {
		++b;
	}
	size_t e = s.size();
	while (e > b && (s[e - 1] == ' ' || s[e - 1] == '\t' || s[e - 1] == '\r' || s[e - 1] == '\n')) {
		--e;
	}
	return s.substr(b, e - b);
}

static long long parse_duration_ms_from_text(const std::string& text) {
	const char* p = strstr(text.c_str(), "Duration: ");
	if (p == NULL) {
		return -1;
	}
	p += 10;
	int hh = 0, mm = 0;
	double ss = 0;
	if (sscanf(p, "%d:%d:%lf", &hh, &mm, &ss) != 3) {
		return -1;
	}
	return (long long) (((hh * 3600.0) + (mm * 60.0) + ss) * 1000.0);
}

static long long probe_duration_ms(const std::string& ffmpeg,
	const std::string& input_file)
{
	std::string cmd = shell_quote(ffmpeg) + " -hide_banner -i "
		+ shell_quote(input_file) + " 2>&1";
	std::string out;
	run_command_capture(cmd, out);
	return parse_duration_ms_from_text(out);
}

static long long parse_progress_ms_line(const std::string& line) {
	if (line.compare(0, 12, "out_time_us=") == 0) {
		long long us = atoll(line.c_str() + 12);
		return us / 1000;
	}
	if (line.compare(0, 12, "out_time_ms=") == 0) {
		long long value = atoll(line.c_str() + 12);
		if (value > 1000000) {
			return value / 1000;
		}
		return value;
	}
	if (line.compare(0, 9, "out_time=") == 0) {
		return parse_duration_ms_from_text(std::string("Duration: ") + std::string(line.c_str() + 9));
	}
	return -1;
}

static bool is_browser_friendly_h264_video_line(const char* line) {
	if (line == NULL) {
		return false;
	}

	const bool has_h264 = strstr(line, "video: h264") != NULL;
	if (!has_h264) {
		return false;
	}

	// Require 8-bit yuv420p only; avoid matching yuv420p10le by substring.
	const bool has_yuv420p_exact = strstr(line, "yuv420p,") != NULL
		|| strstr(line, "yuv420p(") != NULL
		|| strstr(line, "yuv420p ") != NULL;
	const bool has_10bit_or_high_profile = strstr(line, "yuv420p10") != NULL
		|| strstr(line, "high 10") != NULL
		|| strstr(line, "high 4:2:2") != NULL
		|| strstr(line, "high 4:4:4") != NULL;

	return has_yuv420p_exact && !has_10bit_or_high_profile;
}

static bool extract_primary_video_stream_line(const char* text,
	std::string& line)
{
	line.clear();
	if (text == NULL) {
		return false;
	}

	const char* p = text;
	while ((p = strstr(p, "stream #")) != NULL) {
		const char* eol = strchr(p, '\n');
		if (eol == NULL) {
			eol = p + strlen(p);
		}
		const char* video = strstr(p, "video:");
		if (video != NULL && video < eol) {
			line.assign(p, (size_t) (eol - p));
			return true;
		}
		if (*eol == '\0') {
			break;
		}
		p = eol + 1;
	}

	return false;
}

static bool browser_can_play_video_by_probe(const std::string& ffmpeg,
	const std::string& input_file, std::string& reason)
{
	reason.clear();
	std::string cmd = shell_quote(ffmpeg) + " -hide_banner -i "
		+ shell_quote(input_file) + " 2>&1";

	std::string out;
	run_command_capture(cmd, out);

	acl::string lower(out.c_str());
	lower.lower();
	const char* s = lower.c_str();
	std::string primary_video_line;

	const bool has_video = extract_primary_video_stream_line(s, primary_video_line);
	const bool has_avc1_tag = strstr(primary_video_line.c_str(), "(avc1") != NULL
		|| strstr(primary_video_line.c_str(), "avc1 /") != NULL;
	const bool has_aac = strstr(s, "audio: aac") != NULL;
	const bool has_no_audio = strstr(s, "audio:") == NULL;
	const bool decode_error = strstr(s, "invalid data found") != NULL
		|| strstr(s, "could not find codec parameters") != NULL
		|| strstr(s, "moov atom not found") != NULL;

	if (!has_video || decode_error) {
		reason = "video stream parse failed";
		return false;
	}

	if (!is_browser_friendly_h264_video_line(primary_video_line.c_str())) {
		reason = "video stream is not browser-friendly h264/yuv420p";
		return false;
	}

	if (!has_avc1_tag) {
		reason = "video stream is not tagged as avc1";
		return false;
	}

	if (!(has_no_audio || has_aac)) {
		reason = "audio codec is not aac";
		return false;
	}

	return true;
}

struct transcode_strategy_t {
	bool copy_video_stream;  // true: use -c:v copy, false: use -c:v libx264
	transcode_strategy_t() : copy_video_stream(false) {}
};

static bool probe_transcode_strategy(const std::string& ffmpeg,
	const std::string& input_file, transcode_strategy_t& strategy)
{
	(void) ffmpeg;
	(void) input_file;

	// For QuickTime/Safari compatibility, always re-encode video to H.264.
	strategy.copy_video_stream = false;
	return true;
}

static bool probe_has_subtitle_stream(const std::string& ffmpeg,
	const std::string& input_file)
{
	std::string cmd = shell_quote(ffmpeg) + " -hide_banner -i "
		+ shell_quote(input_file) + " 2>&1";
	std::string out;
	run_command_capture(cmd, out);
	acl::string lower(out.c_str());
	lower.lower();
	return strstr(lower.c_str(), "subtitle:") != NULL;
}

static std::string replace_ext(const std::string& name, const char* new_ext) {
	size_t slash = name.find_last_of("/\\");
	size_t dot = name.find_last_of('.');
	if (dot == std::string::npos || (slash != std::string::npos && dot < slash)) {
		return name + (new_ext ? new_ext : "");
	}
	return name.substr(0, dot) + (new_ext ? new_ext : "");
}

// Return 1 when exported, 0 when no subtitle stream, -1 when export failed.
static int export_vtt_sidecar(const std::string& ffmpeg,
	const std::string& input_file, const std::string& output_file,
	std::string& vtt_file, std::string& err)
{
	vtt_file = replace_ext(output_file, ".vtt");
	err.clear();

	if (!probe_has_subtitle_stream(ffmpeg, input_file)) {
		return 0;
	}

	::unlink(vtt_file.c_str());

	std::string cmd = shell_quote(ffmpeg)
		+ " -hide_banner -loglevel error -y -i " + shell_quote(input_file)
		+ " -map 0:s:0 -c:s webvtt " + shell_quote(vtt_file)
		+ " 2>&1";

	std::string out;
	int code = run_command_capture(cmd, out);
	if (code != 0) {
		err = trim_text(out);
		if (err.empty()) {
			err = "subtitle export failed";
		}
		::unlink(vtt_file.c_str());
		return -1;
	}

	if (file_size_of(vtt_file.c_str()) <= 0) {
		err = "subtitle export output is empty";
		::unlink(vtt_file.c_str());
		return -1;
	}

	return 1;
}

static std::string make_task_id() {
	char buf[64];
	snprintf(buf, sizeof(buf), "tx-%u-%lu", (unsigned) getpid(),
		(unsigned long) g_transcode_seq.fetch_add(1));
	return std::string(buf);
}

static void update_task_progress(const std::shared_ptr<transcode_task_t>& task,
	double percent, const char* msg)
{
	std::lock_guard<std::mutex> guard(g_transcode_mutex);
	if (percent < 0) {
		percent = 0;
	}
	if (percent > 0 && percent < 1) {
		percent = 1;
	}
	if (percent > 100) {
		percent = 100;
	}
	task->progress = percent;
	if (msg) {
		task->message = msg;
	}
}

static void set_task_process_pid(const std::shared_ptr<transcode_task_t>& task,
	long process_pid)
{
	std::lock_guard<std::mutex> guard(g_transcode_mutex);
	task->process_pid = process_pid;
}

static bool is_task_cancel_requested(const std::shared_ptr<transcode_task_t>& task) {
	std::lock_guard<std::mutex> guard(g_transcode_mutex);
	return task->cancel_requested;
}

static void finish_task(const std::shared_ptr<transcode_task_t>& task,
	bool success, const char* msg, const char* err, long long size)
{
	std::lock_guard<std::mutex> guard(g_transcode_mutex);
	task->done = true;
	task->success = success;
	task->progress = success ? 100.0 : task->progress;
	task->size = size;
	task->process_pid = -1;
	task->message = msg ? msg : "";
	task->error = err ? err : "";
	std::map<std::string, std::string>::iterator it =
		g_running_task_by_file.find(task->file_name);
	if (it != g_running_task_by_file.end() && it->second == task->id) {
		g_running_task_by_file.erase(it);
	}
}

static void run_transcode_task(const std::shared_ptr<transcode_task_t>& task,
	const std::string& ffmpeg, const std::string& input_file,
	const std::string& tmp_file, const std::string& output_file,
	const transcode_strategy_t& /* strategy */)
{
	if (is_task_cancel_requested(task)) {
		::unlink(tmp_file.c_str());
		finish_task(task, false, "已取消", "cancelled", -1);
		return;
	}

	long long duration_ms = probe_duration_ms(ffmpeg, input_file);
	ACL_ARGV* args = acl_argv_alloc(16);
	acl_argv_add(args,
		ffmpeg.c_str(),
		"-hide_banner",
		"-loglevel", "error",
		"-y",
		"-i", input_file.c_str(),
		"-map", "0:v:0",
		"-map", "0:a:0?",
		"-map", "0:s:0?",
		"-dn",
		"-c:v", "copy",
		"-movflags", "+faststart",
		"-tag:v", "avc1",
		"-c:a", "aac",
		"-ac", "2",
		"-b:a", "192k",
		"-c:s", "mov_text",
		"-progress", "pipe:1",
		"-nostats",
		tmp_file.c_str(),
		NULL);

	const char* strategy_msg = "音频转码中 (视频复制并保留字幕)";

	ACL_VSTREAM* stream = acl_vstream_popen(O_RDWR,
		ACL_VSTREAM_POPEN_ARGV, args->argv,
		ACL_VSTREAM_POPEN_END);
	acl_argv_free(args);

	if (stream == NULL) {
		::unlink(tmp_file.c_str());
		finish_task(task, false, "转码启动失败", acl::last_serror(), -1);
		return;
	}

	set_task_process_pid(task, (long) stream->pid);

	update_task_progress(task, 0.1, strategy_msg);
	char buf[4096];
	int ret;
	while ((ret = acl_vstream_gets_nonl(stream, buf, sizeof(buf) - 1)) != ACL_VSTREAM_EOF) {
		buf[ret] = '\0';
		std::string line(buf);

		long long current_ms = parse_progress_ms_line(line);
		if (current_ms >= 0 && duration_ms > 0) {
			double percent = (double) current_ms * 100.0 / (double) duration_ms;
			update_task_progress(task, percent, strategy_msg);
		} else if (line == "progress=end") {
			update_task_progress(task, 99.5, "写入输出文件");
		}

		if (is_task_cancel_requested(task) && stream->pid > 0) {
			kill((pid_t) stream->pid, SIGTERM);
		}
	}

	int code = acl_vstream_pclose(stream);
	if (is_task_cancel_requested(task)) {
		::unlink(tmp_file.c_str());
		finish_task(task, false, "已取消", "cancelled", -1);
		return;
	}
	if (code != 0) {
		::unlink(tmp_file.c_str());
		finish_task(task, false, "转码失败", "ffmpeg failed", -1);
		return;
	}

	if (::rename(tmp_file.c_str(), output_file.c_str()) != 0) {
		::unlink(tmp_file.c_str());
		finish_task(task, false, "转码失败", "rename transcoded file failed", -1);
		return;
	}

	// Keep source file untouched. Output is a separate transcoded file.

	long long out_size = file_size_of(output_file.c_str());
	if (out_size <= 0) {
		finish_task(task, false, "转码失败", "transcoded file is empty", -1);
		return;
	}

	std::string vtt_path;
	std::string subtitle_err;
	int subtitle_status = export_vtt_sidecar(ffmpeg, input_file, output_file,
		vtt_path, subtitle_err);

	if (subtitle_status > 0) {
		finish_task(task, true, "转码完成，已导出VTT外挂字幕", "", out_size);
	} else if (subtitle_status == 0) {
		finish_task(task, true, "转码完成（未检测到字幕流）", "", out_size);
	} else {
		finish_task(task, true, "转码完成（字幕导出失败）", "", out_size);
	}
}

static bool snapshot_task_by_id(const char* task_id,
	transcode_task_snapshot_t& snapshot)
{
	if (task_id == NULL || *task_id == '\0') {
		return false;
	}
	std::lock_guard<std::mutex> guard(g_transcode_mutex);
	std::map<std::string, std::shared_ptr<transcode_task_t> >::iterator it =
		g_transcode_tasks.find(task_id);
	if (it == g_transcode_tasks.end() || !it->second) {
		return false;
	}
	snapshot.id = it->second->id;
	snapshot.file_name = it->second->file_name;
	snapshot.output_name = it->second->output_name;
	snapshot.error = it->second->error;
	snapshot.message = it->second->message;
	snapshot.progress = it->second->progress;
	snapshot.process_pid = it->second->process_pid;
	snapshot.done = it->second->done;
	snapshot.success = it->second->success;
	snapshot.cancel_requested = it->second->cancel_requested;
	snapshot.size = it->second->size;
	return true;
}

static void snapshot_running_tasks(std::vector<transcode_task_snapshot_t>& out) {
	out.clear();
	std::lock_guard<std::mutex> guard(g_transcode_mutex);
	for (std::map<std::string, std::shared_ptr<transcode_task_t> >::iterator it =
		g_transcode_tasks.begin(); it != g_transcode_tasks.end(); ++it)
	{
		if (!it->second || it->second->done) {
			continue;
		}
		transcode_task_snapshot_t snapshot;
		snapshot.id = it->second->id;
		snapshot.file_name = it->second->file_name;
		snapshot.output_name = it->second->output_name;
		snapshot.error = it->second->error;
		snapshot.message = it->second->message;
		snapshot.progress = it->second->progress;
		snapshot.process_pid = it->second->process_pid;
		snapshot.done = it->second->done;
		snapshot.success = it->second->success;
		snapshot.cancel_requested = it->second->cancel_requested;
		snapshot.size = it->second->size;
		out.push_back(snapshot);
	}
}

static bool request_cancel_task(const char* task_id,
	transcode_task_snapshot_t& snapshot, bool& signal_sent)
{
	signal_sent = false;
	if (task_id == NULL || *task_id == '\0') {
		return false;
	}

	long pid = -1;
	{
		std::lock_guard<std::mutex> guard(g_transcode_mutex);
		std::map<std::string, std::shared_ptr<transcode_task_t> >::iterator it =
			g_transcode_tasks.find(task_id);
		if (it == g_transcode_tasks.end() || !it->second) {
			return false;
		}
		it->second->cancel_requested = true;
		it->second->message = "取消中";
		pid = it->second->process_pid;
		snapshot.id = it->second->id;
		snapshot.file_name = it->second->file_name;
		snapshot.output_name = it->second->output_name;
		snapshot.error = it->second->error;
		snapshot.message = it->second->message;
		snapshot.progress = it->second->progress;
		snapshot.process_pid = it->second->process_pid;
		snapshot.done = it->second->done;
		snapshot.success = it->second->success;
		snapshot.cancel_requested = it->second->cancel_requested;
		snapshot.size = it->second->size;
	}

#ifndef _WIN32
	if (!snapshot.done && pid > 0) {
		signal_sent = kill((pid_t) pid, SIGTERM) == 0;
	}
#endif
	return true;
}

static std::string replace_ext_with_mp4(const std::string& name) {
	size_t slash = name.find_last_of("/\\");
	size_t dot = name.find_last_of('.');
	if (dot == std::string::npos || (slash != std::string::npos && dot < slash)) {
		return name + ".mp4";
	}
	return name.substr(0, dot) + ".mp4";
}

static bool path_exists(const std::string& path) {
	return access(path.c_str(), F_OK) == 0;
}

static std::string make_unique_transcoded_name(const std::string& upload_dir,
	const std::string& input_name)
{
	std::string base_mp4 = replace_ext_with_mp4(input_name);
	size_t slash = base_mp4.find_last_of("/\\");
	size_t dot = base_mp4.find_last_of('.');
	if (dot == std::string::npos || (slash != std::string::npos && dot < slash)) {
		dot = base_mp4.size();
	}

	const std::string stem = base_mp4.substr(0, dot);
	const std::string ext = ".mp4";

	std::string candidate = stem + "_web" + ext;
	std::string full = upload_dir + "/" + candidate;
	if (!path_exists(full)) {
		return candidate;
	}

	for (int i = 2; i < 10000; ++i) {
		candidate = stem + "_web_" + std::to_string(i) + ext;
		full = upload_dir + "/" + candidate;
		if (!path_exists(full)) {
			return candidate;
		}
	}

	char buf[64];
	snprintf(buf, sizeof(buf), "_web_%lu", (unsigned long) g_transcode_seq.load());
	return stem + std::string(buf) + ext;
}

static void json_error(response_t& res, int status, const char* msg,
	bool keep_alive)
{
	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", false);
	root.add_text("error", msg);
	sendJson(res, status, root, keep_alive);
}

bool VideoConvertAction::run(request_t& req, response_t& res,
	const std::string& upload_dir)
{
	const char* file = req.getParameter("file");
	if (file == NULL || *file == '\0') {
		json_error(res, 400, "missing query parameter: file", req.isKeepAlive());
		return true;
	}

	std::string file_path;
	std::string path_err;
	if (!normalize_relative_path(file, file_path, path_err, false)) {
		json_error(res, 400, path_err.c_str(), req.isKeepAlive());
		return true;
	}

	const std::string basename = base_name_from_relative_path(file_path);
	if (!is_video_name(basename.c_str())) {
		json_error(res, 400, "file is not a supported video", req.isKeepAlive());
		return true;
	}

	const std::string in_path = join_upload_path(upload_dir, file_path);
	if (file_size_of(in_path.c_str()) <= 0) {
		json_error(res, 404, "source video not found", req.isKeepAlive());
		return true;
	}

	const std::string ffmpeg = choose_ffmpeg_path();
	if (ffmpeg.empty()) {
		json_error(res, 500, "ffmpeg not found in tools directory", req.isKeepAlive());
		return true;
	}

	std::string probe_reason;
	if (browser_can_play_video_by_probe(ffmpeg, in_path.c_str(), probe_reason)) {
		acl::json json;
		acl::json_node& root = json.create_node();
		root.add_bool("ok", true);
		root.add_bool("started", false);
		root.add_bool("completed", true);
		root.add_bool("playable", true);
		root.add_text("name", file_path.c_str());
		root.add_text("message", "video already playable");
		return sendJson(res, 200, root, req.isKeepAlive());
	}

	{
		std::lock_guard<std::mutex> guard(g_transcode_mutex);
		std::map<std::string, std::string>::iterator it =
			g_running_task_by_file.find(file_path);
		if (it != g_running_task_by_file.end()) {
			std::map<std::string, std::shared_ptr<transcode_task_t> >::iterator task_it =
				g_transcode_tasks.find(it->second);
			if (task_it != g_transcode_tasks.end() && !task_it->second->done) {
				acl::json json;
				acl::json_node& root = json.create_node();
				root.add_bool("ok", true);
				root.add_bool("started", false);
				root.add_bool("running", true);
				root.add_text("task_id", task_it->second->id.c_str());
				root.add_text("name", task_it->second->output_name.c_str());
				root.add_number("progress", task_it->second->progress);
				root.add_bool("cancel_requested", task_it->second->cancel_requested);
				root.add_text("message", task_it->second->message.c_str());
				return sendJson(res, 200, root, req.isKeepAlive());
			}
		}
	}

	std::string output_name = make_unique_transcoded_name(upload_dir, file_path);
	const std::string out_path = join_upload_path(upload_dir, output_name);

	acl::string tmp_path;
	tmp_path.format("%s/.transcoding_tmp.%u.%lu.mp4", upload_dir.c_str(),
		(unsigned) getpid(), (unsigned long) g_transcode_seq.load());

	std::shared_ptr<transcode_task_t> task(new transcode_task_t);
	task->id = make_task_id();
	task->file_name = file_path;
	task->output_name = output_name;
	task->message = "等待后台转码";

	{
		std::lock_guard<std::mutex> guard(g_transcode_mutex);
		g_transcode_tasks[task->id] = task;
		g_running_task_by_file[task->file_name] = task->id;
	}

	const std::string input_path(in_path);
	const std::string temp_path(tmp_path.c_str());
	const std::string output_path(out_path);

	// Probe transcode strategy before starting
	transcode_strategy_t strategy;
	probe_transcode_strategy(ffmpeg, input_path, strategy);

	// Run conversion in a dedicated fiber and execute heavy work in thread.
	go[task, ffmpeg, input_path, temp_path, output_path, strategy] {
		acl::gofiber_wait_thread([task, ffmpeg, input_path, temp_path, output_path, strategy] {
			run_transcode_task(task, ffmpeg, input_path, temp_path, output_path, strategy);
		});
	};

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_bool("started", true);
	root.add_bool("running", true);
	root.add_bool("playable", false);
	root.add_text("task_id", task->id.c_str());
	root.add_text("name", output_name.c_str());
	root.add_bool("cancel_requested", false);
	root.add_number("progress", 0);
	root.add_text("message", "transcode task started");
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool VideoConvertProgressAction::run(request_t& req, response_t& res,
	const std::string&)
{
	const char* task_id = req.getParameter("task_id");
	transcode_task_snapshot_t snapshot;
	if (!snapshot_task_by_id(task_id, snapshot)) {
		json_error(res, 404, "transcode task not found", req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("task_id", snapshot.id.c_str());
	root.add_text("file", snapshot.file_name.c_str());
	root.add_text("name", snapshot.output_name.c_str());
	root.add_bool("done", snapshot.done);
	root.add_bool("success", snapshot.success);
	root.add_bool("cancel_requested", snapshot.cancel_requested);
	root.add_number("progress", snapshot.progress);
	root.add_text("message", snapshot.message.c_str());
	if (!snapshot.error.empty()) {
		root.add_text("error", snapshot.error.c_str());
	}
	if (snapshot.size >= 0) {
		root.add_number("size", snapshot.size);
	}
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool VideoConvertTasksAction::run(request_t& req, response_t& res,
	const std::string&)
{
	std::vector<transcode_task_snapshot_t> tasks;
	snapshot_running_tasks(tasks);

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	acl::json_node& arr = json.create_array();
	root.add_child("tasks", arr);
	for (size_t i = 0; i < tasks.size(); ++i) {
		acl::json_node& node = arr.add_child(false, true);
		node.add_text("task_id", tasks[i].id.c_str());
		node.add_text("file", tasks[i].file_name.c_str());
		node.add_text("name", tasks[i].output_name.c_str());
		node.add_bool("done", tasks[i].done);
		node.add_bool("success", tasks[i].success);
		node.add_bool("cancel_requested", tasks[i].cancel_requested);
		node.add_number("progress", tasks[i].progress);
		node.add_text("message", tasks[i].message.c_str());
	}
	return sendJson(res, 200, root, req.isKeepAlive());
}

bool VideoConvertCancelAction::run(request_t& req, response_t& res,
	const std::string&)
{
	const char* task_id = req.getParameter("task_id");
	transcode_task_snapshot_t snapshot;
	bool signal_sent = false;
	if (!request_cancel_task(task_id, snapshot, signal_sent)) {
		json_error(res, 404, "transcode task not found", req.isKeepAlive());
		return true;
	}

	acl::json json;
	acl::json_node& root = json.create_node();
	root.add_bool("ok", true);
	root.add_text("task_id", snapshot.id.c_str());
	root.add_bool("done", snapshot.done);
	root.add_bool("cancel_requested", true);
	root.add_bool("signal_sent", signal_sent);
	root.add_text("message", snapshot.done ? "task already finished" : "cancel requested");
	return sendJson(res, 200, root, req.isKeepAlive());
}

} // namespace action
