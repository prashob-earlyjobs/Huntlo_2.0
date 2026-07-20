"use client";

import { OptionCardList } from "@/components/onboarding/OptionCardList";
import { COMPANY_TYPE_OPTIONS, type CompanyType } from "@/lib/onboarding";

export function CompanyTypeStep({
  value,
  onChange,
}: {
  value: CompanyType | null;
  onChange: (value: CompanyType) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Which best describes your organisation?
        </p>
      </div>
      <OptionCardList
        options={COMPANY_TYPE_OPTIONS}
        value={value}
        onChange={(next) => onChange(next as CompanyType)}
      />
    </div>
  );
}
