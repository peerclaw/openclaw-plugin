import {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
} from "openclaw/plugin-sdk/account-id";
import type { OpenClawConfig } from "openclaw/plugin-sdk";

export interface PeerClawAccountConfig {
  enabled?: boolean;
  name?: string;
  defaultAccount?: string;
  serverUrl?: string;
  publicKey?: string;
  dmPolicy?: "pairing" | "allowlist" | "open" | "disabled";
  allowFrom?: Array<string | number>;
}

export interface ResolvedPeerClawAccount {
  accountId: string;
  name?: string;
  enabled: boolean;
  configured: boolean;
  serverUrl: string;
  publicKey: string;
  config: PeerClawAccountConfig;
}

function getPeerClawConfig(cfg: OpenClawConfig): PeerClawAccountConfig | undefined {
  return (cfg.channels as Record<string, unknown> | undefined)?.peerclaw as
    | PeerClawAccountConfig
    | undefined;
}

/**
 * List all configured PeerClaw account IDs.
 */
export function listPeerClawAccountIds(cfg: OpenClawConfig): string[] {
  const peerclawCfg = getPeerClawConfig(cfg);
  if (peerclawCfg?.publicKey) {
    return [DEFAULT_ACCOUNT_ID];
  }
  return [];
}

/**
 * Get the default account ID.
 */
export function resolveDefaultPeerClawAccountId(cfg: OpenClawConfig): string {
  const ids = listPeerClawAccountIds(cfg);
  if (ids.includes(DEFAULT_ACCOUNT_ID)) {
    return DEFAULT_ACCOUNT_ID;
  }
  return ids[0] ?? DEFAULT_ACCOUNT_ID;
}

/**
 * Resolve a PeerClaw account from config.
 */
export function resolvePeerClawAccount(opts: {
  cfg: OpenClawConfig;
  accountId?: string | null;
}): ResolvedPeerClawAccount {
  const accountId = normalizeAccountId(
    opts.accountId ?? resolveDefaultPeerClawAccountId(opts.cfg),
  );
  const peerclawCfg = getPeerClawConfig(opts.cfg);

  const baseEnabled = peerclawCfg?.enabled !== false;
  const publicKey = peerclawCfg?.publicKey ?? "";
  const serverUrl = peerclawCfg?.serverUrl ?? "";
  const configured = Boolean(publicKey.trim());

  return {
    accountId,
    name: peerclawCfg?.name?.trim() || undefined,
    enabled: baseEnabled,
    configured,
    serverUrl,
    publicKey,
    config: {
      enabled: peerclawCfg?.enabled,
      name: peerclawCfg?.name,
      serverUrl: peerclawCfg?.serverUrl,
      publicKey: peerclawCfg?.publicKey,
      dmPolicy: peerclawCfg?.dmPolicy,
      allowFrom: peerclawCfg?.allowFrom,
    },
  };
}
