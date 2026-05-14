CC      = g++

CFLAGS  = -c -g -W -Wall -Wcast-qual -Wcast-align \
          -Wno-long-long -Wpointer-arith -Werror -Wshadow -O2 \
          -D_REENTRANT -D_POSIX_PTHREAD_SEMANTICS -D_USE_FAST_MACRO

PROG    = webcool
.DEFAULT_GOAL := all

###########################################################
# 系统类型检测
SYSLIB    = -ldl -lpthread -lz
UNIXNAME  = $(shell uname -sm)
OSTYPE    = $(shell uname -p)
RPATH     = linux64

ifeq ($(findstring g++, $(CC)), g++)
	GCC_VERSION := $(shell gcc --version | grep ^gcc | cut -d' ' -f3)
	GCC_MAJOR   := $(shell echo "$(GCC_VERSION)" | cut -d'.' -f1)
	GCC_MINOR   := $(shell echo "$(GCC_VERSION)" | cut -d'.' -f2)
	GCC_VER     := $(shell [ $(GCC_MAJOR) -gt 4 -o \( $(GCC_MAJOR) -eq 4 -a $(GCC_MINOR) -ge 7 \) ] && echo true)
	ifeq ($(GCC_VER), true)
		CFLAGS += -std=c++11 -DACL_USE_CPP11
	endif
endif

OS_ENV := $(shell uname -a)
ifeq ($(findstring WSL, $(OS_ENV)), WSL)
	SYSLIB += -liconv
endif
ifeq ($(findstring ubuntu, $(OS_ENV)), ubuntu)
	SYSLIB += -liconv
endif
ifeq ($(findstring Alpine, $(shell uname -a)), Alpine)
	SYSLIB += -lucontext
endif

# Darwin (macOS)
ifeq ($(findstring Darwin, $(UNIXNAME)), Darwin)
	CFLAGS  += -DMACOSX -Wno-invalid-source-encoding -Wno-invalid-offsetof
	SYSLIB  += -liconv -rdynamic
	RPATH    = macos
endif

# Linux
ifeq ($(findstring Linux, $(UNIXNAME)), Linux)
	CFLAGS  += -D_REENTRANT
	SYSLIB  += -lcrypt -lrt
	ifeq ($(findstring i686, $(OSTYPE)), i686)
		RPATH = linux32
	endif
	ifeq ($(findstring x86_64, $(OSTYPE)), x86_64)
		RPATH = linux64
	endif
	has_io_uring=$(HAS_IO_URING)
	ifeq ($(has_io_uring), yes)
		SYSLIB += -luring-ffi
	endif
endif

# FreeBSD
ifeq ($(findstring FreeBSD, $(UNIXNAME)), FreeBSD)
	CFLAGS  += -DFREEBSD -D_REENTRANT
	SYSLIB   = -lcrypt -lpthread -lz
	RPATH    = freebsd
endif

###########################################################
# ACL 根目录（相对本 Makefile 的位置）
ACL_PATH ?= ../third-party/acl
ACL_BUILD_TARGET ?= all_lib
#BUILD_ACL ?= 1

CFLAGS += \
	-I$(ACL_PATH)/lib_acl/include \
	-I$(ACL_PATH)/lib_acl_cpp/include \
	-I$(ACL_PATH)/lib_protocol/include \
	-I$(ACL_PATH)/lib_fiber/c/include \
	-I$(ACL_PATH)/lib_fiber/cpp/include

LDFLAGS = \
	-L$(ACL_PATH)/lib_fiber/lib   -lfiber_cpp \
	-Wl,-rpath,$(ACL_PATH)/lib_fiber/lib \
	-L$(ACL_PATH)/lib_acl_cpp/lib -lacl_cpp \
	-Wl,-rpath,$(ACL_PATH)/lib_acl_cpp/lib \
	-L$(ACL_PATH)/lib_protocol/lib -lprotocol \
	-Wl,-rpath,$(ACL_PATH)/lib_protocol/lib \
	-L$(ACL_PATH)/lib_acl/lib     -lacl \
	-Wl,-rpath,$(ACL_PATH)/lib_acl/lib \
	-lfiber \
	$(SYSLIB)

###########################################################
SRC = $(wildcard *.cpp) $(wildcard template/*.cpp) $(wildcard action/*.cpp)
OBJ = $(patsubst %.cpp, %.o, $(SRC))

acl_libs:
	$(MAKE) -C $(ACL_PATH) $(ACL_BUILD_TARGET)

ifeq ($(BUILD_ACL),1)
PROG_DEPS = acl_libs $(OBJ)
else
PROG_DEPS = $(OBJ)
endif

$(PROG): $(PROG_DEPS)
	$(CC) $(OBJ) $(LDFLAGS) -o $@
	@echo ""
	@echo "构建成功：$(PROG)"
	@echo ""

%.o: %.cpp
	$(CC) $(CFLAGS) $< -o $@

.PHONY: all clean rebuild

all: $(PROG)

clean cl:
	rm -f $(PROG) $(OBJ)

rebuild rb: clean all
