import { redirect } from 'next/navigation';
import { verifyAdmin } from '../lib/auth';
import AdminLoginForm from '../components/AdminLoginForm';

export default async function AdminLoginPage() {
  const ok = await verifyAdmin();
  if (ok) redirect('/admin/products');
  return <AdminLoginForm />;
}
