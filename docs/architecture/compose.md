# 本地 Compose 拓扑

编排仓：[f2b-infra](https://github.com/f2b-dev/f2b-infra)。**无业务逻辑**，只拼服务与 env。

## 目录布局

构建上下文为**父目录**，需与 `f2b-infra` **同级**克隆：

```text
workspace/
  f2b-infra/     ← docker compose 在此执行
  f2b-spec/
  f2b-sandbox/
  f2b-web/
```

首次建议：

```bash
cd f2b-infra
cp parent.dockerignore ../.dockerignore
cp .env.example .env   # 可选
docker compose up --build
```

## 默认服务

```text
┌─────────────┐     F2B_SANDBOX_URL      ┌──────────────────┐
│  web :3000  │ ───────────────────────► │  sandbox :8787   │
│  (BFF+UI)   │   http://sandbox:8787    │  Fake / adapter  │
└─────────────┘                          └────────┬─────────┘
                                                  │ volume
                                           sandbox-data (SQLite)
```

| 服务 | 端口 | 关键配置 |
|------|------|----------|
| `sandbox` | 8787 | `F2B_SANDBOX_BACKEND=fake`，`F2B_AUTH_MODE=off`，健康检查 `/healthz` |
| `web` | 3000 | `F2B_SANDBOX_URL=http://sandbox:8787`，依赖 sandbox healthy |

## 宿主机双进程（不构建镜像）

```bash
./scripts/dev-host.sh
```

要求 Node ≥ 22（`node:sqlite`）与 pnpm。

## 不在默认 compose 内

| 组件 | 原因 | 本地跑法 |
|------|------|----------|
| f2b-mcp-gateway | stdio MCP，非 HTTP 常驻 | 宿主机 `pnpm` + `F2B_SANDBOX_URL` |
| f2b-tunnel | V1 可选；后续可用 compose profile | 独立 `pnpm dev` |
| 真 microVM（单节点） | 需 Linux+KVM 的主机 | 配置 sandbox 的 `F2B_CUBE_*`（仅服务端）；进程/端口见 [f2b-infra all-in-one](https://github.com/f2b-dev/f2b-infra/blob/main/docs/all-in-one.md)；容量见 [单机容量](./capacity) |

## 冒烟

```bash
./scripts/smoke.sh   # compose up 之后
```

控制台：`http://localhost:3000`  
沙箱：`http://localhost:8787/healthz`  
