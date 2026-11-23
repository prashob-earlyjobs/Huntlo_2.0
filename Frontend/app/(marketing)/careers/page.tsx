import { redirect } from "next/navigation";

const HUNTLO_CAREERS_URL = "https://www.linkedin.com/company/huntlo-ai";

export default function CareersPage() {
  redirect(HUNTLO_CAREERS_URL);
}
