import {
  buildChannelConfigSchema,
  buildBaseChannelStatusSummary,
  buildBaseAccountStatusSnapshot,
  collectStatusIssuesFromLastError,
  createDefaultChannelRuntimeState,
  DEFAULT_ACCOUNT_ID,
  formatPairingApproveHint,
  mapAllowFromEntries,
  type ChannelPlugin,
} from "openclaw/plugin-sdk";
import { PeerClawConfigSchema } from "./config-schema.js";
import {
  listPeerClawAccountIds,
  resolveDefaultPeerClawAccountId,
  resolvePeerClawAccount,
  type ResolvedPeerClawAccount,
} from "./types.js";

/**
 * PeerClaw channel plugin for OpenClaw.
 *
 * The PeerClaw Go agent connects externally to the OpenClaw gateway via WebSocket.
 * This plugin registers PeerClaw as a recognized channel so that conversations
 * routed through PeerClaw are displayed and managed correctly.
 */
export const peerclawPlugin: ChannelPlugin<ResolvedPeerClawAccount> = {
  id: "peerclaw",
  meta: {
    id: "peerclaw",
    label: "PeerClaw",
    selectionLabel: "PeerClaw",
    docsPath: "/channels/peerclaw",
    docsLabel: "peerclaw",
    blurb: "P2P agent identity and trust platform",
    order: 60,
  },
  capabilities: {
    chatTypes: ["direct"],
    media: false,
  },
  reload: { configPrefixes: ["channels.peerclaw"] },
  configSchema: buildChannelConfigSchema(PeerClawConfigSchema),

  config: {
    listAccountIds: (cfg) => listPeerClawAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolvePeerClawAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultPeerClawAccountId(cfg),
    isConfigured: (account) => account.configured,
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.configured,
      publicKey: account.publicKey,
    }),
    resolveAllowFrom: ({ cfg, accountId }) =>
      mapAllowFromEntries(resolvePeerClawAccount({ cfg, accountId }).config.allowFrom),
    formatAllowFrom: ({ allowFrom }) =>
      allowFrom
        .map((entry) => String(entry).trim())
        .filter(Boolean),
  },

  pairing: {
    idLabel: "agentId",
  },

  security: {
    resolveDmPolicy: ({ account }) => ({
      policy: account.config.dmPolicy ?? "pairing",
      allowFrom: account.config.allowFrom ?? [],
      policyPath: "channels.peerclaw.dmPolicy",
      allowFromPath: "channels.peerclaw.allowFrom",
      approveHint: formatPairingApproveHint("peerclaw"),
      normalizeEntry: (raw) => raw.trim(),
    }),
  },

  messaging: {
    normalizeTarget: (target) => target.trim(),
    targetResolver: {
      looksLikeId: (input) => {
        const trimmed = input.trim();
        // PeerClaw agent IDs are Ed25519 public keys (base64 or hex).
        return /^[A-Za-z0-9+/=]{43,44}$/.test(trimmed) || /^[0-9a-fA-F]{64}$/.test(trimmed);
      },
      hint: "<Ed25519 public key>",
    },
  },

  // Delivery is handled by the Go agent connecting to the gateway externally.
  outbound: {
    deliveryMode: "gateway",
  },

  status: {
    defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
    collectStatusIssues: (accounts) => collectStatusIssuesFromLastError("peerclaw", accounts),
    buildChannelSummary: ({ snapshot }) => ({
      ...buildBaseChannelStatusSummary(snapshot),
      publicKey: snapshot.publicKey ?? null,
    }),
    buildAccountSnapshot: ({ account, runtime }) =>
      buildBaseAccountStatusSnapshot({ account, runtime }),
  },

  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      ctx.setStatus({
        accountId: account.accountId,
        configured: account.configured,
        enabled: account.enabled,
      });
      ctx.log?.info(
        `[${account.accountId}] PeerClaw channel registered (pubkey: ${account.publicKey})`,
      );

      // The Go agent connects externally to the gateway via WebSocket.
      // No bus to start on the TypeScript side — just mark as running.
      return {
        stop: () => {
          ctx.log?.info(`[${account.accountId}] PeerClaw channel stopped`);
        },
      };
    },
  },
};
