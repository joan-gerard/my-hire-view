import { AUTH_SUBMIT_CLASS } from '@/components/auth/auth-form-styles';

type AuthSubmitButtonProps = {
  loading: boolean;
  idleLabel: string;
  loadingLabel: string;
};

export default function AuthSubmitButton({
  loading,
  idleLabel,
  loadingLabel,
}: AuthSubmitButtonProps) {
  return (
    <button type="submit" disabled={loading} className={AUTH_SUBMIT_CLASS}>
      {loading ? loadingLabel : idleLabel}
    </button>
  );
}
