CC ?= cc
CFLAGS ?= -O2 -fPIC

SQLITE_VERSION_NUM ?= 3460100
SQLITE_YEAR ?= 2024

ROOT := $(CURDIR)
SRC_DIR := $(ROOT)/src
LIB_DIR := $(ROOT)/lib
PKG := $(ROOT)/sqlite-autoconf.tar.gz

# Detect OS and set shared library flag
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    SHARED_FLAG = -dynamiclib
else
    SHARED_FLAG = -shared
endif

# Use .so extension for consistency (on macOS it will still work)
SQLITE_SO := $(LIB_DIR)/sqlite3.so

.PHONY: all download build clean

all: build

download:
	@mkdir -p "$(SRC_DIR)" "$(LIB_DIR)"
	curl -L -o "$(PKG)" "https://www.sqlite.org/$(SQLITE_YEAR)/sqlite-autoconf-$(SQLITE_VERSION_NUM).tar.gz"
	rm -rf "$(SRC_DIR)"/*
	tar -xzf "$(PKG)" --strip-components=1 -C "$(SRC_DIR)"

build: $(SQLITE_SO)

$(SQLITE_SO): $(SRC_DIR)/sqlite3.c
	@mkdir -p "$(LIB_DIR)"
	$(CC) $(CFLAGS) -DSQLITE_THREADSAFE=1 -DSQLITE_ENABLE_COLUMN_METADATA \
	      -c "$(SRC_DIR)/sqlite3.c" -o "$(SRC_DIR)/sqlite3.o"
	$(CC) $(SHARED_FLAG) -o "$@" "$(SRC_DIR)/sqlite3.o"
	@echo "built: $@"

clean:
	rm -f "$(SRC_DIR)/sqlite3.o" "$(SQLITE_SO)"
