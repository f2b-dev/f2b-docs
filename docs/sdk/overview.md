# SDK 概览

官方客户端只依赖 **公开 HTTP** 与契约语义，不依赖 f2b-web 内部包。

| 语言 | 仓库 | 包名（开发期） |
|------|------|----------------|
| TypeScript | [f2b-sdk-js](https://github.com/f2b-dev/f2b-sdk-js) | `@f2b/sdk` |
| Python | [f2b-sdk-python](https://github.com/f2b-dev/f2b-sdk-python) | `f2b` |

公共表面：

- `F2bClient` / `LingjingClient`（品牌别名）  
- `Sandbox.create` / `run` / `write` / `read` / `listFiles|list_files` / `kill`  
- `F2bError` / `ErrorCode`  

默认 `pathPrefix` / `path_prefix` = **`/v1`**，对接 f2b-sandbox。

**1.0 前** 不强制 npm / PyPI 正式发布；用 monorepo `file:`、git 或 `pip install -e .`。
