.PHONY: all acl app clean rebuild

ACL_DIR := third-party/acl
SRC_DIR := webcool

all: app

acl:
	$(MAKE) -C $(ACL_DIR) all_lib

app: acl
	$(MAKE) -C $(SRC_DIR) BUILD_ACL=0

clean:
	$(MAKE) -C $(SRC_DIR) clean
	$(MAKE) -C $(ACL_DIR) clean

rebuild: clean all
