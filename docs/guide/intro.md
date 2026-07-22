# 产品介绍

**灵境云（F2B-Navo）** 提供自研 **AI 沙箱云服务**：为每个 Agent 准备独立、用完即焚的 Linux 执行环境——跑代码、敲命令、读写文件、受控上网。

| 能力 | 说明 |
|------|------|
| 生命周期 | 创建 / 列表 / 详情 / 销毁（Pause/Resume（fake 全量；Cube 视集群）） |
| 命令 | Shell 执行，返回 stdout / stderr / exitCode |
| 文件 | 读、写、列目录 |
| 模板 | base、code-interpreter 等预置 |
| 网络 | `allowInternetAccess` 开关（默认隔离） |
| 开发者入口 | REST `/v1`、控制台、TS / Python SDK |

## 谁用什么

| 角色 | 入口 |
|------|------|
| 终端用户 / 运营 | [f2b-web](https://github.com/f2b-dev/f2b-web) 官网与控制台 |
| 服务端 / Agent 运行时 | [f2b-sdk-js](https://github.com/f2b-dev/f2b-sdk-js) / [f2b-sdk-python](https://github.com/f2b-dev/f2b-sdk-python) 直连沙箱 API |
| 实现者 | [f2b-sandbox](https://github.com/f2b-dev/f2b-sandbox) 微服务 + [f2b-spec](https://github.com/f2b-dev/f2b-spec) 契约 |

## 硬约束（读代码前先看）

1. **浏览器永不持有数据面管理密钥**，只走用户会话 / 用户 API Key → BFF 或公开 API。
2. 无生产集群时用 **fake** 后端，控制台状态需诚实（例如 `fake · BFF → sandbox`）。
3. **1.0 前** 官方包不强制走 npm / PyPI registry，可用 `file:` / git / editable 安装。

下一篇：[本地快速开始](./quickstart) · [Cookbook](./cookbook)。
