# 本地快速开始

目标：在本机 **60 秒内** 跑通 create → `echo` → kill（fake 数据面）。

## 端口约定（全仓统一）

| 服务 | 端口 | 绑定建议 | 说明 |
|------|------|----------|------|
| 控制台 / BFF（f2b-web） | **13200** | `0.0.0.0` 或本机 | 官网 + `/console` + `/api/*` |
| 沙箱控制面（f2b-sandbox） | **13287** | 生产/测试机建议 **`127.0.0.1`** | 公开 HTTP `/v1` + `/healthz` |
| 预览隧道（f2b-tunnel，可选） | **8790** | 按需 | `/v1/tunnels` + `/t/{id}/` |

> **不要**再写默认 3000 当控制台端口。沙箱内业务进程可用 guest 的 3000，那是**沙箱内部**端口，与控制面无关。

## 前置

- Node.js ≥ 20（all-in-one / 香港机要求 **≥ 22**，因 `node:sqlite`）
- pnpm 9
- （可选）Python ≥ 3.10
- 同级克隆组织仓库：

```bash
mkdir -p ~/workspace/revocloud && cd ~/workspace/revocloud
for r in f2b-spec f2b-sandbox f2b-web f2b-sdk-js f2b-sdk-python f2b-infra f2b-docs f2b-tunnel; do
  git clone https://github.com/f2b-dev/$r.git
done
```

## 方式 A：host 脚本（推荐本地）

```bash
cd f2b-infra
./scripts/dev-host.sh   # 起 sandbox :13287 + web :13200
./scripts/smoke.sh      # INFRA_SMOKE_OK
```

打开：

- 官网 / 控制台：http://127.0.0.1:13200  
- 沙箱健康：http://127.0.0.1:13287/healthz  

控制台路径：列表 → 创建沙箱 → 终端运行命令 → 销毁。

## 方式 B：只起沙箱 + SDK

```bash
cd f2b-spec && pnpm install
cd ../f2b-sandbox && pnpm install
F2B_SANDBOX_BACKEND=fake pnpm dev
# 默认监听 13287；可用 HOST / PORT 覆盖
```

### TypeScript

```bash
cd ../f2b-sdk-js && pnpm install && pnpm smoke
# → SDK_SMOKE_OK
```

### Python

```bash
cd ../f2b-sdk-python
python3 scripts/smoke.py
# → PY_SDK_SMOKE_OK
```

### curl

```bash
curl -s -X POST http://127.0.0.1:13287/v1/sandboxes \
  -H 'content-type: application/json' \
  -d '{"name":"demo","template":"base"}'
```

## 方式 C：Docker Compose

见 [本地 Compose](/architecture/compose) 与 [f2b-infra](https://github.com/f2b-dev/f2b-infra) 的 `docker-compose.yml`。

映射仍是 **web 13200 / sandbox 13287**。

## 方式 D：单机 all-in-one（Linux 测试机 / 生产雏形）

在 **Linux** 上以 root 运行 [install-all-in-one.sh](https://github.com/f2b-dev/f2b-infra/blob/main/scripts/install-all-in-one.sh)：

```bash
# 在目标机上（已装 Node ≥22、git、curl）
cd /path/to/f2b-infra
sudo bash ./scripts/install-all-in-one.sh
# 成功末尾打印 INSTALL_OK
```

常用环境变量：

| 变量 | 含义 |
|------|------|
| `F2B_ROOT` | 代码目录，默认 `/opt/f2b` |
| `F2B_BRANCH` | 拉取分支，默认 `main` |
| `F2B_SANDBOX_BACKEND` | 默认 `fake` |
| `F2B_SANDBOX_HOST` | 建议 `127.0.0.1`（不把 13287 暴露公网） |
| `F2B_MAX_CONCURRENT_SANDBOXES` | 并发硬顶 |
| `F2B_AUTH_MODE` / `F2B_ADMIN_TOKEN` | 鉴权（新建 env 时写入） |

systemd 起 **f2b-sandbox** + **f2b-web**（及可选 tunnel）。验收：

```bash
curl -sS http://127.0.0.1:13287/healthz
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:13200/
```

香港测试机约定：控制台公网 **:13200**，sandbox **仅本机 :13287**。运维细节见 f2b-infra 文档（容量 / 超时）。

## 鉴权（可选）

默认 `F2B_AUTH_MODE=off` 便于本地与 BFF。公网 SDK 路径可开：

```bash
F2B_AUTH_MODE=api_key F2B_ADMIN_TOKEN=dev-admin F2B_SANDBOX_BACKEND=fake pnpm dev
```

密钥明文仅在创建时返回一次；存储为 hash。详见 [鉴权模型](/architecture/auth)。

## 下一步

- 实战片段：[Cookbook](/guide/cookbook)（保活 / 命令选项 / base64）
- 契约：[沙箱 API](/api/sandbox) · [OpenAPI](/api/openapi)
- MCP：[MCP 网关](/guide/mcp)
