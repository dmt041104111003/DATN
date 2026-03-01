import type { Metadata } from 'next';
import { AdminLanguageProvider } from './context/AdminLanguageContext';

export const metadata: Metadata = {
  title: 'Admin',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLanguageProvider>{children}</AdminLanguageProvider>;
}
