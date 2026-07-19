# 鉴权模型

## 模式开关（f2b-sandbox）

| `F2B_AUTH_MODE` | 行为 |
|-----------------|------|
| `off`（默认） | `/v1/sandboxes*` 不校验密钥；适合本机与内网 BFF |
| `api_key` | 业务 API 需用户密钥；管理 API 需 admin token |

## 用户 API Key

- 格式：`sk_live_…`  
- 传递：`Authorization: Bearer <secret>` 或 `X-API-Key`  
- 存储：**仅 SHA-256 hash**；创建响应中的 `secret` **只出现一次**  
- 管理接口：`/v1/api-keys`（需 `X-F2B-Admin-Token` / `F2B_ADMIN_TOKEN`）

## BFF

- 浏览器 → `f2b-web` `/api/sandboxes`、`/api/keys`  
- BFF 使用 `F2B_SANDBOX_URL` 转发；密钥管理可另配 `F2B_SANDBOX_ADMIN_TOKEN`（仅服务端）  
- 前端代码与静态资源中 **不得** 硬编码 admin / 数据面 token  

## SDK

```ts
new F2bClient({ baseUrl: "https://api.example", apiKey: process.env.F2B_API_KEY })
```

```python
F2bClient(base_url="https://api.example", api_key=os.environ["F2B_API_KEY"])
```

开发期 `auth=off` 时可省略 `apiKey`。
