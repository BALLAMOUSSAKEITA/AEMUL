"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, AdminInfo } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Lightbulb,
  LogOut,
  Menu,
  X,
  ChevronRight,
  KeyRound,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";

// Tous les onglets disponibles avec leur clé de permission
const ALL_NAV_ITEMS = [
  { href: "/admin/dashboard",          label: "Dashboard",            icon: LayoutDashboard,  key: "dashboard" },
  { href: "/admin/membres",            label: "Membres",              icon: Users,            key: "membres" },
  { href: "/admin/evenements",         label: "Événements",           icon: CalendarDays,     key: "evenements" },
  { href: "/admin/idees",              label: "Idées",                icon: Lightbulb,        key: "idees" },
  { href: "/admin/acces",              label: "Codes d'accès",        icon: KeyRound,         key: "acces" },
  { href: "/admin/base-connaissances", label: "Base de connaissances",icon: BookOpen,         key: "base-connaissances" },
  { href: "/admin/gestion-admins",     label: "Gestion des admins",   icon: ShieldCheck,      key: "gestion-admins", superadminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<AdminInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecked(true);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    api
      .getMe()
      .then((data) => {
        setMe(data);
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  // Filtrer les onglets selon le rôle et les permissions
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.superadminOnly) return me?.is_superadmin === true;
    if (me?.is_superadmin) return true;
    if (me?.permissions === null) return true;
    return me?.permissions?.includes(item.key) ?? false;
  });

  if (!checked) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#14532d] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <Logo size={36} className="rounded-xl" />
              <div>
                <span className="font-bold text-white text-sm">AEMUL</span>
                <p className="text-[10px] text-white/50">Administration</p>
              </div>
            </Link>
            <button
              className="lg:hidden text-white/60 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-[#c9952b]" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {(me?.full_name ?? "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-white truncate">{me?.full_name}</p>
                  {me?.is_superadmin && (
                    <span className="text-[9px] bg-[#c9952b]/30 text-[#c9952b] px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      SUPER
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/40 truncate">{me?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b px-4 py-3 lg:hidden flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={24} className="rounded-md" />
            <span className="font-semibold text-sm">AEMUL Admin</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
