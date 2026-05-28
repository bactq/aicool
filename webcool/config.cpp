#include "stdafx.h"
#include "config.h"
#include <fstream>

size_t                g_stack_size = 128000;
int                   g_rw_timeout = 5;
#ifdef _WIN32
acl::fiber_event_t    g_event_type = acl::FIBER_EVENT_T_POLL;
#else
acl::fiber_event_t    g_event_type = acl::FIBER_EVENT_T_KERNEL;
#endif

char                  g_upload_dir[4096] = "./uploads";
char                  g_html_home[4096] = "./html";
char                  g_sqlite_lib[4096] = "";
char                  g_ffmpeg_path[4096] = "";
std::atomic<bool>     g_service_stopping(false);

bool set_config_text(char* dst, size_t dst_size,
	  const std::string& value, const char* label, std::string& err) {
	if (dst == NULL || dst_size == 0) {
		err = "invalid config buffer";
		return false;
	}
	if (value.size() >= dst_size) {
		err = label ? label : "config value";
		err += " is too long";
		return false;
	}
#ifdef _WIN32
	std::wstring wide;
	if (!value.empty() && !webcool_utf8_to_wide(value.c_str(), wide)) {
		err = label ? label : "config value";
		err += " is not valid UTF-8";
		return false;
	}
#endif
	memcpy(dst, value.c_str(), value.size() + 1);
	return true;
}

std::string join_config_path(const std::string& parent, const char* name) {
	if (parent.empty()) {
		return name ? name : "";
	}
	const char tail = parent[parent.size() - 1];
	if (tail == '/' || tail == '\\') {
		return parent + name;
	}
#ifdef _WIN32
	return parent + "\\" + name;
#else
	return parent + "/" + name;
#endif
}

void apply_default_upload_dir(bool upload_dir_specified) {
#ifdef MACOSX
	if (!upload_dir_specified) {
		const char* home = getenv("HOME");
		if (home != NULL && *home != '\0') {
			snprintf(g_upload_dir, sizeof(g_upload_dir),
				"%s/Library/Application Support/webcool/data", home);
		} else {
			snprintf(g_upload_dir, sizeof(g_upload_dir), "%s", "./uploads");
		}
	}
#else
	(void)upload_dir_specified;
#endif
}

bool readable_regular_file(const std::string& path) {
	struct stat st;
	return stat(path.c_str(), &st) == 0 && S_ISREG(st.st_mode);
}

// ──────────────────────────────────────
// 持久化配置文件 (webcool.conf)
// 格式: key=value, 每行一条, # 开头为注释
// ──────────────────────────────────────

static std::string get_config_file_path() {
	// 配置文件放在可执行文件同目录下
	char buf[4096] = "";
	ssize_t len = readlink("/proc/self/exe", buf, sizeof(buf) - 1);
	if (len > 0) {
		buf[len] = '\0';
		std::string exe_path(buf);
		size_t pos = exe_path.rfind('/');
		if (pos != std::string::npos) {
			return exe_path.substr(0, pos + 1) + "webcool.conf";
		}
	}
	return "./webcool.conf";
}

std::string load_persisted_upload_dir() {
	const std::string conf_path = get_config_file_path();
	std::ifstream ifs(conf_path.c_str());
	if (!ifs.is_open()) {
		return "";
	}
	std::string line;
	while (std::getline(ifs, line)) {
		// trim
		size_t start = line.find_first_not_of(" 	\r\n");
		if (start == std::string::npos) continue;
		size_t end = line.find_last_not_of(" 	\r\n");
		line = line.substr(start, end - start + 1);
		if (line.empty() || line[0] == '#') continue;
		const std::string prefix = "upload_dir=";
		if (line.compare(0, prefix.size(), prefix) == 0) {
			std::string value = line.substr(prefix.size());
			// trim value
			start = value.find_first_not_of(" 	");
			if (start != std::string::npos) {
				end = value.find_last_not_of(" 	\r\n");
				value = value.substr(start, end - start + 1);
			}
			return value;
		}
	}
	return "";
}

bool persist_upload_dir(const std::string& upload_dir) {
	const std::string conf_path = get_config_file_path();

	// 读取现有配置，保留非 upload_dir 的行
	std::vector<std::string> other_lines;
	std::ifstream ifs(conf_path.c_str());
	if (ifs.is_open()) {
		std::string line;
		while (std::getline(ifs, line)) {
			size_t start = line.find_first_not_of(" 	\r\n");
			if (start != std::string::npos) {
				std::string trimmed = line.substr(start);
				if (trimmed.compare(0, 10, "upload_dir") == 0) {
					continue;  // 跳过旧的 upload_dir 行
				}
			}
			other_lines.push_back(line);
		}
		ifs.close();
	}

	// 写入新配置
	std::ofstream ofs(conf_path.c_str(), std::ios::trunc);
	if (!ofs.is_open()) {
		return false;
	}
	ofs << "# webcool configuration" << std::endl;
	ofs << "upload_dir=" << upload_dir << std::endl;
	for (size_t i = 0; i < other_lines.size(); ++i) {
		ofs << other_lines[i] << std::endl;
	}
	ofs.close();
	return true;
}

std::string normalize_static_home_path(const std::string& path) {
	if (readable_regular_file(join_config_path(path, "main.html"))) {
		return path;
	}
	const std::string child = join_config_path(path, "html");
	if (readable_regular_file(join_config_path(child, "main.html"))) {
		return child;
	}
	return path;
}

