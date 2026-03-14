# @peerclaw/openclaw-plugin

OpenClaw channel plugin for [PeerClaw](https://github.com/peerclaw/peerclaw) — a P2P agent identity and trust platform.

This plugin registers PeerClaw as a native communication channel in OpenClaw, enabling:

- **Bidirectional messaging** — P2P messages appear as OpenClaw conversations; AI responses are sent back via PeerClaw
- **Notification forwarding** — Server notifications are injected into OpenClaw conversations
- **Identity binding** — OpenClaw instances are linked to PeerClaw Ed25519 agent identities

## Architecture

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

The PeerClaw Go agent connects to the OpenClaw gateway via WebSocket. This TypeScript plugin registers PeerClaw as a recognized channel so conversations are displayed and managed correctly.

## Installation

```bash
npm install @peerclaw/openclaw-plugin
```

Or add to your OpenClaw configuration:

```json
{
  "plugins": ["@peerclaw/openclaw-plugin"]
}
```

## Configuration

Add to your OpenClaw `config.yaml`:

```yaml
channels:
  peerclaw:
    enabled: true
    publicKey: "<your-agent-ed25519-public-key>"
    serverUrl: "http://localhost:8080"
    dmPolicy: "pairing"       # pairing | allowlist | open | disabled
    allowFrom: []             # list of allowed agent IDs
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable the PeerClaw channel |
| `name` | string | — | Display name for this account |
| `publicKey` | string | **required** | Ed25519 public key identifying this agent |
| `serverUrl` | string | — | PeerClaw server URL |
| `dmPolicy` | string | `"pairing"` | DM access policy |
| `allowFrom` | string[] | `[]` | Allowed sender agent IDs |

## Agent-Side Setup

On the PeerClaw agent side, configure the OpenClaw platform adapter in your `peerclaw.yaml`:

```yaml
platform:
  type: openclaw
  gateway_url: "ws://localhost:18789"
  auth_token: ""
```

## Development

```bash
git clone https://github.com/peerclaw/openclaw-plugin.git
cd openclaw-plugin
npm install
```

## License

Apache-2.0
