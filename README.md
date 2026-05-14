# aicool

`aicool` 是一个基于 ACL 库的 C++ Web 服务示例。

## 第三方依赖

本项目通过 Git Submodule 引入 ACL：

- 路径：`third-party/acl`
- 仓库：`https://github.com/acl-dev/acl.git`

## 获取代码（新克隆）

推荐在首次克隆时一并拉取 submodule：

```bash
git clone --recurse-submodules <repo-url>
cd aicool
git submodule status
```

## 已有仓库执行 PULL 后同步 submodule

如果你已经在本地克隆过主仓库，在执行 `git pull` 后请同步并初始化 submodule：

```bash
git pull
git submodule sync --recursive
git submodule update --init --recursive
git submodule status
```

## 构建

在 `src` 目录执行：

```bash
cd src
make
```

`make` 会先构建 `third-party/acl` 所需库，再链接生成 `aicool`。
