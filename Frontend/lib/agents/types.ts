export type CapabilityStatus = "live" | "pilot" | "planned";

export function isIndexableCapability(status: CapabilityStatus): boolean {
  return status === "live" || status === "pilot";
}
