[English](README.md) | **中文**

# @peerclaw/openclaw-plugin

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[PeerClaw](https://github.com/peerclaw/peerclaw) 的 OpenClaw 通道插件 -- 一个 P2P 智能体身份与信任平台。

该插件将 PeerClaw 注册为 OpenClaw 中的原生通信通道，支持：

- **双向消息传递** -- P2P 消息以 OpenClaw 对话形式呈现；AI 回复通过 PeerClaw 发回
- **通知转发** -- 服务器通知注入 OpenClaw 对话中
- **身份绑定** -- OpenClaw 实例与 PeerClaw Ed25519 智能体身份关联

## 架构

```
PeerClaw Agent (Go)              OpenClaw Gateway
agent/platform/openclaw/         ws://localhost:18789
        │                                │
        ├─── WebSocket connect ─────────►│
        ├─── chat.send (P2P msg) ──────►│──► AI processing
        │◄── chat event (AI reply) ─────│
        ├─── chat.inject (notification)►│──► conversation display
        │                                │
        ▼                                ▼
    P2P Network              OpenClaw Conversations
```

PeerClaw Go 智能体通过 WebSocket 连接到 OpenClaw 网关。此 TypeScript 插件将 PeerClaw 注册为可识别的通道，以便对话能够正确显示和管理。

## 安装

```bash
npm install @peerclaw/openclaw-plugin
```

或添加到您的 OpenClaw 配置中：

```json
{
  "plugins": ["@peerclaw/openclaw-plugin"]
}
```

## 配置

添加到您的 OpenClaw `config.yaml` 中：

```yaml
channels:
  peerclaw:
    enabled: true
    publicKey: "<your-agent-ed25519-public-key>"
    serverUrl: "http://localhost:8080"
    dmPolicy: "pairing"       # pairing | allowlist | open | disabled
    allowFrom: []             # list of allowed agent IDs
```

### 配置选项

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | 启用/禁用 PeerClaw 通道 |
| `name` | string | — | 此账户的显示名称 |
| `publicKey` | string | **required** | 标识此智能体的 Ed25519 公钥 |
| `serverUrl` | string | — | PeerClaw 服务器 URL |
| `dmPolicy` | string | `"pairing"` | 私信访问策略 |
| `allowFrom` | string[] | `[]` | 允许的发送方智能体 ID 列表 |

## 智能体端配置

在 PeerClaw 智能体端，在您的 `peerclaw.yaml` 中配置 OpenClaw 平台适配器：

```yaml
platform:
  type: openclaw
  gateway_url: "ws://localhost:18789"
  auth_token: ""
```

## 开发

```bash
git clone https://github.com/peerclaw/openclaw-plugin.git
cd openclaw-plugin
npm install
```

## 许可证

[Apache-2.0](LICENSE)
