import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { peerclawPlugin } from "./src/channel.js";

const plugin = {
  id: "peerclaw",
  name: "PeerClaw",
  description: "PeerClaw P2P agent identity and trust channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: peerclawPlugin });
  },
};

export default plugin;
