import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { getNotificacoesNaoLidas } from "@/lib/queries/notificacoes";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const naoLidas = await getNotificacoesNaoLidas(session.user.id);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
        userAvatar={session.user.avatarUrl}
        userRole={session.user.role ?? "MEMBER"}
        notificacoesNaoLidas={naoLidas}
      />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
