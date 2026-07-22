# 能力矩阵：Fake vs 真 microVM

> 产品 API（`/v1`）对客户端尽量一致；下表描述 **数据面实现差异** 与当前验收状态。  
> 用户可见文案不出现上游内核品牌；本页为 **工程/运维** 文档。

| 能力 | Fake（当前默认） | 真 microVM（CubeAPI + envd） | 备注 |
|------|------------------|------------------------------|------|
| 生命周期 create / get / list / kill | 全量 | 全量（依赖集群） | |
| pause / resume | 全量 | **视集群** | 不支持须明确错误，禁止假成功 |
| 命令 run | 全量 | envd Connect | |
| 命令 stream（SSE） | 全量 | 视 adapter 流式封装 | |
| 命令 cwd / env / timeoutMs | 全量 | 视 envd | fake 超时约 exit 124 |
| 文件 utf8 / base64 | 全量 | envd `/files` | |
| mkdir / rename / delete | 全量 | 视 envd | |
| metadata + PATCH timeout | 控制面 | 同左 | 不进 guest |
| 滑动空闲 reaper | 全量 | 同左（控制面杀生命周期） | |
| 并发硬顶 | `F2B_MAX_CONCURRENT_SANDBOXES` | 同左 **且** 受主机 KVM/内存 | |
| 模板目录 | 预置元数据 | 预置 id；自定义构建后置 | |
| 用量聚合 | 全量 | 全量 | 非账单扣款 |
| 隧道预览 | 独立 f2b-tunnel | 同左（指向可达 target） | |
| 协议 CI | `ci:contract` + `smoke:cube`（mock） | mock **不等于** 真 KVM | |
| 香港测试机 `156.238.244.3` | **已部署 Fake** | KVM 设备有；**栈未装**；4G 仅 nested 实验 | 见 f2b-infra `cube-single-node` |

## 切换条件

1. Linux + `/dev/kvm`（nested 须实测稳定性）。  
2. 本机 loopback CubeAPI 健康；密钥仅在 sandbox 进程 env。  
3. `GET /healthz` 的 `backend` 为非 `fake`。  
4. 走完 [cube-single-node 验收清单](https://github.com/f2b-dev/f2b-infra/blob/main/docs/cube-single-node.md)。  
5. 更新本表「真 microVM」列与香港机行。

## 相关

- [控制面与数据面](./planes)  
- [单机容量](./capacity)  
- [本地 Compose](./compose)
