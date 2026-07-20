# 隧道 API

权威契约：[f2b-spec/openapi/tunnel-v1.yaml](https://github.com/f2b-dev/f2b-spec/blob/main/openapi/tunnel-v1.yaml)。

默认本地：`http://127.0.0.1:8790`。

## 职责

为沙箱内端口生成**预览 URL**，并把 `/t/{id}/…` 反向代理到上游 `targetUrl`。

| 阶段 | 行为 |
|------|------|
| V1 dev | 客户端传 `targetUrl`（或默认 `http://127.0.0.1:{port}`），内存表 |
| 生产 | 由 tunnel 根据 `sandboxId`+`port` 解析沙箱网络（不在本页展开） |

## 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/healthz` | 健康检查 |
| GET | `/v1/tunnels` | 列表（`?sandboxId=` / `?projectId=`） |
| POST | `/v1/tunnels` | 创建 body：`sandboxId` / `port` / `targetUrl?` / `ttlSec?` |
| GET | `/v1/tunnels/{id}` | 详情 |
| DELETE | `/v1/tunnels/{id}` | 关闭 |
| * | `/t/{id}/…` | 公开预览代理 |

## 示例

```bash
# 创建（假设本机 3000 有服务）
curl -s -X POST http://127.0.0.1:8790/v1/tunnels \
  -H 'content-type: application/json' \
  -d '{"sandboxId":"sbx_demo","port":3000,"targetUrl":"http://127.0.0.1:3000"}'

# 访问 publicUrl
curl -s http://127.0.0.1:8790/t/$ID/

# 关闭
curl -s -X DELETE http://127.0.0.1:8790/v1/tunnels/$ID
```

实现仓：[f2b-tunnel](https://github.com/f2b-dev/f2b-tunnel)。冒烟：`pnpm ci:contract` → **TUNNEL_CONTRACT_OK**。
