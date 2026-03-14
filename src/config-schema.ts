import { AllowFromListSchema, DmPolicySchema } from "openclaw/plugin-sdk";
import { z } from "zod";

/**
 * Zod schema for channels.peerclaw.* configuration.
 */
export const PeerClawConfigSchema = z.object({
  /** Account name (optional display name). */
  name: z.string().optional(),

  /** Optional default account id for routing/account selection. */
  defaultAccount: z.string().optional(),

  /** Whether this channel is enabled. */
  enabled: z.boolean().optional(),

  /** PeerClaw server URL (e.g., "http://localhost:8080"). */
  serverUrl: z.string().optional(),

  /** Ed25519 public key that identifies this agent. */
  publicKey: z.string().optional(),

  /** DM access policy: pairing, allowlist, open, or disabled. */
  dmPolicy: DmPolicySchema.optional(),

  /** Allowed sender agent IDs (Ed25519 public keys). */
  allowFrom: AllowFromListSchema,
});

export type PeerClawConfig = z.infer<typeof PeerClawConfigSchema>;
