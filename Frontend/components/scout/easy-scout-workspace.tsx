"use client";

import { ScoutWorkspace } from "@/components/scout/scout-workspace";
import { easyScoutApi } from "@/lib/api";
import { EASY_SCOUT_LOOKUP_TYPES } from "@/lib/mock-scout";

export function EasyScoutWorkspace() {
  return (
    <ScoutWorkspace
      api={easyScoutApi}
      lookupTypes={EASY_SCOUT_LOOKUP_TYPES}
      historyTitle="Recent Easy Scout lookups"
    />
  );
}
