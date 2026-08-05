/**
 * Frontend mirror of the WhatsApp cold-outbound Meta template catalogue.
 * Keep in sync with Backend/src/modules/outreach/whatsapp-template-catalogue.ts
 */

export type WhatsAppTemplateSlot = "opening" | "no_reply_1" | "no_reply_2";

export type WhatsAppApprovedTemplate = {
  id: string;
  metaName: string;
  name: string;
  slot: WhatsAppTemplateSlot;
  language: string;
  body: string;
  isDefault?: boolean;
  variables: Array<{ key: string; description: string; sample: string }>;
};

const TWO_VARS = [
  { key: "1", description: "Candidate first name (FirstName)", sample: "Alex" },
  {
    key: "2",
    description: "Open role / job title from campaign (JobTitle)",
    sample: "Senior Backend Engineer",
  },
];

export const APPROVED_WHATSAPP_TEMPLATES: WhatsAppApprovedTemplate[] = [
  {
    id: "opening_message_01",
    metaName: "opening_message_01",
    name: "Opening message",
    slot: "opening",
    language: "en",
    isDefault: true,
    body:
      "Hi {{1}},\n" +
      "\n" +
      "Your profile has been shortlisted through our candidate matching process for the {{2}} position.\n" +
      "\n" +
      "To review the opportunity details and next steps, please reply to this message.",
    variables: TWO_VARS,
  },
  {
    id: "profile_review_reminder_v1",
    metaName: "profile_review_reminder_v1",
    name: "Profile review reminder",
    slot: "opening",
    language: "en",
    body:
      "Hi {{1}},\n" +
      "This is a follow-up regarding the profile review communication shared earlier for the {{2}} requirement.\n" +
      "If you would like to receive additional information regarding the recruitment process and next steps, please reply to this message.\n" +
      "Thank you.",
    variables: TWO_VARS,
  },
  {
    id: "role_alignment_review",
    metaName: "role_alignment_review",
    name: "Role alignment review",
    slot: "opening",
    language: "en",
    body:
      "Hi {{1}},\n" +
      "During our recruitment review process, your professional experience was identified as relevant to a current requirement for a {{2}} role.\n" +
      "If you would like to receive more information regarding the opportunity and process, please reply to this message.\n" +
      "Thank you.",
    variables: TWO_VARS,
  },
  {
    id: "recruitment_update_reminder_v1",
    metaName: "recruitment_update_reminder_v1",
    name: "Recruitment update reminder",
    slot: "no_reply_1",
    language: "en",
    body:
      "Hi {{1}},\n" +
      "We are following up regarding the previous communication about the review of your profile for the {{2}} requirement.\n" +
      "If you would like further information or wish to continue the recruitment process, please reply to this message.\n" +
      "Thank you for your time.",
    variables: TWO_VARS,
  },
  {
    id: "final_profile_follow_up_v1",
    metaName: "final_profile_follow_up_v1",
    name: "Final profile follow-up",
    slot: "no_reply_2",
    language: "en",
    isDefault: true,
    body:
      "Hi {{1}},\n" +
      "This is the final follow-up regarding the profile review for the {{2}} requirement.\n" +
      "If you would like to receive additional information or continue with the recruitment process, please reply to this message.\n" +
      "Thank you for your time and consideration.",
    variables: TWO_VARS,
  },
  {
    id: "profile_review_closure_v1",
    metaName: "profile_review_closure_v1",
    name: "Profile review closure",
    slot: "no_reply_2",
    language: "en",
    body:
      "Hi {{1}},\n" +
      "This is a final update regarding the profile review communication shared earlier for the {{2}} requirement.\n" +
      "We understand that you may not be available to continue the process at this time.\n" +
      "Should your availability or circumstances change, you may reply to this message to reconnect regarding your profile review.\n" +
      "Thank you for your time.",
    variables: TWO_VARS,
  },
];

const SLOT_EXTRA: Partial<Record<WhatsAppTemplateSlot, string[]>> = {
  no_reply_1: ["profile_review_reminder_v1"],
};

export const WHATSAPP_FREE_TEXT_TEMPLATE_ID = "free_text";

export function listWhatsAppTemplatesForSlot(
  slot: WhatsAppTemplateSlot
): WhatsAppApprovedTemplate[] {
  const extras = new Set(SLOT_EXTRA[slot] ?? []);
  return APPROVED_WHATSAPP_TEMPLATES.filter(
    (template) => template.slot === slot || extras.has(template.id)
  );
}

export function getWhatsAppTemplateById(
  id: string
): WhatsAppApprovedTemplate | null {
  return APPROVED_WHATSAPP_TEMPLATES.find((template) => template.id === id) ?? null;
}

export function getDefaultWhatsAppTemplate(
  slot: WhatsAppTemplateSlot
): WhatsAppApprovedTemplate | null {
  const inSlot = listWhatsAppTemplatesForSlot(slot);
  return inSlot.find((template) => template.isDefault) ?? inSlot[0] ?? null;
}

/** Infer cold-outbound slot from WhatsApp step position among WhatsApp message steps. */
export function whatsappSlotForMessageIndex(
  indexAmongWhatsAppSteps: number
): WhatsAppTemplateSlot | null {
  if (indexAmongWhatsAppSteps === 0) return "opening";
  if (indexAmongWhatsAppSteps === 1) return "no_reply_1";
  if (indexAmongWhatsAppSteps === 2) return "no_reply_2";
  return null;
}

export function slotForWhatsAppTemplateId(
  templateId: string | null | undefined
): WhatsAppTemplateSlot | null {
  if (!templateId) return null;
  const template = getWhatsAppTemplateById(templateId);
  return template?.slot ?? null;
}

export function isApprovedWhatsAppTemplateId(
  templateId: string | null | undefined
): boolean {
  return Boolean(templateId && getWhatsAppTemplateById(templateId));
}
