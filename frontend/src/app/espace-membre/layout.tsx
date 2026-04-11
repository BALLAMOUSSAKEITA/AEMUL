"use client";

import { Suspense, useEffect, useState, createContext, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, Member } from "@/lib/api";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { InstallPrompt } from "@/components/InstallPrompt";
import { schedulePrayerNotifications, requestNotificationPermission } from "@/lib/notifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Home,
  User,
  CreditCard,
  Clock,
  CalendarDays,
  LogOut,
} from "lucide-react";

const MemberContext = createContext<Member | null>(null);
export function useMember() {
  return useContext(MemberContext);
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "accueil";
  const [member, setMember] = useState<Member | null>(null);
  const [checked, setChecked] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const NAV_ITEMS = [
    { key: "accueil", href: "/espace-membre", icon: Home, label: t("nav.home") },
    { key: "events", href: "/espace-membre?tab=events", icon: CalendarDays, label: t("nav.activities") },
    { key: "carte", href: "/espace-membre?tab=carte", icon: CreditCard, label: t("nav.card") },
    { key: "prieres", href: "/espace-membre?tab=prieres", icon: Clock, label: t("nav.prayers") },
    { key: "profil", href: "/espace-membre?tab=profil", icon: User, label: t("nav.profile") },
  ];

  useEffect(() => {
    const token = localStorage.getItem("member_token");
    if (!token) {
      router.replace("/connexion");
      return;
    }
    api
      .getMyProfile()
      .then((m) => {
        setMember(m);
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("member_token");
        router.replace("/connexion");
      });
  }, [router]);

  useEffect(() => {
    if (!checked) return;
    requestNotificationPermission();
    api.getPrayerTimes().then((res) => {
      const d = new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = res.times[key];
      if (entry) schedulePrayerNotifications(entry);
    }).catch(() => {});
  }, [checked]);

  function logout() {
    localStorage.removeItem("member_token");
    router.push("/connexion");
  }

  if (!checked) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <MemberContext.Provider value={member}>
      <div className="min-h-screen-safe bg-muted/30 flex flex-col">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b safe-top">
          <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
            <Link href="/espace-membre" className="flex items-center gap-2.5">
              <Logo size={30} className="rounded-lg" />
              <span className="font-bold text-sm hidden sm:inline">{t("nav.my_space")}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link key={item.key} href={item.href}>
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      activeTab === item.key
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </Link>
              ))}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">{t("nav.logout")}</span>
              </button>
            </nav>

            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="md:hidden flex items-center gap-1.5 text-xs text-muted-foreground active:text-foreground ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 pb-24 md:pb-6 max-w-5xl mx-auto w-full">
          {member && children}
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t safe-bottom">
          <div className="flex items-stretch">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors active:bg-muted/30 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                  <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <InstallPrompt />
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title={t("confirm.logout")}
        confirmLabel={t("confirm.yes")}
        cancelLabel={t("confirm.no")}
        onConfirm={logout}
      />
    </MemberContext.Provider>
  );
}

export default function EspaceMembreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen-safe flex items-center justify-center bg-background">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LayoutShell>{children}</LayoutShell>
    </Suspense>
  );
}
