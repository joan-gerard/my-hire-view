"use client";

export type SlugNamePosition = "start" | "end" | null;

export interface NameInUrlFieldProps {
  value: SlugNamePosition;
  onChange: (value: SlugNamePosition) => void;
}

export default function NameInUrlField({
  value,
  onChange,
}: NameInUrlFieldProps) {
  return (
    <fieldset className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
      <legend className="px-1 text-base font-semibold text-gray-900">
        Name in URL
      </legend>
      <p className="mt-0.5 mb-3 text-sm text-gray-600">
        Choose where your name appears in the shareable link (if at all).
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === null}
            onChange={() => onChange(null)}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-base font-medium text-gray-900">None</span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === "start"}
            onChange={() => onChange("start")}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-base font-medium text-gray-900">At start</span>
          <span className="text-sm text-gray-500">
            (e.g. john-doe-company-role)
          </span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="slugNamePosition"
            checked={value === "end"}
            onChange={() => onChange("end")}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-base font-medium text-gray-900">At end</span>
          <span className="text-sm text-gray-500">
            (e.g. company-role-john-doe)
          </span>
        </label>
      </div>
    </fieldset>
  );
}
