# aicool(爱酷)

[English](#english) | [中文](#chinese)

---

## English

aicool is a C++ web service example based on the ACL library.

### Third-Party Dependency

This project imports ACL via Git submodule:

- Path: third-party/acl
- Repository: https://github.com/acl-dev/acl.git

### Get The Code (Fresh Clone)

For first-time clone, fetch submodules together:

```bash
git clone --recurse-submodules <repo-url>
cd aicool
git submodule status
```

### Sync Submodule After PULL (Existing Local Repo)

If you have already cloned the main repository locally, run these commands after git pull to sync and initialize submodules:

```bash
git pull
git submodule sync --recursive
git submodule update --init --recursive
git submodule status
```

### Build

Run from the repository root:

```bash
make
```

The root Makefile will first build the required libraries under third-party/acl, then build aicool from src.

### webcool Packaging Notes

For webcool binary packages (`webcool/package`):

- The installer bundles ffmpeg into `/opt/webcool/bin/ffmpeg`.
- During install, if `/usr/local/bin/ffmpeg` does not exist, it will be copied from `/opt/webcool/bin/ffmpeg`.
- You can override runtime ffmpeg path with:

```bash
webcool -F /custom/path/ffmpeg -s 0.0.0.0:8080 -d ./uploads
```

[Back to top](#aicool)

---

## Chinese

aicool 是一个基于 ACL 库的 C++ Web 服务示例。

### 第三方依赖

本项目通过 Git submodule 引入 ACL：

- 路径：third-party/acl
- 仓库：https://github.com/acl-dev/acl.git

### 获取代码（新克隆）

推荐在首次克隆时一并拉取 submodule：

```bash
git clone --recurse-submodules https://github.com/chat-client/aicool 
cd aicool
git submodule status
```
或直接
```bash
git clonet https://github.com/chat-client/aicool
cd aicool
git submodule update --init --recursive
```

### 已有仓库执行 PULL 后同步 submodule

如果你已经在本地克隆过主仓库，在执行 git pull 后请同步并初始化 submodule：

```bash
git pull
git submodule sync --recursive
git submodule update --init --recursive
git submodule status
```

### 构建

在仓库根目录执行：

```bash
make
```

根目录 Makefile 会先构建 third-party/acl 所需库，再从 src 目录编译生成 aicool。

### webcool 打包说明（补充）

针对 webcool 二进制安装包（`webcool/package`）：

- 安装包会内置 ffmpeg 到 `/opt/webcool/bin/ffmpeg`。
- 安装时若 `/usr/local/bin/ffmpeg` 不存在，会从 `/opt/webcool/bin/ffmpeg` 复制过去。
- 运行时可通过下面参数手动覆盖 ffmpeg 路径：

```bash
webcool -F /custom/path/ffmpeg -s 0.0.0.0:8080 -d ./uploads
```

[回到顶部](#aicool)
