import { NewUserDialog, UserManager } from "@/components/admin/user-manager";
import { PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth";
import { getAdminUsers } from "@/lib/data/users";

export const metadata = { title: "Usuários" };

export default async function UsersPage() {
  const session = await requireAdmin();
  const users = await getAdminUsers();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Usuários"
        description="Quem pode entrar no painel. Crie um acesso para cada pessoa da equipe — assim o histórico de alterações mostra quem fez o quê."
      >
        <NewUserDialog />
      </PageHeader>

      <UserManager users={users} currentUserId={session.userId} />
    </div>
  );
}
