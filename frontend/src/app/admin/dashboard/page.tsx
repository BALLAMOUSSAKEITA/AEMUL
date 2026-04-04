"use client";

import { useEffect, useState } from "react";
import { api, MemberStats, Member } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  UserX,
  CalendarPlus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [recent, setRecent] = useState<Member[]>([]);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error);
    api
      .listMembers({ page: 1, per_page: 5 })
      .then(setRecent)
      .catch(console.error);
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total membres",
          value: stats.total_members,
          icon: Users,
          gradient: "from-primary/15 to-primary/5",
          iconBg: "bg-primary/15",
          iconColor: "text-primary",
        },
        {
          label: "Membres actifs",
          value: stats.active_members,
          icon: UserCheck,
          gradient: "from-emerald-500/15 to-emerald-500/5",
          iconBg: "bg-emerald-500/15",
          iconColor: "text-emerald-600",
        },
        {
          label: "Membres inactifs",
          value: stats.inactive_members,
          icon: UserX,
          gradient: "from-amber-500/15 to-amber-500/5",
          iconBg: "bg-amber-500/15",
          iconColor: "text-amber-600",
        },
        {
          label: "30 derniers jours",
          value: stats.recent_registrations,
          icon: CalendarPlus,
          gradient: "from-blue-500/15 to-blue-500/5",
          iconBg: "bg-blue-500/15",
          iconColor: "text-blue-600",
        },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Vue d&apos;ensemble de l&apos;association
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          En croissance
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.gradient} rounded-2xl border border-border/50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}
              >
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent members */}
      <div className="bg-card rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h2 className="font-bold text-base">Inscriptions recentes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Les 5 derniers membres inscrits
            </p>
          </div>
          <Link
            href="/admin/membres"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Voir tout
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5">
          {recent.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Aucun membre inscrit
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Les nouveaux membres apparaitront ici
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {m.first_name[0]}
                      {m.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {m.first_name} {m.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.program} &middot;{" "}
                        <span className="font-mono">{m.member_number}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={m.is_active ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {m.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {new Date(m.created_at).toLocaleDateString("fr-CA")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
