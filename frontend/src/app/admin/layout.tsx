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
  KeyRound,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const NAV_MAIN = [
  { href: "/admin/dashboard",          label: "Dashboard",             icon: LayoutDashboard, key: "dashboard" },
  { href: "/admin/membres",            label: "Membres",               icon: Users,           key: "membres" },
  { href: "/admin/evenements",         label: "Événements",            icon: CalendarDays,    key: "evenements" },
  { href: "/admin/idees",              label: "Idées",                 icon: Lightbulb,       key: "idees" },
];

const NAV_TOOLS = [
  { href: "/admin/acces",              label: "Codes d'accès",         icon: KeyRound,        key: "acces" },
  { href: "/admin/base-connaissances", label: "Base de connaissances", icon: BookOpen,        key: "base-connaissances" },
];

const NAV_ADMIN = [
  { href: "/admin/gestion-admins",     label: "Gestion des admins",    icon: ShieldCheck,     key: "gestion-admins", superadminOnly: true },
];

const ALL_NAV = [...NAV_MAIN, ...NAV_TOOLS, ...NAV_ADMIN];

function filterItems(items: typeof ALL_NAV, me: AdminInfo | null) {
  return items.filter((item) => {
    if ("superadminOnly" in item && item.superadminOnly) return me?.is_superadmin === true;
    if (me?.is_superadmin) return true;
    if (me?.permissions === null) return true;
    return me?.permissions?.includes(item.key) ?? false;
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function formatDate() {
  return new Date().toLocaleDateString("fr-CA", {
    weekday: "long", day: "numeric", month: "long",
  });
}

// ── Sidebar nav link ──────────────────────────────────────────────────────────
function NavLink({ item, active, onClick }: { item: typeof ALL_NAV[0]; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/12 text-white"
          : "text-white/55 hover:bg-white/8 hover:text-white/90"
      }`}
    >
      {active && (
        <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-full bg-[#c9952b]" />
      )}
      <item.icon className={`w-[17px] h-[17px] shrink-0 transition-colors ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight className="w-3 h-3 text-[#c9952b] shrink-0" />}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<AdminInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") { setChecked(true); return; }
    const token = localStorage.getItem("admin_token");
    if (!token) { router.replace("/admin/login"); return; }
    api.getMe().then((d) => { setMe(d); setChecked(true); }).catch(() => {
      localStorage.removeItem("admin_token");
      router.replace("/admin/login");
    });
  }, [pathname, router]);

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  const mainItems  = filterItems(NAV_MAIN,  me);
  const toolItems  = filterItems(NAV_TOOLS, me);
  const adminItems = filterItems(NAV_ADMIN, me);

  const currentPage = ALL_NAV.find((i) => i.href === pathname);

  const initials = (me?.full_name ?? "")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (!checked) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-[#f5f7f4]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "linear-gradient(160deg, #0d3318 0%, #14532d 50%, #0f3d1e 100%)" }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 geometric-pattern opacity-[0.04] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative">
              <Logo size={38} className="rounded-xl shadow-lg" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#14532d]" />
            </div>
            <div>
              <p className="font-bold text-white text-[13px] leading-tight">AEMUL</p>
              <p className="text-[10px] text-white/40 leading-tight">Administration</p>
            </div>
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {/* Main */}
          {mainItems.length > 0 && (
            <>
              <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                Navigation
              </p>
              {mainItems.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} onClick={() => setSidebarOpen(false)} />
              ))}
            </>
          )}

          {/* Tools */}
          {toolItems.length > 0 && (
            <>
              <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                Outils
              </p>
              {toolItems.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} onClick={() => setSidebarOpen(false)} />
              ))}
            </>
          )}

          {/* Admin (superadmin only) */}
          {adminItems.length > 0 && (
            <>
              <div className="mx-3 my-3 h-px bg-white/10" />
              {adminItems.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} onClick={() => setSidebarOpen(false)} />
              ))}
            </>
          )}
        </nav>

        {/* User card */}
        <div className="relative px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/8 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9952b]/80 to-[#c9952b]/40 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              {initials || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[12px] font-semibold text-white truncate leading-tight">
                  {me?.full_name ?? "Admin"}
                </p>
                {me?.is_superadmin && (
                  <span className="shrink-0 text-[8px] font-bold bg-[#c9952b]/25 text-[#e6b94d] px-1.5 py-0.5 rounded-full border border-[#c9952b]/30">
                    SUPER
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/35 truncate leading-tight">{me?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="shrink-0 text-white/30 hover:text-white hover:bg-white/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Desktop topbar */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between bg-white/80 backdrop-blur-md border-b border-border/60 px-8 h-14 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground/60">Admin</span>
            {currentPage && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <currentPage.icon className="w-3.5 h-3.5 text-primary" />
                  {currentPage.label}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground capitalize">{formatDate()}</span>
            <div className="h-4 w-px bg-border" />
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[11px] font-bold text-primary">
                {initials || "?"}
              </div>
              <span className="text-sm font-medium">{me?.full_name?.split(" ")[0]}</span>
            </div>
          </div>
        </header>

        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border/60 px-4 py-3 lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Logo size={22} className="rounded-md" />
              <span className="font-semibold text-sm">AEMUL Admin</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[11px] font-bold text-primary">
            {initials || "?"}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Greeting banner (desktop) */}
          {pathname === "/admin/dashboard" && me && (
            <div className="hidden lg:flex items-center justify-between mb-6 bg-gradient-to-r from-[#14532d] to-[#1b6b3a] text-white rounded-2xl px-7 py-4 shadow-sm shadow-primary/20">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-0.5">
                  {formatDate()}
                </p>
                <h2 className="text-lg font-bold">
                  {getGreeting()}, {me.full_name.split(" ")[0]} 👋
                </h2>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/50 text-xs">Tableau de bord</p>
                <p className="text-white/80 text-sm font-medium">AEMUL Administration</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
