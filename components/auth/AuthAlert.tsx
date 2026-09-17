type AuthAlertProps = {
  message: string;
};

export function AuthErrorAlert({ message }: AuthAlertProps) {
  return (
    <div
      className="rounded-xl border border-[var(--status-danger-fg)]/20 bg-[var(--status-danger-bg)] p-4"
      role="alert"
    >
      <div className="text-sm text-[var(--status-danger-fg)]">{message}</div>
    </div>
  );
}

export function AuthNoticeAlert({ message }: AuthAlertProps) {
  return (
    <div
      className="rounded-xl border border-[var(--brand-accent-1)]/25 bg-[var(--status-success-bg)] p-4"
      role="status"
    >
      <div className="text-sm text-[var(--status-success-fg)]">{message}</div>
    </div>
  );
}
