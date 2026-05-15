"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  BookOpen, Bell, Users, LogOut, X, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import { useState } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/tarefas", label: "Minhas Tarefas", icon: CheckSquare },
  { href: "/diario", label: "Diário de Obras", icon: BookOpen },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  userRole: string;
  notificacoesNaoLidas?: number;
}

function NavLink({
  href, label, icon: Icon, active, badge,
}: {
  href: string; label: string; icon: React.ElementType; active: boolean; badge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-[#1400FF] text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className={cn(
          "rounded-full px-1.5 py-0.5 text-xs font-bold",
          active ? "bg-white/30 text-white" : "bg-red-500 text-white"
        )}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({
  pathname, userName, userEmail, userAvatar, userRole, notificacoesNaoLidas, onClose,
}: SidebarProps & { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#1400FF] flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">MaisFlow</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4">
        {nav.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={href === "/" ? pathname === "/" : pathname.startsWith(href)}
            badge={label === "Notificações" ? notificacoesNaoLidas : undefined}
          />
        ))}

        {userRole === "ADMIN" && (
          <>
            <div className="my-3 border-t border-gray-100" />
            <NavLink
              href="/admin/usuarios"
              label="Usuários"
              icon={Users}
              active={pathname.startsWith("/admin")}
            />
          </>
        )}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar nome={userName} avatarUrl={userAvatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col bg-white border-r border-gray-200 h-screen sticky top-0">
        <SidebarContent {...props} pathname={pathname} />
      </aside>

      {/* Mobile trigger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 rounded-lg bg-white p-2 shadow-md border border-gray-200"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 bg-white h-full shadow-xl">
            <SidebarContent {...props} pathname={pathname} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
