#pragma once

extern size_t                g_stack_size;
extern int                   g_rw_timeout;
extern acl::fiber_event_t    g_event_type;
extern char                  g_upload_dir[4096];
extern char                  g_html_home[4096];
extern char                  g_sqlite_lib[4096];
extern char                  g_ffmpeg_path[4096];
extern std::atomic<bool>     g_service_stopping;

bool set_config_text(char* dst, size_t dst_size,
	const std::string& value, const char* label, std::string& err);
std::string join_config_path(const std::string& parent, const char* name);
void apply_default_upload_dir(bool upload_dir_specified);
bool readable_regular_file(const std::string& path);
std::string load_persisted_upload_dir();
bool persist_upload_dir(const std::string& upload_dir);
std::string normalize_static_home_path(const std::string& path);

