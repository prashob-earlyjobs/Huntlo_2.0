/** Homepage section anchors used by landing nav (Resources, Pricing). */
export const HOME_NAV_LINKS = [
  { label: "Resources", sectionId: "resources" },
  { label: "Pricing", sectionId: "pricing" },
] as const;

export function homeSectionHref(sectionId: string): string {
  return `/#${sectionId}`;
}
