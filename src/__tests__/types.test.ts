import { describe, it, expect } from "vitest";

// Test the account resolution logic independently.

const DEFAULT_ACCOUNT_ID = "default";

function normalizeAccountId(id: string): string {
  return id.trim().toLowerCase();
}

interface PeerClawAccountConfig {
  enabled?: boolean;
  name?: string;
  serverUrl?: string;
  publicKey?: string;
  dmPolicy?: "pairing" | "allowlist" | "open" | "disabled";
  allowFrom?: Array<string | number>;
}

interface ResolvedPeerClawAccount {
  accountId: string;
  name?: string;
  enabled: boolean;
  configured: boolean;
  serverUrl: string;
  publicKey: string;
  config: PeerClawAccountConfig;
}

function getPeerClawConfig(
  cfg: Record<string, unknown>,
): PeerClawAccountConfig | undefined {
  return (cfg.channels as Record<string, unknown> | undefined)?.peerclaw as
    | PeerClawAccountConfig
    | undefined;
}

function listPeerClawAccountIds(cfg: Record<string, unknown>): string[] {
  const peerclawCfg = getPeerClawConfig(cfg);
  if (peerclawCfg?.publicKey) {
    return [DEFAULT_ACCOUNT_ID];
  }
  return [];
}

function resolvePeerClawAccount(opts: {
  cfg: Record<string, unknown>;
  accountId?: string | null;
}): ResolvedPeerClawAccount {
  const ids = listPeerClawAccountIds(opts.cfg);
  const defaultId = ids.includes(DEFAULT_ACCOUNT_ID)
    ? DEFAULT_ACCOUNT_ID
    : ids[0] ?? DEFAULT_ACCOUNT_ID;
  const accountId = normalizeAccountId(opts.accountId ?? defaultId);
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

describe("listPeerClawAccountIds", () => {
  it("returns default account when publicKey is set", () => {
    const cfg = {
      channels: { peerclaw: { publicKey: "abc123" } },
    };
    expect(listPeerClawAccountIds(cfg)).toEqual(["default"]);
  });

  it("returns empty array when no publicKey", () => {
    const cfg = { channels: { peerclaw: {} } };
    expect(listPeerClawAccountIds(cfg)).toEqual([]);
  });

  it("returns empty array when no peerclaw config", () => {
    const cfg = { channels: {} };
    expect(listPeerClawAccountIds(cfg)).toEqual([]);
  });
});

describe("resolvePeerClawAccount", () => {
  it("resolves a configured account", () => {
    const cfg = {
      channels: {
        peerclaw: {
          name: "My Agent",
          serverUrl: "http://localhost:8080",
          publicKey: "dGVzdHB1YmtleQ==",
          dmPolicy: "pairing" as const,
        },
      },
    };
    const account = resolvePeerClawAccount({ cfg });
    expect(account.accountId).toBe("default");
    expect(account.name).toBe("My Agent");
    expect(account.enabled).toBe(true);
    expect(account.configured).toBe(true);
    expect(account.publicKey).toBe("dGVzdHB1YmtleQ==");
    expect(account.serverUrl).toBe("http://localhost:8080");
  });

  it("resolves unconfigured account when no publicKey", () => {
    const cfg = {
      channels: { peerclaw: { serverUrl: "http://localhost:8080" } },
    };
    const account = resolvePeerClawAccount({ cfg });
    expect(account.configured).toBe(false);
    expect(account.publicKey).toBe("");
  });

  it("respects enabled: false", () => {
    const cfg = {
      channels: {
        peerclaw: {
          enabled: false,
          publicKey: "abc",
        },
      },
    };
    const account = resolvePeerClawAccount({ cfg });
    expect(account.enabled).toBe(false);
  });

  it("uses custom accountId", () => {
    const cfg = {
      channels: { peerclaw: { publicKey: "abc" } },
    };
    const account = resolvePeerClawAccount({ cfg, accountId: "Custom" });
    expect(account.accountId).toBe("custom");
  });
});

describe("messaging helpers", () => {
  it("validates Ed25519 public key format (base64)", () => {
    const looksLikeId = (input: string) => {
      const trimmed = input.trim();
      return (
        /^[A-Za-z0-9+/=]{43,44}$/.test(trimmed) ||
        /^[0-9a-fA-F]{64}$/.test(trimmed)
      );
    };

    // 32 bytes = 44 base64 chars with padding
    expect(looksLikeId("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")).toBe(true);
    // 32 bytes hex = 64 hex chars
    expect(
      looksLikeId(
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      ),
    ).toBe(true);
    // Not a valid key
    expect(looksLikeId("hello")).toBe(false);
    expect(looksLikeId("")).toBe(false);
  });
});
