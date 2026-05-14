.PHONY: all acl sqlite sqlite-download app clean rebuild

ACL_DIR := third-party/acl
SQLITE_DIR := third-party/sqlite
SRC_DIR := webcool

all: app

acl:
	$(MAKE) -C $(ACL_DIR) all_lib

sqlite:
	$(MAKE) -C $(SQLITE_DIR) build

sqlite-download:
	$(MAKE) -C $(SQLITE_DIR) download

app: acl sqlite
	$(MAKE) -C $(SRC_DIR) BUILD_ACL=0

clean:
	$(MAKE) -C $(SRC_DIR) clean
	$(MAKE) -C $(ACL_DIR) clean
	$(MAKE) -C $(SQLITE_DIR) clean

rebuild: clean all
