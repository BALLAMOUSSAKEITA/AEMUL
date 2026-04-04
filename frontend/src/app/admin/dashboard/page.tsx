"use client";

import { useEffect, useState } from "react";
import { api, MemberStats, Member } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, CalendarPlus } from "lucide-react";

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
          color: "text-primary",
        },
        {
          label: "Membres actifs",
          value: stats.active_members,
          icon: UserCheck,
          color: "text-green-600",
        },
        {
          label: "Membres inactifs",
          value: stats.inactive_members,
          icon: UserX,
          color: "text-orange-500",
        },
        {
          label: "30 derniers jours",
          value: stats.recent_registrations,
          icon: CalendarPlus,
          color: "text-blue-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de l&apos;association</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent members */}
      <Card>
        <CardHeader>
          <CardTitle>Inscriptions récentes</CardTitle>
          <CardDescription>Les 5 derniers membres inscrits</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Aucun membre inscrit pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {m.first_name[0]}
                      {m.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {m.first_name} {m.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.program}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={m.is_active ? "default" : "secondary"}>
                      {m.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("fr-CA")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
