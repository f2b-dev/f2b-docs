# Cookbook

短示例，默认假数据面 `http://127.0.0.1:13287`、路径前缀 `/v1`。完整契约见 [沙箱 API](/api/sandbox)。

## 1. 滑动空闲保活（keepalive）

空闲窗口由沙箱级 **`timeoutMs`** 控制：到期点 = `lastActiveAt` + `timeoutMs`。  
命令与文件成功操作会刷新 `lastActiveAt`；也可 `PATCH` 主动延期。

### HTTP

```bash
# 创建：5 分钟空闲窗口
curl -sS -X POST http://127.0.0.1:13287/v1/sandboxes \
  -H 'content-type: application/json' \
  -d '{"name":"keep","template":"base","timeoutMs":300000}'

# 活动会刷新 lastActiveAt（run / 写文件等）
curl -sS -X POST "http://127.0.0.1:13287/v1/sandboxes/$ID/commands" \
  -H 'content-type: application/json' \
  -d '{"cmd":"echo still-here"}'

# 从现在起再给 10 分钟（同时刷新 lastActiveAt）
curl -sS -X PATCH "http://127.0.0.1:13287/v1/sandboxes/$ID" \
  -H 'content-type: application/json' \
  -d '{"timeoutMs":600000}'

# 取消空闲超时
curl -sS -X PATCH "http://127.0.0.1:13287/v1/sandboxes/$ID" \
  -H 'content-type: application/json' \
  -d '{"timeoutMs":null}'
```

进程内 reaper 默认约 **2s** 扫一次（`F2B_TIMEOUT_REAPER_MS`）。到期自动 kill，`error` 含 `timeout exceeded`。

### TypeScript

```ts
import { F2bClient, Sandbox } from "@f2b/sdk";

const client = new F2bClient({ baseUrl: "http://127.0.0.1:13287" });
const sbx = await Sandbox.create(client, {
  template: "base",
  timeoutMs: 5 * 60_000,
});

await sbx.run("echo work"); // 刷新 lastActiveAt
await sbx.update({ timeoutMs: 10 * 60_000 }); // 主动延期
// await sbx.update({ timeoutMs: null });   // 取消超时
await sbx.kill();
```

### Python

```python
from f2b import F2bClient

client = F2bClient(base_url="http://127.0.0.1:13287")
sbx = client.create_sandbox(template="base", timeoutMs=300_000)
sbx.run("echo work")
sbx.update(timeoutMs=600_000)
sbx.kill()
```

控制台详情页展示「最近活动」与空闲剩余；Agent 长任务应周期性 `run` 或 `update`，勿假设无限存活。

---

## 2. 命令选项：cwd / env / timeoutMs

`POST .../commands` 与 `.../commands/stream` 支持命令级选项（与沙箱空闲 `timeoutMs` **独立**）。

| 字段 | 说明 |
|------|------|
| `cmd` | 必填 shell 命令 |
| `cwd` | 工作目录（须存在） |
| `env` | 额外环境变量（string→string） |
| `timeoutMs` | 命令级超时，1 ms–30 min；fake 超时约 `exitCode=124` |

### HTTP

```bash
curl -sS -X POST "http://127.0.0.1:13287/v1/sandboxes/$ID/commands" \
  -H 'content-type: application/json' \
  -d '{
    "cmd": "pwd && echo $MY_TAG",
    "cwd": "/tmp",
    "env": { "MY_TAG": "lingjing" },
    "timeoutMs": 15000
  }'
```

流式（SSE）：

```bash
curl -sS -N -X POST "http://127.0.0.1:13287/v1/sandboxes/$ID/commands/stream" \
  -H 'content-type: application/json' \
  -d '{"cmd":"echo line1; echo line2","timeoutMs":10000}'
```

### TypeScript

```ts
const r = await sbx.run("pwd && echo $MY_TAG", {
  cwd: "/tmp",
  env: { MY_TAG: "lingjing" },
  timeoutMs: 15_000,
});
console.log(r.stdout, r.exitCode);

await sbx.runStream("for i in 1 2 3; do echo $i; done", {
  timeoutMs: 10_000,
  onEvent: (ev) => {
    if (ev.type === "stdout") process.stdout.write(ev.data);
  },
});
```

### Python

```python
r = sbx.run(
    "pwd && echo $MY_TAG",
    cwd="/tmp",
    env={"MY_TAG": "lingjing"},
    timeout_ms=15_000,
)
print(r["stdout"], r["exitCode"])
```

> **stdin**：1.0 前产品 API / SDK / MCP **不暴露**交互式 stdin。

---

## 3. 二进制文件 base64

读写默认 **utf8**；二进制用 **base64**（或 SDK 的 bytes / `Uint8Array` 封装）。

### HTTP

```bash
# 写：hello 的 base64
curl -sS -X POST "http://127.0.0.1:13287/v1/sandboxes/$ID/files" \
  -H 'content-type: application/json' \
  -d '{"path":"/home/user/a.bin","content":"aGVsbG8=","encoding":"base64"}'

# 读回 base64
curl -sS "http://127.0.0.1:13287/v1/sandboxes/$ID/files?path=/home/user/a.bin&encoding=base64"
```

### TypeScript

```ts
await sbx.write("/home/user/a.bin", new Uint8Array([1, 2, 3, 255]));
const bytes = await sbx.readBytes("/home/user/a.bin");
// 或显式：
// await sbx.write("/home/user/b.bin", Buffer.from("hi").toString("base64"), { encoding: "base64" });
```

### Python

```python
sbx.write("/home/user/a.bin", b"\x01\x02\x03\xff")
data = sbx.read_bytes("/home/user/a.bin")
# 或 encoding="base64" 读写 str
```

控制台文件页支持二进制上传/下载（走 base64 或 blob）。大文件注意请求体大小与超时。

---

## 相关

- [本地快速开始](/guide/quickstart)
- [错误码示例](/api/errors)（`VALIDATION_ERROR` / `SANDBOX_NOT_RUNNING` / `CAPACITY_EXCEEDED`）
- [OpenAPI 契约](/api/openapi)
