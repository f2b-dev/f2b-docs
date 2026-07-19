# 错误码

响应形状（摘要）：

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "sandbox not found",
    "details": {}
  }
}
```

常见 `code`（与 f2b-spec / SDK `ErrorCode` 对齐）：

| code | 含义 |
|------|------|
| `INTERNAL` | 未分类服务端错误 |
| `BACKEND_UNAVAILABLE` | 上游或网络不可达 |
| `NOT_FOUND` | 资源不存在 |
| `UNAUTHORIZED` | 缺少或无效凭证 |
| `VALIDATION` | 请求体 / 参数非法 |
| `CONFLICT` | 状态冲突 |

完整列表以 [f2b-spec](https://github.com/f2b-dev/f2b-spec) 的 `errors/codes.json` 为准。
