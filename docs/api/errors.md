# 错误码

权威源（须三方一致）：

| 源 | 路径 |
|----|------|
| JSON 表 | [f2b-spec `errors/codes.json`](https://github.com/f2b-dev/f2b-spec/blob/main/errors/codes.json) |
| TypeScript | `@f2b/spec` → `ErrorCode` / `F2bError` / `statusForCode` |
| Python SDK | `f2b.ErrorCode` / `f2b.F2bError` |
| OpenAPI | `components.schemas.ApiError`（`sandbox-v1.yaml`） |

**不要使用**已废弃或从未落地的别名：`VALIDATION`、`CONFLICT`、`CAPACITY_FULL`。  
正确写法：`VALIDATION_ERROR`、`SANDBOX_*` / `TUNNEL_*` 具体码、`CAPACITY_EXCEEDED`。

---

## 响应形状

```json
{
  "error": {
    "code": "SANDBOX_NOT_FOUND",
    "message": "sandbox not found: sbx_xxx",
    "details": {}
  }
}
```

- HTTP 状态由 `code` 决定（见下表）；SDK 抛出 `F2bError` 时带 `code` / `status` / `details`。
- SSE 命令流失败时事件为 `{ "type": "error", "code", "message" }`（非上述 envelope）。

---

## 完整 code 表

| code | HTTP | 何时出现（产品 API） |
|------|------|----------------------|
| `VALIDATION_ERROR` | 400 | 创建/更新/命令/文件 body 或 query 未过 schema |
| `INVALID_PATH` | 400 | 路径非法、穿越、拒绝操作 root |
| `UNAUTHORIZED` | 401 | 缺/错 API Key 或 Admin Token |
| `NOT_FOUND` | 404 | 通用资源不存在（如文件） |
| `SANDBOX_NOT_FOUND` | 404 | 沙箱 id 不存在 |
| `TUNNEL_NOT_FOUND` | 404 | 隧道 id 不存在 |
| `SANDBOX_NOT_RUNNING` | 409 | 非 running（如 paused）上执行命令/文件等 |
| `SANDBOX_ALREADY_TERMINAL` | 409 | killed/failed/succeeded 上 PATCH/pause 等 |
| `TUNNEL_ALREADY_CLOSED` | 409 | 隧道已关闭再操作 |
| `COMMAND_TIMEOUT` | 408 | 预留：控制面级命令超时错误（见下「命令超时」） |
| `COMMAND_FAILED` | 422 | 后端将命令失败映射为错误时（多数路径仍返回 exitCode 结果） |
| `CAPACITY_EXCEEDED` | 429 | 活动沙箱数 ≥ `F2B_MAX_CONCURRENT_SANDBOXES` |
| `BACKEND_UNAVAILABLE` | 503 | 数据面/上游不可达；BFF 连不上 sandbox |
| `INTERNAL` | 500 | 未分类服务端错误 |

**活动槽**（占并发）：`provisioning` / `running` / `paused`。

### 命令超时说明

- 产品默认：命令级 `timeoutMs` 到期时，**fake** 返回命令结果 `exitCode=124`、stderr 含 `timeout after …`，**不是** HTTP `COMMAND_TIMEOUT`。
- `COMMAND_TIMEOUT` 保留在契约中，供将来控制面硬超时或特定后端使用；客户端应同时处理 **结果码 124** 与 **`F2bError(COMMAND_TIMEOUT)`**。

---

## 关键路径示例

基址默认 `http://127.0.0.1:13287`（经 BFF 时为同源 `/api/...`，错误 envelope 相同）。

### 1. `VALIDATION_ERROR`（400）

```bash
# name 等均可选；用非法 timeoutMs 触发校验
curl -sS -X POST http://127.0.0.1:13287/v1/sandboxes \
  -H 'content-type: application/json' \
  -d '{"name":"x","timeoutMs":-1}'
# 期望：400
# {"error":{"code":"VALIDATION_ERROR","message":"invalid create payload","details":{...}}}
```

```ts
import { F2bClient, ErrorCode, F2bError } from "@f2b/sdk";
try {
  await client.createSandbox({} as never);
} catch (e) {
  if (e instanceof F2bError && e.code === ErrorCode.VALIDATION_ERROR) {
    // 检查 e.details（zod flatten）
  }
}
```

```python
from f2b import F2bClient, ErrorCode, F2bError
try:
    client.create_sandbox({})  # type: ignore
except F2bError as e:
    assert e.code == ErrorCode.VALIDATION_ERROR
```

### 2. `SANDBOX_NOT_RUNNING`（409）

沙箱 `paused` 或非 running 时跑命令：

```bash
# 假设 $ID 已 pause
curl -sS -X POST "http://127.0.0.1:13287/v1/sandboxes/$ID/commands" \
  -H 'content-type: application/json' \
  -d '{"cmd":"echo hi"}'
# 期望：409
# {"error":{"code":"SANDBOX_NOT_RUNNING","message":"..."}}
```

```python
except F2bError as e:
    if e.code == ErrorCode.SANDBOX_NOT_RUNNING:
        client.resume_sandbox(sid)
```

### 3. `CAPACITY_EXCEEDED`（429）

需服务配置 `F2B_MAX_CONCURRENT_SANDBOXES>0`。占满活动槽后再 `POST /v1/sandboxes`：

```bash
curl -sS http://127.0.0.1:13287/healthz | jq .capacity
# 占满后：
curl -sS -X POST http://127.0.0.1:13287/v1/sandboxes \
  -H 'content-type: application/json' \
  -d '{"name":"over","template":"base"}'
# 期望：429
# {"error":{"code":"CAPACITY_EXCEEDED","message":"concurrent sandbox limit reached (N/M)",
#   "details":{"active":N,"max":M}}}
```

运维：销毁空闲实例或调高硬顶（须匹配主机规格，见 [ops-capacity-timeout](https://github.com/f2b-dev/f2b-infra/blob/main/docs/ops-capacity-timeout.md)）。

### 4. `SANDBOX_NOT_FOUND`（404）

```bash
curl -sS http://127.0.0.1:13287/v1/sandboxes/sbx_does_not_exist
# 期望：404 · code SANDBOX_NOT_FOUND
```

---

## SDK 映射约定

| 层 | 行为 |
|----|------|
| f2b-sandbox | `throw new F2bError(ErrorCode.*, …)` → `jsonError` → `{ error: { code, message, details? } }` + HTTP |
| BFF | 透传上游 body/status；上游不可达时 `BACKEND_UNAVAILABLE` 503 |
| JS `@f2b/sdk` | `!res.ok` → `new F2bError(code, message, { status, details })`；网络失败 → `BACKEND_UNAVAILABLE` |
| Python `f2b` | 同上；`HTTPError` / 4xx body 解析 `error.code` |

客户端判断请用 **字符串相等** 对比 `ErrorCode.*`，不要依赖 message 文案。
