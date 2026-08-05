import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Login page. Uses server-side getUser() (not client getSession) to redirect
 * authenticated users — avoids /login ↔ /admin loops when cookies are stale.
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/admin');
  }

  return <LoginForm />;
}
