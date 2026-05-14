# aicool

`aicool` 是一个基于 ACL 库的 C++ Web 服务示例。

`aicool` is a C++ web service example based on the ACL library.

## 第三方依赖

## Third-Party Dependency

本项目通过 Git Submodule 引入 ACL：

This project imports ACL via Git submodule:

- 路径：`third-party/acl`
- 仓库：`https://github.com/acl-dev/acl.git`
- Path: `third-party/acl`
- Repository: `https://github.com/acl-dev/acl.git`

## 获取代码（新克隆）

## Get The Code (Fresh Clone)

推荐在首次克隆时一并拉取 submodule：

For first-time clone, fetch submodules together:

```bash
git clone --recurse-submodules <repo-url>
cd aicool
git submodule status
```

## 已有仓库执行 PULL 后同步 submodule

## Sync Submodule After PULL (Existing Local Repo)

如果你已经在本地克隆过主仓库，在执行 `git pull` 后请同步并初始化 submodule：

If you have already cloned the main repository locally, run these commands after `git pull` to sync and initialize submodules:

```bash
git pull
git submodule sync --recursive
git submodule update --init --recursive
git submodule status
```

## 构建

## Build

在 `src` 目录执行：

Run in the `src` directory:

```bash
cd src
make
```

`make` 会先构建 `third-party/acl` 所需库，再链接生成 `aicool`。

`make` will first build the required libraries under `third-party/acl`, then link and generate `aicool`.
