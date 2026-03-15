import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create the schema inline to test without openclaw SDK dependency.
// This validates the Zod schema logic independently.
const PeerClawConfigSchema = z.object({
  name: z.string().optional(),
  defaultAccount: z.string().optional(),
  enabled: z.boolean().optional(),
  serverUrl: z.string().optional(),
  publicKey: z.string().optional(),
  dmPolicy: z.enum(["pairing", "allowlist", "open", "disabled"]).optional(),
  allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
});

describe("PeerClawConfigSchema", () => {
  it("accepts a valid full config", () => {
    const config = {
      name: "my-agent",
      defaultAccount: "default",
      enabled: true,
      serverUrl: "http://localhost:8080",
      publicKey: "dGVzdHB1YmtleXRoYXRpczMyYnl0ZXNsb25nISE=",
      dmPolicy: "pairing" as const,
      allowFrom: ["agent-1-pubkey", "agent-2-pubkey"],
    };
    const result = PeerClawConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("accepts an empty config", () => {
    const result = PeerClawConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts config with only serverUrl", () => {
    const result = PeerClawConfigSchema.safeParse({
      serverUrl: "https://peerclaw.example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid dmPolicy", () => {
    const result = PeerClawConfigSchema.safeParse({
      dmPolicy: "invalid_policy",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean enabled", () => {
    const result = PeerClawConfigSchema.safeParse({
      enabled: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("accepts allowFrom with mixed string and number entries", () => {
    const result = PeerClawConfigSchema.safeParse({
      allowFrom: ["pubkey-1", 12345],
    });
    expect(result.success).toBe(true);
  });

  it("rejects allowFrom with object entries", () => {
    const result = PeerClawConfigSchema.safeParse({
      allowFrom: [{ id: "bad" }],
    });
    expect(result.success).toBe(false);
  });
});
