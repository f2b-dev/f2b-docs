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
  baseUrl: "http://127.0.0.1:8787",
  // apiKey: process.env.F2B_API_KEY,
});

const sbx = await Sandbox.create(client, { template: "base" });
const { stdout } = await sbx.run("echo hello");
await sbx.write("/home/user/a.txt", "ok");
console.log(await sbx.read("/home/user/a.txt"));
await sbx.kill();
```

| 选项 | 说明 |
|------|------|
| `baseUrl` | 服务根，无尾斜杠 |
| `pathPrefix` | 默认 `/v1`；旧 BFF 可 `/api` |
| `apiKey` | Bearer 用户密钥 |
