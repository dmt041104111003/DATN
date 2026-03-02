import { redirect } from 'next/navigation';
import { verifyAdmin } from '../lib/auth';

export default async function AdminLoginPage() {
  const ok = await verifyAdmin();
  if (ok) {
    redirect('/admin');
  }
  redirect('/');
}
