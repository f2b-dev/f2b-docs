# 隧道预览与生产域名

> 组件：`f2b-tunnel`（默认 `:8790`）。控制台经 BFF `/api/tunnels*` 操作；浏览器打开的是隧道返回的 **`publicUrl`**。

## 1. 角色

| 角色 | 说明 |
|------|------|
| **登记** | `POST /v1/tunnels`：`sandboxId` + `port`（+ 可选 `targetUrl` / `ttlSec`）→ `TunnelRecord` |
| **预览代理** | `GET/… /t/{id}/…` → 转发到登记时的 `targetUrl` |
| **BFF** | web 服务端 `F2B_TUNNEL_URL` → 上游 tunnel；浏览器不持隧道管理密钥 |

V1 **dev 语义**：客户端（或控制台）显式传 `targetUrl`（常见 `http://127.0.0.1:{port}` 或沙箱内可达地址）。**不**在 tunnel 内解析真 microVM 网络拓扑。

## 2. 关键环境变量

| 变量 | 落在 | 说明 |
|------|------|------|
| `PORT` / `HOST` | tunnel | 默认 `8790` / `0.0.0.0` |
| **`F2B_TUNNEL_PUBLIC_BASE`** | tunnel | 写入 `publicUrl` 的**对外基址**（无尾 `/`） |
| `F2B_TUNNEL_URL` | **仅 web BFF** | 服务端访问 tunnel API，如 `http://127.0.0.1:8790` 或 compose 服务名 |
| `F2B_TUNNEL_PATH_PREFIX` | SDK / MCP | 默认 `/v1`；经 BFF 时用 `/api` |

未设 `F2B_TUNNEL_PUBLIC_BASE` 时，`publicUrl` 形如 `http://127.0.0.1:8790/t/{id}/`，**只适合本机**。

## 3. 部署形态

### A. 本机 / CI / all-in-one 默认

```text
浏览器 → :13200 BFF → tunnel:8790（API）
浏览器 → :8790/t/{id}/（预览，常仅本机或内网）
```

- `F2B_TUNNEL_PUBLIC_BASE=http://127.0.0.1:8790`（或省略）
- 香港试验床：tunnel **不强制公网**；控制台公网只保证 `:13200`

### B. 单域名反代（推荐小规模生产）

```text
https://console.example.com          → f2b-web :13200
https://preview.example.com/t/{id}/  → f2b-tunnel :8790  的 /t/
https://preview.example.com/v1/…     → 可选：仅内网，不对公网暴露管理 API
```

tunnel 进程 env：

```bash
F2B_TUNNEL_PUBLIC_BASE=https://preview.example.com
HOST=127.0.0.1   # 仅本机，由反代进入
PORT=8790
```

web：

```bash
F2B_TUNNEL_URL=http://127.0.0.1:8790
```

反代注意：

1. **WebSocket / 长连接**（若预览页需要）打开 Upgrade。  
2. 预览路径保留前缀 `/t/` 或与 `publicUrl` 生成规则一致。  
3. **不要**把 Cube / sandbox 管理口挂到 preview 域名。  
4. TLS 证书覆盖 preview 主机名。

### C. 子域通配（后置增强）

未来可改为 `{id}.preview.example.com`；**当前 V1 固定路径** `/t/{id}/`。通配 DNS + 动态 vhost **未实现**，勿在对外文案承诺。

### D. 与 MCP / SDK

| 客户端 | 调隧道 API | 打开预览 |
|--------|------------|----------|
| 控制台 | 同源 `/api/tunnels` | 用户点击 `publicUrl` |
| SDK | `baseUrl` + path 默认 `/v1` 或 `pathPrefix` | 使用返回的 `publicUrl` |
| MCP | `F2B_TUNNEL_URL` + tools | 把 `publicUrl` 交给用户/Agent |

生产：**API 走内网或 BFF**；**publicUrl 必须是浏览器可达的 HTTPS 基址**（即正确的 `F2B_TUNNEL_PUBLIC_BASE`）。

## 4. 安全

| 做 | 不做 |
|----|------|
| preview 域名与 console 分离（推荐） | 公网暴露未鉴权的 tunnel **管理** API（若未来加 auth） |
| `targetUrl` 限制为受信网段（后置 harden） | 允许任意 SSRF 到云 metadata（实现 harden 前运维侧防火墙） |
| TTL / DELETE 回收 | 永久公开无过期隧道当默认 |

V1 内存表进程重启即丢隧道登记；**不**作持久化 SLA。

## 5. 验收

```bash
# 本机
curl -sS http://127.0.0.1:8790/healthz
# 创建后 publicUrl 前缀应等于 F2B_TUNNEL_PUBLIC_BASE
curl -sS -X POST http://127.0.0.1:8790/v1/tunnels \
  -H 'content-type: application/json' \
  -d '{"sandboxId":"sbx_x","port":3000,"targetUrl":"http://127.0.0.1:3000"}'

# 契约
cd f2b-tunnel && pnpm ci:contract   # TUNNEL_CONTRACT_OK
```

## 6. 相关

- 实现仓：[f2b-tunnel](https://github.com/f2b-dev/f2b-tunnel)  
- BFF 表：[bff](./bff)  
- OpenAPI：`f2b-spec/openapi/tunnel-v1.yaml`  
- all-in-one 端口：f2b-infra `docs/all-in-one.md`（8790）
