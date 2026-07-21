# Python SDK

仓库：[f2b-sdk-python](https://github.com/f2b-dev/f2b-sdk-python)

仅标准库（`urllib`），无强制第三方依赖。

```bash
cd f2b-sdk-python
python3 -m pip install -e .   # 可选
python3 scripts/smoke.py      # → PY_SDK_SMOKE_OK
```

```python
from f2b import F2bClient, Sandbox

client = F2bClient(base_url="http://127.0.0.1:13287")
sbx = Sandbox.create(client, template="base")
print(sbx.run("echo hello")["stdout"])
sbx.write("/home/user/a.txt", "ok")
print(sbx.read("/home/user/a.txt"))
sbx.kill()
```

| 参数 | 说明 |
|------|------|
| `base_url` | 服务根 |
| `path_prefix` | 默认 `"/v1"` |
| `api_key` | 可选 Bearer |
| `timeout_sec` | HTTP 超时，默认 60 |

**1.0 前不发布 PyPI。**
