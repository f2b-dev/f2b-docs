# 版本与发版策略

## 总原则

- **契约仓** `f2b-spec` 是字段与错误码的真相来源。
- 服务 HTTP 使用 **`/v1`** 前缀；破坏性演进优先新字段或 `/v2`，避免静默改语义。
- **产品 1.0 之前**：不做 npm / PyPI **正式 registry 发布**；依赖用 `file:`、git 或 Python editable。

## `@f2b/spec` semver

| 变更类型 | 版本 | 示例 |
|----------|------|------|
| 修文档 / 非导出类型笔误 | patch | README、注释 |
| 新增可选字段、新错误码、新资源（兼容） | minor | `TunnelRecord`、SSE 事件可选字段 |
| 删除/改名必填字段、改错误语义 | major | 去掉必填 `id` 形态 |

### OpenAPI 与 Zod（双源）

- **OpenAPI YAML**：跨语言 / 文档 / 外部生成器的 HTTP 真相面。  
- **Zod（`src/`）**：`f2b-sandbox` 运行时校验与 TS 类型。  
- **1.0 前**：不强制从 OpenAPI 生成 Zod；改契约时 **YAML + Zod + codes.json** 同 PR。  
- CI：`pnpm lint:openapi`（Spectral）+ `pnpm check:errors` + sandbox `ci:contract`。

### 破坏性变更流程

1. PR 标记 `breaking`，列出影响仓（sandbox / sdk / web / mcp / tunnel）。
2. 发布顺序：`spec` → 实现服务 → SDK → web BFF → docs。
3. **1.0 前**：允许较快 breaking，须在 README / changelog 写清。
4. **1.0 后**：至少保留 **一个 minor 的 deprecation 窗口** 再删除字段。

OpenAPI 文件名可带 major 暗示（如 `sandbox-v1.yaml`）；与 npm 包 semver 同步维护说明。

## 服务与镜像

| 产物 | 策略 |
|------|------|
| HTTP API | `/v1`；新 major 路径或并行资源 |
| `ghcr.io/f2b-dev/sandbox` | `:<git-sha>` + main 的 `latest` |
| 控制台 / BFF | 随 git；无独立 semver 强制 |

## SDK

- 公开 API 对齐 sandbox OpenAPI 子集。
- 1.0 前文档示例：

```bash
# JS：workspace file 依赖
"@f2b/sdk": "file:../f2b-sdk-js"

# Python
pip install -e ../f2b-sdk-python
```

## 包名：`@nova/*` → `@f2b/*`

| 阶段 | 行为 |
|------|------|
| 拆仓后（当前） | 新仓一律 `@f2b/*` |
| 至 1.0 | Nova monorepo 仅迁移源；新功能只进 `f2b-*` |
| 1.0 | 仅 `@f2b/*` 走 registry；Nova README 永久指向 org |

环境变量文档只写 `F2B_*`；实现可短暂兼容 `NOVA_*` / `CUBE_*` 读入。**不做** `@nova/sdk` 的 npm re-export。

## 发版列车（1.0 前）

```text
f2b-spec
  → f2b-sandbox（契约 CI）
  → f2b-sdk-js / f2b-sdk-python
  → f2b-web
  → f2b-mcp-gateway / f2b-tunnel（若触及契约）
  → f2b-docs / f2b-infra 说明
```

## CHANGELOG 与 1.0 清单

- 各产品仓根目录 `CHANGELOG.md`（Keep a Changelog；预 1.0 用 `## [Unreleased]`）。
- 组织级 **1.0 门槛、发布顺序、安全演练**：[f2b-meta RELEASE.md](https://github.com/f2b-dev/f2b-meta/blob/main/RELEASE.md)。
- **勾选完 RELEASE 清单前**不得 npm / PyPI 正式发布。
