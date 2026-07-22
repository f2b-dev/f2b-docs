# Python SDK

仓库：[f2b-sdk-python](https://github.com/f2b-dev/f2b-sdk-python)

仅标准库（`urllib`），无强制第三方依赖。

```bash
cd f2b-sdk-python
python3 -m pip install -e .   # 可选
# 需 sandbox :13287；可选 F2B_TUNNEL_URL
python3 scripts/smoke.py      # → PY_SDK_SMOKE_OK
```

```python
from f2b import F2bClient, Sandbox

client = F2bClient(base_url="http://127.0.0.1:13287")
sbx = Sandbox.create(client, template="base")
print(sbx.run("echo hello")["stdout"])
sbx.write("/home/user/a.txt", "ok")
print(sbx.read("/home/user/a.txt"))
sbx.pause()
sbx.resume()
print(client.list_templates())
print(client.get_usage(7))
sbx.kill()
```

隧道（需 [f2b-tunnel](https://github.com/f2b-dev/f2b-tunnel) 或 BFF）：

```python
client = F2bClient(
    base_url="http://127.0.0.1:13287",
    tunnel_base_url="http://127.0.0.1:8790",
)
tun = client.create_tunnel(sandboxId=sbx.id, port=3000, targetUrl="http://127.0.0.1:3000")
print(tun["publicUrl"])
client.close_tunnel(tun["id"])
```

| 参数 | 说明 |
|------|------|
| `base_url` | 服务根（sandbox 或 BFF） |
| `path_prefix` | 默认 `"/v1"`；BFF 用 `"/api"` |
| `tunnel_base_url` | 可选；默认同 `base_url` |
| `tunnel_path_prefix` | 默认 `"/v1"`；BFF 用 `"/api"` |
| `api_key` | 可选 Bearer |
| `timeout_sec` | HTTP 超时，默认 60 |

**导出**：`Sandbox`（`create` / `run` / `run_stream` / `write` / `read` / `list_files` / `delete_file` / `pause` / `resume` / `update` / `kill`）、`update_sandbox` / `get_usage` / `list_templates` / 隧道 CRUD。

**1.0 前不发布 PyPI。**
