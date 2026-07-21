# 本地快速开始

目标：在本机 **60 秒内** 跑通 create → `echo` → kill（fake 数据面）。

## 前置

- Node.js ≥ 20、pnpm 9
- （可选）Python ≥ 3.10
- 同级克隆组织仓库：

```bash
mkdir -p ~/workspace/revocloud && cd ~/workspace/revocloud
for r in f2b-spec f2b-sandbox f2b-web f2b-sdk-js f2b-sdk-python f2b-infra f2b-docs; do
  git clone https://github.com/f2b-dev/$r.git
done
```

## 方式 A：host 脚本（推荐）

```bash
cd f2b-infra
./scripts/dev-host.sh   # 起 sandbox :13287 + web :13200
./scripts/smoke.sh      # INFRA_SMOKE_OK
```

打开：

- 官网 / 控制台：http://127.0.0.1:13200  
- 沙箱 API：http://127.0.0.1:13287/healthz  

控制台路径：列表 → 创建沙箱 → 终端运行命令 → 销毁。

## 方式 B：只起沙箱 + SDK

```bash
cd f2b-spec && pnpm install
cd ../f2b-sandbox && pnpm install
F2B_SANDBOX_BACKEND=fake pnpm dev
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

见 [f2b-infra](https://github.com/f2b-dev/f2b-infra) 的 `docker-compose.yml`（sandbox + web）。

## 鉴权（可选）

默认 `F2B_AUTH_MODE=off` 便于本地与 BFF。公网 SDK 路径可开：

```bash
F2B_AUTH_MODE=api_key F2B_ADMIN_TOKEN=dev-admin F2B_SANDBOX_BACKEND=fake pnpm dev
```

密钥明文仅在创建时返回一次；存储为 hash。详见 [鉴权模型](/architecture/auth)。
