import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lab3 - Admin',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
