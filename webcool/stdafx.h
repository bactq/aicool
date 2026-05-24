#pragma once

#include "lib_acl.h"
#include "acl_cpp/lib_acl.hpp"
#include "fiber/lib_fiber.hpp"
#include "fiber/go_fiber.hpp"

#ifdef WIN32
# define snprintf _snprintf
#endif

typedef acl::HttpServletRequest  request_t;
typedef acl::HttpServletResponse response_t;

#define DEBUG_MIN       200
#define DEBUG_FILE      (DEBUG_MIN + 1)
#define DEBUG_FOLDER    (DEBUG_MIN + 1)
#define DEBUG_CONN      (DEBUG_MIN + 1)
#define DEBUG_PAGE      (DEBUG_MIN + 1)