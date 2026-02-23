export function SectionBadge({ label }: { label: string }) {
  return (
    <p className="text-base font-bold tracking-wide text-black bg-[#fcfaf9] w-fit mx-auto rounded-md px-3 py-1.5">
      {label}
    </p>
  );
}
