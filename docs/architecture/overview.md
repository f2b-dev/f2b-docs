# 架构总览

## 一句话

灵境云 = **产品控制面**（官网、控制台、BFF、用户 API Key、用量）+ **沙箱数据面**（隔离 guest 的生命周期与 I/O）。

## 运行时关系

```text
浏览器
  └─ f2b-web（页面 + BFF：会话 / 聚合 / 代理）
        └─ f2b-sandbox（/v1）
              └─ Fake | 生产 microVM 集群 adapter

API Key 客户端
  └─ f2b-sdk-js / f2b-sdk-python  →  f2b-sandbox 公网 API（或统一网关）

契约
  └─ f2b-spec  ←  服务实现 & SDK 对齐

部署
  └─ f2b-infra  编排 web + sandbox（及后续 mcp / tunnel）
```

## 分层

| 层 | 仓 | 说明 |
|----|-----|------|
| 品牌 / UI | f2b-web | Next.js；插件挂导航；**无 antd** |
| BFF | f2b-web `packages/bff-core` | 同源 `/api/*` → 上游服务；注入服务端凭证 |
| 产品服务 | f2b-sandbox | 领域真相：沙箱记录、命令、文件、API Key hash |
| 契约 | f2b-spec | OpenAPI `sandbox-v1`、错误码 |
| 客户端 | f2b-sdk-* | 只依赖公开 HTTP + 公开类型 |
| 编排 | f2b-infra | compose / host 脚本，不写业务逻辑 |

## 原则

1. **一产品一服务仓**；跨切面契约进 spec。  
2. **网页单仓多插件**，不每个产品单独前端仓。  
3. **BFF 在 web**：浏览器只打同源。  
4. **SDK 不依赖 web 内部包**。  
5. **开源默认**：密钥与客户数据永不入库。  

详见 [控制面与数据面](./planes)、[鉴权模型](./auth)。
