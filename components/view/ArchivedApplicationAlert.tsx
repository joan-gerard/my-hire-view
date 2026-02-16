export default function ArchivedApplicationAlert() {
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900"
      role="alert"
    >
      <p className="font-semibold">This application is no longer active</p>
      <p className="mt-1 text-sm">
        The candidate has archived this application. The CV and video pitch are
        no longer available.
      </p>
    </div>
  );
}
