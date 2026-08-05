import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignUpForm from '@/components/auth/SignUpForm';

/**
 * Sign-up page. Uses server-side getUser() (not client getSession) to redirect
 * authenticated users — avoids auth redirect loops when cookies are stale.
 */
export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/admin');
  }

  return <SignUpForm />;
}
