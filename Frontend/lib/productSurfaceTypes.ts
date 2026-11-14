export type SurfaceActor = "ai" | "recruiter" | "candidate" | "system";

export type SurfaceBlock =
  | { type: "prompt"; label: string; text: string }
  | { type: "chips"; label?: string; items: { text: string; accent?: boolean }[] }
  | {
      type: "rows";
      label?: string;
      items: {
        title: string;
        subtitle?: string;
        meta?: string;
        badge?: string;
        accent?: boolean;
        /** 0–100; renders a compact score meter. */
        score?: number;
      }[];
    }
  | { type: "timeline"; label?: string; items: { time: string; text: string; actor: SurfaceActor }[] }
  | { type: "rules"; label?: string; items: { key: string; value: string }[] }
  | { type: "bars"; label?: string; items: { label: string; value: number; display?: string }[] }
  | {
      type: "messages";
      label?: string;
      items: { from: "huntlo" | "candidate" | "recruiter"; channel?: string; text: string; time?: string }[];
    }
  | {
      type: "calendar";
      label?: string;
      days: string[];
      times: string[];
      /** `cells[timeIndex][dayIndex]` */
      cells: ("open" | "busy" | "booked" | "none")[][];
    }
  | { type: "stats"; label?: string; items: { label: string; value: string; note?: string }[] }
  | { type: "split"; leftLabel: string; rightLabel: string; items: { left: string; right: string }[] }
  | {
      type: "panels";
      label?: string;
      items: { title: string; subtitle?: string; badge?: string; stats: { label: string; value: string }[] }[];
    }
  | { type: "table"; label?: string; columns: string[]; rows: string[][] }
  | { type: "layers"; label?: string; items: { label: string; items: string[]; accent?: boolean }[] }
  | {
      type: "stages";
      items: { step: string; title: string; lines: string[]; actor: SurfaceActor }[];
    }
  | { type: "note"; text: string; tone?: "review" | "info" }
  | { type: "actions"; items: { label: string; primary?: boolean }[] };

/** An illustrative Huntlo working surface, rendered as product UI rather than an abstract diagram. */
export type ProductSurface = {
  /** Workspace context shown in the window header, e.g. "Senior Backend Engineer". */
  workspace: string;
  /** Current view inside the workspace, e.g. "Ranked results". */
  view: string;
  status?: string;
  /** Text alternative describing what the surface demonstrates. */
  alt: string;
  blocks: SurfaceBlock[];
  /** Downstream stages shown beneath the surface. */
  flow?: string[];
};

/** Answer-first explanation paired with a product surface. */
export type ProductEvidence = {
  eyebrow: string;
  title: string;
  intro: string;
  /** Annotations explaining what the surface shows. */
  points: { title: string; body: string }[];
  surface: ProductSurface;
  /** Overrides the default "illustrative workspace" caption. */
  disclaimer?: string;
};
