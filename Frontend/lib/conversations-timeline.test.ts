import { describe, expect, it } from "vitest";

import { sortConversationEventsByTime } from "./conversations-timeline";

describe("sortConversationEventsByTime", () => {
  it("orders oldest to newest by sentAt", () => {
    const sorted = sortConversationEventsByTime([
      { id: "c", sentAt: "2026-01-03T00:00:00.000Z" },
      { id: "a", sentAt: "2026-01-01T00:00:00.000Z" },
      { id: "b", sentAt: "2026-01-02T00:00:00.000Z" },
    ]);
    expect(sorted.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("uses id as a stable tie-break for equal timestamps", () => {
    const stamp = "2026-01-01T12:00:00.000Z";
    const sorted = sortConversationEventsByTime([
      { id: "z-msg", sentAt: stamp },
      { id: "a-msg", sentAt: stamp },
      { id: "m-msg", sentAt: stamp },
    ]);
    expect(sorted.map((e) => e.id)).toEqual(["a-msg", "m-msg", "z-msg"]);
  });

  it("keeps missing sentAt at the end", () => {
    const sorted = sortConversationEventsByTime([
      { id: "missing" },
      { id: "early", sentAt: "2026-01-01T00:00:00.000Z" },
      { id: "late", sentAt: "2026-01-02T00:00:00.000Z" },
    ]);
    expect(sorted.map((e) => e.id)).toEqual(["early", "late", "missing"]);
  });
});
