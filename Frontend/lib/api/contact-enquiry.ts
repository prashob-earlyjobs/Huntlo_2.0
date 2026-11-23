import { apiClient } from "./client";

export const CONTACT_ENQUIRY_TYPES = [
  "General Enquiry",
  "Product Enquiry",
  "Demo Request",
  "Partnership",
  "Support",
] as const;

export type ContactEnquiryType = (typeof CONTACT_ENQUIRY_TYPES)[number];

export type ContactEnquiryPayload = {
  fullName: string;
  workEmail: string;
  companyName?: string;
  enquiryType: ContactEnquiryType;
  message: string;
  /** Honeypot — leave empty. */
  website?: string;
};

export type ContactEnquiryResponse = {
  id?: string;
  received: true;
  duplicate?: boolean;
};

export async function submitContactEnquiry(
  input: ContactEnquiryPayload
): Promise<ContactEnquiryResponse> {
  const result = await apiClient.post<ContactEnquiryResponse>(
    "/public/contact-enquiry",
    input,
    { retry: false }
  );
  return result.data;
}
