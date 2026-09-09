type AuthAlertProps = {
  message: string;
};

export function AuthErrorAlert({ message }: AuthAlertProps) {
  return (
    <div className="rounded-md bg-red-50 p-4" role="alert">
      <div className="text-sm text-red-800">{message}</div>
    </div>
  );
}

export function AuthNoticeAlert({ message }: AuthAlertProps) {
  return (
    <div className="rounded-md bg-[var(--brand-secondary)] p-4" role="status">
      <div className="text-sm text-[var(--foreground)]">{message}</div>
    </div>
  );
}
