# webcool 二进制安装包构建说明

本目录提供三类安装包输出目录：

- `mac/`：macOS `.pkg` 文件
- `deb/`：Ubuntu/Debian `.deb` 文件
- `rpm/`：CentOS/RHEL `.rpm` 文件

## 打包脚本

- `build-mac.sh`：构建 macOS 安装包
- `build-deb.sh`：构建 deb 安装包
- `build-rpm.sh`：构建 rpm 安装包
- `build-all.sh`：统一入口

## 使用示例

在 `webcool/package` 目录执行：

```bash
./build-mac.sh --version 1.0.0
./build-deb.sh --version 1.0.0 --release 1
./build-rpm.sh --version 1.0.0 --release 1
```

统一入口：

```bash
./build-all.sh --target mac --version 1.0.0
./build-all.sh --target deb --version 1.0.0 --release 1
./build-all.sh --target rpm --version 1.0.0 --release 1
```

## 依赖要求

- macOS：`pkgbuild`
- Ubuntu/Debian：`dpkg-deb`
- CentOS/RHEL：`rpmbuild`

脚本会把完整运行内容放到 `/opt/webcool`，并仅安装一个启动入口到 `/usr/local/bin/webcool`。

其中：

- 主程序位于 `/opt/webcool/webcool`
- sqlite 动态库位于 `/opt/webcool/lib/sqlite3.so`
- ffmpeg 位于 `/opt/webcool/bin/ffmpeg`
- `/usr/local/bin/webcool` 只是启动入口，用于设置运行环境后再启动 `/opt/webcool/webcool`

安装阶段不再向 `/usr/local/lib` 或 `/usr/local/bin` 复制 `sqlite3.so` 与 ffmpeg。运行时由启动器优先设置：

- `AICOOL_SQLITE_LIB=/opt/webcool/lib/sqlite3.so`
- `AICOOL_FFMPEG=/opt/webcool/bin/ffmpeg`

这样部署结果保持为单一自包含目录，便于升级、卸载和排查。

## 默认版本号来源

`common.sh` 中的 `DEFAULT_VERSION` 会优先通过执行 `../webcool -v` 自动读取当前二进制版本号；若读取失败，则回退到 `1.0.0`。

运行 webcool 时也可手动指定 sqlite 动态库路径：

```bash
webcool -S /custom/path/sqlite3.so -s 0.0.0.0:8080 -d ./uploads
```

运行 webcool 时也可手动指定 ffmpeg 路径（覆盖自动探测）：

```bash
webcool -F /custom/path/ffmpeg -s 0.0.0.0:8080 -d ./uploads
```

macOS 在未显式传 `-d` 时，webcool 会自动使用当前用户数据目录：

- `~/Library/Application Support/webcool/data`

该目录会在程序启动时自动创建。
