# OpenAPI 契约

权威机器可读契约在 **[f2b-spec](https://github.com/f2b-dev/f2b-spec)**，文档站不维护第二份 YAML。

## 文件

| 文件 | 用途 |
|------|------|
| [`openapi/sandbox-v1.yaml`](https://github.com/f2b-dev/f2b-spec/blob/main/openapi/sandbox-v1.yaml) | 沙箱控制面：生命周期、命令、文件、模板、用量、API Key、`/healthz` |
| [`openapi/tunnel-v1.yaml`](https://github.com/f2b-dev/f2b-spec/blob/main/openapi/tunnel-v1.yaml) | 预览隧道 CRUD 与代理约定 |
| [`errors/codes.json`](https://github.com/f2b-dev/f2b-spec/blob/main/errors/codes.json) | 错误码表（与 OpenAPI `ApiError` enum / SDK `ErrorCode` 对齐） |

Raw（便于本地工具拉取）：

```text
https://raw.githubusercontent.com/f2b-dev/f2b-spec/main/openapi/sandbox-v1.yaml
https://raw.githubusercontent.com/f2b-dev/f2b-spec/main/openapi/tunnel-v1.yaml
https://raw.githubusercontent.com/f2b-dev/f2b-spec/main/errors/codes.json
```

## 本地预览

```bash
cd f2b-spec
# 任选：Swagger UI / Redoc / VS Code OpenAPI 插件打开 openapi/sandbox-v1.yaml
pnpm install
pnpm check:errors   # 校验 codes.json 与源码枚举一致（若仓内提供）
```

浏览器可粘贴 raw URL 到 [Swagger Editor](https://editor.swagger.io/) 或自建 Redoc。

## 与人类文档的关系

| 文档 | 内容 |
|------|------|
| [沙箱 API](./sandbox) | 端点表、encoding / 保活语义、BFF 映射 |
| [隧道 API](./tunnel) | 隧道与控制台预览 |
| [错误码](./errors) | HTTP 映射 + curl 复现示例 |

交叉引用：

| 关系 | 说明 |
|------|------|
| 隧道 ↔ 沙箱 | `tunnel-v1` 的 `sandboxId` 对应 `sandbox-v1` 的沙箱 `id`；无跨文件 `$ref`（两仓/两服务独立部署） |
| 错误码 | 沙箱错误以 `errors/codes.json` 为准；隧道另有 `TUNNEL_*` 码，同表 |
| OpenAPI ↔ Zod | **双源**：YAML 对外契约，Zod 运行时校验；1.0 前不强制 codegen，改字段须两边同改（见 f2b-spec README） |

鉴权与密钥模型见 [鉴权](/architecture/auth)。实现以 **f2b-spec + f2b-sandbox / f2b-tunnel** 为准，本文仅作入口。

## 版本

路径前缀当前为 **`/v1`**。破坏性变更走组织 semver / CHANGELOG 约定；**1.0 前** 契约仍可能调整，以 `main` 为准。
