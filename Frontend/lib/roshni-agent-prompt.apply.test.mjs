/**
 * Lightweight frontend verification for voice-default apply rules.
 * Run: node Frontend/lib/roshni-agent-prompt.apply.test.mjs
 */

function shouldApplyRemoteVoiceDefault(current, remote, options = {}) {
  const trimmed = String(current || "").trim();
  if (!trimmed) return true;
  if (options.legacy && trimmed === options.legacy) return true;
  if (options.bundled && trimmed === options.bundled) return true;
  if (trimmed === remote.trim()) return false;
  return false;
}

const bundled = "BUNDLED_PROMPT";
const remote = "ADMIN_PROMPT";
const legacy = "LEGACY_SCRIPT";

const cases = [
  ["empty", shouldApplyRemoteVoiceDefault("", remote, { bundled, legacy }), true],
  [
    "bundled",
    shouldApplyRemoteVoiceDefault(bundled, remote, { bundled, legacy }),
    true,
  ],
  [
    "legacy",
    shouldApplyRemoteVoiceDefault(legacy, remote, { bundled, legacy }),
    true,
  ],
  [
    "custom",
    shouldApplyRemoteVoiceDefault("My custom prompt", remote, { bundled, legacy }),
    false,
  ],
  [
    "already remote",
    shouldApplyRemoteVoiceDefault(remote, remote, { bundled, legacy }),
    false,
  ],
];

let failed = 0;
for (const [name, actual, expected] of cases) {
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL ${name}: expected ${expected}, got ${actual}`);
  } else {
    console.log(`ok ${name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log("All voice-default apply checks passed.");
