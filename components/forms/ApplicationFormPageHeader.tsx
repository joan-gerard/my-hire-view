type ApplicationFormPageHeaderProps = {
  title: string;
};

/** Create/edit page title. */
export default function ApplicationFormPageHeader({
  title,
}: ApplicationFormPageHeaderProps) {
  return (
    <h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
      {title}
    </h1>
  );
}
