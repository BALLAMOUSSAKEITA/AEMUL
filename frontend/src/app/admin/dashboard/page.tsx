"use client";

import { useEffect, useState } from "react";
import { api, MemberStats, Member } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  CalendarPlus,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  description,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: "green" | "emerald" | "amber" | "blue";
  description?: string;
}) {
  const palettes = {
    green:   { bg: "bg-[#14532d]",        icon: "bg-white/15 text-white",     text: "text-white",     sub: "text-white/60", ring: "" },
    emerald: { bg: "bg-emerald-500",       icon: "bg-white/20 text-white",     text: "text-white",     sub: "text-white/60", ring: "" },
    amber:   { bg: "bg-[#c9952b]",         icon: "bg-white/20 text-white",     text: "text-white",     sub: "text-white/60", ring: "" },
    blue:    { bg: "bg-blue-600",          icon: "bg-white/20 text-white",     text: "text-white",     sub: "text-white/60", ring: "" },
  };
  const p = palettes[color];
  return (
    <div className={`${p.bg} rounded-2xl p-5 relative overflow-hidden shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      {/* Decorative circle */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -right-1 -bottom-6 w-16 h-16 rounded-full bg-white/5" />
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl ${p.icon} flex items-center justify-center mb-4`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className={`text-4xl font-bold ${p.text} mb-1 leading-none`}>{value}</p>
        <p className={`text-xs font-semibold ${p.text} opacity-90`}>{label}</p>
        {description && <p className={`text-[10px] ${p.sub} mt-0.5`}>{description}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [recent, setRecent] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.listMembers({ page: 1, per_page: 6 }),
    ])
      .then(([s, m]) => { setStats(s); setRecent(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page title (mobile — desktop greeting is in layout) */}
      <div className="lg:hidden">
        <h1 className="text-xl font-bold">{t("admin.dash.title")}</h1>
        <p className="text-muted-foreground text-xs mt-0.5">{t("admin.dash.overview")}</p>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t("admin.dash.total")}
            value={stats.total_members}
            icon={Users}
            color="green"
            description="Membres enregistrés"
          />
          <StatCard
            label={t("admin.dash.active")}
            value={stats.active_members}
            icon={Activity}
            color="emerald"
            description="Comptes actifs"
          />
          <StatCard
            label={t("admin.dash.pending")}
            value={stats.pending_approvals}
            icon={Clock}
            color="amber"
            description="En attente d'approbation"
          />
          <StatCard
            label={t("admin.dash.recent_30")}
            value={stats.recent_registrations}
            icon={CalendarPlus}
            color="blue"
            description="Ce dernier mois"
          />
        </div>
      ) : null}

      {/* ── Pending alert ─────────────────────────────────────────────────── */}
      {stats && stats.pending_approvals > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-amber-900">
                {stats.pending_approvals} inscription{stats.pending_approvals > 1 ? "s" : ""} en attente
              </p>
              <p className="text-xs text-amber-700/70">{t("admin.dash.awaiting")}</p>
            </div>
          </div>
          <Link
            href="/admin/membres"
            className="shrink-0 text-xs bg-amber-600 text-white px-3.5 py-2 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5"
          >
            {t("common.view")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── Quick stats row ───────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-border/60 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taux d'activation</p>
              <p className="text-lg font-bold">
                {stats.total_members > 0
                  ? Math.round((stats.active_members / stats.total_members) * 100)
                  : 0}%
              </p>
            </div>
          </div>
          <div className="bg-white border border-border/60 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Membres approuvés</p>
              <p className="text-lg font-bold">{stats.active_members}</p>
            </div>
          </div>
          <div className="bg-white border border-border/60 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nouveaux (30j)</p>
              <p className="text-lg font-bold">{stats.recent_registrations}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent members ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div>
            <h2 className="font-bold text-sm">{t("admin.dash.recent_title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t("admin.dash.recent_subtitle")}</p>
          </div>
          <Link
            href="/admin/membres"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors bg-primary/8 px-3 py-1.5 rounded-full"
          >
            {t("common.view_all")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">{t("admin.dash.no_members")}</p>
            <p className="text-muted-foreground/60 text-xs mt-1">{t("admin.dash.no_members_desc")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {recent.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background: idx % 4 === 0 ? "#14532d"
                        : idx % 4 === 1 ? "#1b6b3a"
                        : idx % 4 === 2 ? "#c9952b"
                        : "#2d8a4e",
                    }}
                  >
                    {m.first_name[0]}{m.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {m.first_name} {m.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.program} · <span className="font-mono text-[10px]">{m.member_number}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {!m.is_approved && (
                    <Badge variant="outline" className="text-[10px] border-amber-400/50 text-amber-600 bg-amber-50">
                      {t("common.pending")}
                    </Badge>
                  )}
                  <Badge
                    className={`text-[10px] ${m.is_active ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-muted text-muted-foreground"}`}
                    variant="outline"
                  >
                    {m.is_active ? t("common.active") : t("common.inactive")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                    {new Date(m.created_at).toLocaleDateString("fr-CA")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
