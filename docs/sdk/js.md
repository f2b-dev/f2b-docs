# TypeScript SDK

仓库：[f2b-sdk-js](https://github.com/f2b-dev/f2b-sdk-js)

```bash
pnpm add @f2b/sdk@file:../f2b-sdk-js
# 或仓内
cd f2b-sdk-js && pnpm install && pnpm smoke
```

```ts
import { F2bClient, Sandbox } from "@f2b/sdk";

const client = new F2bClient({
  baseUrl: "http://127.0.0.1:13287",
  // apiKey: process.env.F2B_API_KEY,
});

const sbx = await Sandbox.create(client, { template: "base" });
const { stdout } = await sbx.run("echo hello");
const streamed = await sbx.runStream("echo stream", {
  onEvent: (ev) => console.log(ev.type),
});
await sbx.write("/home/user/a.txt", "ok");
console.log(await sbx.read("/home/user/a.txt"));
await sbx.pause();
await sbx.resume();
await sbx.kill();
```

| 选项 | 说明 |
|------|------|
| `baseUrl` | 服务根，无尾斜杠 |
| `pathPrefix` | 默认 `/v1`；旧 BFF 可 `/api` |
| `tunnelBaseUrl` / `tunnelPathPrefix` | 隧道服务；BFF 用 `/api` |
| `apiKey` | Bearer 用户密钥 |

**导出**：`Sandbox.run` / `runStream`（SSE）/ `write` / `read` / `listFiles` / `deleteFile` / `mkdir` / `rename` / `pause` / `resume` / `update`（PATCH timeout/metadata）；`updateSandbox` / `getUsage` / `listTemplates` / 隧道 CRUD。
