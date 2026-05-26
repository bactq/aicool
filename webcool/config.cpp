#include "stdafx.h"
#include "config.h"

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

