.PHONY: all acl sqlite sqlite-download tools app clean rebuild

ACL_DIR := third-party/acl
SQLITE_DIR := third-party/sqlite
SRC_DIR := webcool
TOOLS_DIR := tools

all: app

tools:
	@set -e; \
	for platform in linux mac; do \
		archive="$(TOOLS_DIR)/$$platform/ffmpeg.tgz"; \
		ffmpeg="$(TOOLS_DIR)/$$platform/ffmpeg"; \
		ffprobe="$(TOOLS_DIR)/$$platform/ffprobe"; \
		if [ ! -f "$$ffmpeg" ] || [ ! -f "$$ffprobe" ]; then \
			if [ -f "$$archive" ]; then \
				echo "Extracting $$archive ..."; \
				tar -xzf "$$archive" -C "$(TOOLS_DIR)/$$platform"; \
			else \
				echo "Missing $$ffmpeg and $$archive"; \
				exit 1; \
			fi; \
		fi; \
	done

acl:
	$(MAKE) -C $(ACL_DIR) all_lib

sqlite:
	$(MAKE) -C $(SQLITE_DIR) build

sqlite-download:
	$(MAKE) -C $(SQLITE_DIR) download

app: tools acl sqlite
	$(MAKE) -C $(SRC_DIR) BUILD_ACL=0

clean:
	$(MAKE) -C $(SRC_DIR) clean
	$(MAKE) -C $(ACL_DIR) clean
	$(MAKE) -C $(SQLITE_DIR) clean

rebuild: clean all
