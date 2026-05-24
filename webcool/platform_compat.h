#pragma once

#ifdef _WIN32

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#ifndef NOMINMAX
#define NOMINMAX
#endif

#include <windows.h>
#include <shellapi.h>

#include <direct.h>
#include <errno.h>
#include <fcntl.h>
#include <io.h>
#include <process.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

#include <string>

#ifndef PATH_MAX
#define PATH_MAX MAX_PATH
#endif

#ifndef F_OK
#define F_OK 0
#endif
#ifndef R_OK
#define R_OK 4
#endif
#ifndef W_OK
#define W_OK 2
#endif
#ifndef X_OK
#define X_OK 4
#endif

#ifndef S_ISDIR
#define S_ISDIR(m) (((m) & _S_IFDIR) == _S_IFDIR)
#endif
#ifndef S_ISREG
#define S_ISREG(m) (((m) & _S_IFREG) == _S_IFREG)
#endif
#ifndef S_ISLNK
#define S_ISLNK(m) 0
#endif

typedef int mode_t;
typedef int pid_t;
typedef int uid_t;
typedef intptr_t ssize_t;

#define strcasecmp _stricmp
#define strncasecmp _strnicmp
#define access _access
#define chmod _chmod
#define close _close
#define dup2 _dup2
#define getpid _getpid
#define lstat _stat
#define mkdir(path, mode) _mkdir(path)
#define open _open
#define pclose _pclose
#define popen _popen
#define rmdir _rmdir
#define stat _stat
#define unlink _unlink

#ifndef SIGTERM
#define SIGTERM 15
#endif
#ifndef WIFEXITED
#define WIFEXITED(status) (1)
#endif
#ifndef WEXITSTATUS
#define WEXITSTATUS(status) (status)
#endif

inline int kill(pid_t pid, int)
{
	HANDLE process = OpenProcess(PROCESS_TERMINATE, FALSE, (DWORD) pid);
	if (process == NULL) {
		errno = ESRCH;
		return -1;
	}
	const BOOL ok = TerminateProcess(process, 1);
	CloseHandle(process);
	if (!ok) {
		errno = EPERM;
		return -1;
	}
	return 0;
}

inline int setenv(const char* name, const char* value, int overwrite)
{
	if (!overwrite && getenv(name) != NULL) {
		return 0;
	}
	return _putenv_s(name, value ? value : "");
}

inline uid_t getuid()
{
	return 0;
}

inline char* webcool_realpath(const char* path, char* resolved)
{
	if (path == NULL || resolved == NULL) {
		errno = EINVAL;
		return NULL;
	}
	if (_fullpath(resolved, path, PATH_MAX) == NULL) {
		return NULL;
	}
	return resolved;
}
#define realpath webcool_realpath

inline int readlink(const char*, char*, size_t)
{
	errno = ENOSYS;
	return -1;
}

inline int symlink(const char*, const char*)
{
	errno = ENOSYS;
	return -1;
}

struct dirent {
	char d_name[MAX_PATH];
};

struct DIR {
	intptr_t handle;
	struct _finddata_t data;
	struct dirent entry;
	bool first;
};

inline std::string webcool_dir_pattern(const char* path)
{
	std::string pattern = path && *path ? path : ".";
	const char tail = pattern.empty() ? '\0' : pattern[pattern.size() - 1];
	if (tail != '/' && tail != '\\') {
		pattern += "\\";
	}
	pattern += "*";
	return pattern;
}

inline DIR* opendir(const char* path)
{
	DIR* dir = new DIR;
	dir->first = true;
	const std::string pattern = webcool_dir_pattern(path);
	dir->handle = _findfirst(pattern.c_str(), &dir->data);
	if (dir->handle == -1) {
		delete dir;
		return NULL;
	}
	return dir;
}

inline struct dirent* readdir(DIR* dir)
{
	if (dir == NULL) {
		errno = EBADF;
		return NULL;
	}
	if (!dir->first) {
		if (_findnext(dir->handle, &dir->data) != 0) {
			return NULL;
		}
	} else {
		dir->first = false;
	}
	strncpy(dir->entry.d_name, dir->data.name, sizeof(dir->entry.d_name) - 1);
	dir->entry.d_name[sizeof(dir->entry.d_name) - 1] = '\0';
	return &dir->entry;
}

inline int closedir(DIR* dir)
{
	if (dir == NULL) {
		errno = EBADF;
		return -1;
	}
	const int rc = _findclose(dir->handle);
	delete dir;
	return rc;
}

static char* webcool_optarg = NULL;
static int webcool_optind = 1;

inline int webcool_getopt(int argc, char* const argv[], const char* optstring)
{
	static const char* next = NULL;
	if (next == NULL || *next == '\0') {
		if (webcool_optind >= argc || argv[webcool_optind][0] != '-'
			|| argv[webcool_optind][1] == '\0') {
			return -1;
		}
		if (strcmp(argv[webcool_optind], "--") == 0) {
			++webcool_optind;
			return -1;
		}
		next = argv[webcool_optind] + 1;
	}
	const char ch = *next++;
	const char* pos = strchr(optstring, ch);
	if (pos == NULL) {
		if (*next == '\0') {
			++webcool_optind;
		}
		return '?';
	}
	if (pos[1] == ':') {
		if (*next != '\0') {
			webcool_optarg = const_cast<char*>(next);
			++webcool_optind;
			next = NULL;
		} else if (webcool_optind + 1 < argc) {
			webcool_optarg = argv[++webcool_optind];
			++webcool_optind;
			next = NULL;
		} else {
			return '?';
		}
	} else {
		webcool_optarg = NULL;
		if (*next == '\0') {
			++webcool_optind;
		}
	}
	return ch;
}

#define getopt webcool_getopt
#define optarg webcool_optarg
#define optind webcool_optind

inline bool webcool_shell_open(const std::string& target, std::string& err)
{
	HINSTANCE rc = ShellExecuteA(NULL, "open", target.c_str(), NULL, NULL, SW_SHOWNORMAL);
	if ((INT_PTR) rc <= 32) {
		err = "ShellExecute failed";
		return false;
	}
	return true;
}

inline bool webcool_shell_open_trash(std::string& err)
{
	return webcool_shell_open("shell:RecycleBinFolder", err);
}

#endif // _WIN32
