import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { PageHeader } from "@/components/ui/misc";
import { requireSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { prisma, safeQuery } from "@/lib/prisma";

export const metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const session = await requireSession();
  const user = await safeQuery(
    () => prisma.user.findUnique({ where: { id: session.userId } }),
    null,
  );

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Minha conta"
        description="Seus dados de acesso ao painel."
      />

      <div className="admin-card space-y-2 p-4">
        <p className="text-sm">
          <span className="text-subtle-foreground">Nome: </span>
          <strong>{session.name}</strong>
        </p>
        <p className="text-sm">
          <span className="text-subtle-foreground">E-mail: </span>
          <strong>{session.email}</strong>
        </p>
        <p className="text-sm">
          <span className="text-subtle-foreground">Tipo de acesso: </span>
          <strong>{session.role === "ADMIN" ? "Administrador" : "Editor"}</strong>
        </p>
        {user?.lastLoginAt ? (
          <p className="admin-hint">
            Último acesso em {formatDateTime(user.lastLoginAt)}
          </p>
        ) : null}
      </div>

      <ChangePasswordForm />
    </div>
  );
}
