# MCP 网关

[f2b-mcp-gateway](https://github.com/f2b-dev/f2b-mcp-gateway) 将灵境云沙箱能力暴露为 [MCP](https://modelcontextprotocol.io) tools，供 Claude Desktop、Cursor 等客户端调用。

## 架构

```text
MCP Client (stdio)
    → f2b-mcp-gateway
        → @f2b/sdk
            → f2b-sandbox /v1
            → f2b-tunnel /v1（可选，预览隧道）
```

- 传输：**stdio**（V1）
- 密钥：仅进程 env `F2B_API_KEY` / `F2B_SANDBOX_URL` / `F2B_TUNNEL_URL`；不向 MCP 客户端回显
- 不持有 Cube 管理密钥；与 BFF 一样只走产品 HTTP

## 工具

| Tool | 说明 |
|------|------|
| `sandbox_create` | 创建沙箱（可选 `metadata` / `timeoutMs`） |
| `sandbox_list` / `sandbox_get` | 列表（`status` 过滤）/ 详情 |
| `sandbox_update` | 延期 `timeoutMs` / 浅合并 `metadata` |
| `sandbox_run` | 执行命令（可选 `cwd` / `env` / `timeoutMs`） |
| `sandbox_write_file` / `sandbox_read_file` / `sandbox_list_files` / `sandbox_delete_file` / `sandbox_mkdir` / `sandbox_rename` | 文件（读写可选 `encoding=base64`） |
| `sandbox_pause` / `sandbox_resume` | 暂停 / 恢复 |
| `sandbox_templates` / `sandbox_usage` | 模板 / 用量 |
| `sandbox_kill` | 销毁 |
| `tunnel_list` | 列出预览隧道（可选 `sandboxId`） |
| `tunnel_create` | 创建隧道（`sandboxId` + `port`；dev 可 `targetUrl`） |
| `tunnel_get` | 隧道详情 |
| `tunnel_close` | 关闭隧道 |

## 本地

```bash
# 先起 f2b-sandbox :13287；隧道可选 :8790
cd f2b-mcp-gateway
pnpm install
pnpm smoke   # → MCP_SMOKE_OK（有 tunnel 时额外 tunnel ok）
```

| 变量 | 默认 | 说明 |
|------|------|------|
| `F2B_SANDBOX_URL` | `http://127.0.0.1:13287` | 沙箱 |
| `F2B_TUNNEL_URL` | 同 sandbox 或 `http://127.0.0.1:8790`（smoke） | 隧道 |
| `F2B_TUNNEL_PATH_PREFIX` | `/v1` | 隧道 API 前缀；BFF 用 `/api` |
| `F2B_API_KEY` | （空） | 鉴权开启时需要 |

Claude Desktop 配置见网关 README。
