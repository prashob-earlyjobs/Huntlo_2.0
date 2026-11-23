import { BPO_CUSTOMER_SUPPORT } from "@/lib/industries/bpoCustomerSupport";
import { ECOMMERCE_QUICK_COMMERCE } from "@/lib/industries/ecommerceQuickCommerce";
import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";
import { LOGISTICS_WAREHOUSING } from "@/lib/industries/logisticsWarehousing";
import { MANUFACTURING } from "@/lib/industries/manufacturing";
import { RETAIL_QSR } from "@/lib/industries/retailQsr";
import { STAFFING_RECRUITMENT } from "@/lib/industries/staffingRecruitment";

/** V2 industry landing pages — footer labels match PART 2 naming. */
export const INDUSTRY_LANDING_PAGES: readonly IndustryLandingConfig[] = [
  LOGISTICS_WAREHOUSING,
  ECOMMERCE_QUICK_COMMERCE,
  RETAIL_QSR,
  BPO_CUSTOMER_SUPPORT,
  MANUFACTURING,
  STAFFING_RECRUITMENT,
] as const;

export const INDUSTRY_FOOTER_LINKS = INDUSTRY_LANDING_PAGES.map((page) => ({
  label: page.footerName,
  href: page.path,
}));
