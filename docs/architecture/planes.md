# 控制面与数据面

## 控制面（Control Plane）

面向租户与开发者体验：

- 官网与控制台 UI  
- BFF（鉴权会话、聚合、限流入口）  
- 用户 API Key 的**产品侧**管理 UI（实际密钥存 sandbox 服务）  
- 用量展示、模板目录元数据  

控制面可以常驻；不直接持有 guest 进程。

## 数据面（Data Plane）

面向隔离执行：

- 创建 / 销毁 guest  
- 命令执行与文件系统  
- 网络策略（如是否允许公网）  
- 后端实现：开发期 **Fake**；默认生产为 **单节点** microVM（与控制面同机 all-in-one）；多节点后置  

### 生产路径分层（f2b-sandbox）

生产数据面在 `f2b-sandbox` 内拆成两层（与常见沙箱 SDK 一致）：

| 层 | 职责 | 主要路径 |
|----|------|----------|
| **集群控制 API** | 生命周期 | `POST/GET/DELETE /sandboxes` |
| **guest 内 envd** | 命令 / 文件 | Connect `process.Process/Start`；`GET/POST /files`；`ListDir` |

要点：

- 创建请求字段：`templateID`（必填）、`timeout`（**秒**）、`allow_internet_access`（snake_case）、`metadata` 等。  
- 创建响应含 `sandboxID`、`envdAccessToken`、`domain` 等；**token 仅服务端进程缓存**，不经 Control API / BFF 下发浏览器。  
- 命令与文件**不**走集群控制 API 的 `/commands`、`/files` 假路径，而走 envd。  
- 无 KVM 时：`F2B_SANDBOX_BACKEND=fake`，或 `pnpm mock:cube` + `pnpm smoke:cube` 验协议。

环境变量（仅服务端）：`F2B_CUBE_API_URL` / `F2B_CUBE_API_TOKEN`、可选 `F2B_CUBE_ENVD_BASE_URL`、`F2B_CUBE_SANDBOX_DOMAIN`、`F2B_CUBE_ENVD_PORT`。强制 Fake：`F2B_SANDBOX_BACKEND=fake`。

## 边界

```text
浏览器 ──► f2b-web BFF ──► f2b-sandbox ──► Fake | 控制 API + envd
   │              │                │
   │              │                └─ 数据面凭证 / envd token（仅服务端）
   │              └─ F2B_SANDBOX_URL、可选 Admin Token（服务端）
   └─ 永不出现 CUBE_* / 集群管理 Token / envdAccessToken
```

| 允许 | 禁止 |
|------|------|
| 用户 JWT / 用户 `sk_live_*` | 把数据面管理密钥打进前端 bundle |
| BFF 服务端代理 | 浏览器直连持管理密钥的 upstream |
| Fake 演示并标明 | 未配置生产 URL 时宣称「已连真集群」 |

## 本地默认

- `F2B_SANDBOX_BACKEND=fake`  
- 控制台顶栏可见 `fake · BFF → sandbox` 一类诚实状态  
- 契约：`f2b-sandbox` 的 `pnpm ci:contract` 含 fake 冒烟 + mock 控制 API/envd 的 `smoke:cube`  
