import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  EMPLOYEE_PULSE_SURVEYS,
  EMPLOYEE_PULSE_SURVEYS_CAPABILITY_STATUS,
  EMPLOYEE_PULSE_SURVEYS_SEO,
  employeePulseSurveysMetadata,
  employeePulseSurveysPageUrl,
} from "@/lib/agents/employeePulseSurveys";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = employeePulseSurveysMetadata();

export default function EmployeePulseSurveysPage() {
  const pageUrl = employeePulseSurveysPageUrl();
  const indexable = isIndexableCapability(
    EMPLOYEE_PULSE_SURVEYS_CAPABILITY_STATUS
  );
  const config = EMPLOYEE_PULSE_SURVEYS;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: EMPLOYEE_PULSE_SURVEYS_SEO.title,
              description: EMPLOYEE_PULSE_SURVEYS_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Employee Pulse Surveys",
              mainEntityName: "Huntlo Employee Pulse Surveys",
            }),
            breadcrumbJsonLd(
              config.breadcrumbs.map((item) => ({
                name: item.name,
                href: item.href,
              }))
            ),
            faqPageJsonLd([...config.faqs]),
          ]}
        />
      ) : null}
      <ScreeningWorkflowPage config={config} />
    </>
  );
}
