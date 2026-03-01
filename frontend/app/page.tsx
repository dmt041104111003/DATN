import { redirect } from 'next/navigation';
import { verifyAdmin } from './admin/lib/auth';
import AdminLoginForm from './admin/components/AdminLoginForm';

export default async function HomePage() {
  const ok = await verifyAdmin();
  if (ok) {
    redirect('/admin');
  }
  return <AdminLoginForm />;
}
