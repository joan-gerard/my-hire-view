"use client";

import ApplicationFormStyleSwitch from "@/components/forms/ApplicationFormStyleSwitch";
import { useApplicationFormStyle } from "@/hooks/useApplicationFormStyle";

type ApplicationFormPageHeaderProps = {
  title: string;
};

/**
 * Create/edit page title with the optional F35 layout toggle on the same row.
 */
export default function ApplicationFormPageHeader({
  title,
}: ApplicationFormPageHeaderProps) {
  const { style, setStyle, switchEnabled } = useApplicationFormStyle();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
        {title}
      </h1>
      {switchEnabled ? (
        <ApplicationFormStyleSwitch
          style={style}
          onChange={(next) => {
            if (next === style) return;
            setStyle(next);
          }}
        />
      ) : null}
    </div>
  );
}
