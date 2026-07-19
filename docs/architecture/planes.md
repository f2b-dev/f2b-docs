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
- 后端实现：开发期 **Fake**；生产接 microVM 集群 adapter  

## 边界

```text
浏览器 ──► f2b-web BFF ──► f2b-sandbox ──► Fake / 集群
   │              │                │
   │              │                └─ 数据面凭证（仅服务端 env）
   │              └─ F2B_SANDBOX_URL、可选 Admin Token（服务端）
   └─ 永不出现 CUBE_* / 集群管理 Token
```

| 允许 | 禁止 |
|------|------|
| 用户 JWT / 用户 `sk_live_*` | 把数据面管理密钥打进前端 bundle |
| BFF 服务端代理 | 浏览器直连持管理密钥的 upstream |
| Fake 演示并标明 | 未配置生产 URL 时宣称「已连真集群」 |

## 本地默认

- `F2B_SANDBOX_BACKEND=fake`  
- 控制台顶栏可见 `fake · BFF → sandbox` 一类诚实状态  
