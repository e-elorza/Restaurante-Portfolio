import { AdminShell } from "@/components/admin/shell";
import { requireSession } from "@/lib/auth";
import { logoutAction } from "@/server/actions/auth";

export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <AdminShell userName={session.name} logout={logoutAction}>
      {children}
    </AdminShell>
  );
}
