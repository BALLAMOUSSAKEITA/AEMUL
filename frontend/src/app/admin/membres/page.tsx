"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Member } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { MemberCard } from "@/components/MemberCard";

export default function MembresPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof api.listMembers>[0] = {
        search: search || undefined,
        page,
        per_page: 20,
      };
      if (filter === "pending") params.is_approved = false;
      if (filter === "approved") params.is_approved = true;
      const data = await api.listMembers(params);
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page, filter]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  async function toggleActive(member: Member) {
    try {
      await api.updateMember(member.id, { is_active: !member.is_active });
      loadMembers();
    } catch (err) {
      console.error(err);
    }
  }

  async function approveMember(id: string) {
    try {
      await api.approveMember(id);
      loadMembers();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteMember(id: string) {
    if (!confirm("Supprimer ce membre définitivement ?")) return;
    try {
      await api.deleteMember(id);
      loadMembers();
    } catch (err) {
      console.error(err);
    }
  }

  const EmptyState = () => (
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="font-medium text-muted-foreground">
        Aucun membre trouvé
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        {search
          ? "Essayez une autre recherche"
          : "Les membres inscrits apparaîtront ici"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Membres
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gérer les membres de l&apos;association
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all" as const, label: "Tous" },
          { key: "pending" as const, label: "En attente", icon: Clock },
          { key: "approved" as const, label: "Approuvés", icon: CheckCircle2 },
        ].map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className="gap-1.5 rounded-lg text-xs"
          >
            {f.icon && <f.icon className="w-3.5 h-3.5" />}
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Membre</TableHead>
                <TableHead className="font-semibold">No. membre</TableHead>
                <TableHead className="font-semibold">Programme</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}><EmptyState /></TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{m.first_name} {m.last_name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {m.member_number}
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate">{m.program}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={m.is_active ? "default" : "secondary"} className="text-[10px] w-fit">
                          {m.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        {!m.is_approved && (
                          <Badge variant="outline" className="text-[10px] w-fit border-amber-500/30 text-amber-600">
                            En attente
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("fr-CA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedMember(m)} className="h-8 w-8 p-0 rounded-lg" title="Voir">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!m.is_approved && (
                          <Button variant="ghost" size="sm" onClick={() => approveMember(m.id)} className="h-8 w-8 p-0 rounded-lg" title="Approuver">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(m)} className="h-8 w-8 p-0 rounded-lg" title={m.is_active ? "Désactiver" : "Activer"}>
                          {m.is_active ? (
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMember(m.id)} className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Chargement...
            </div>
          ) : members.length === 0 ? (
            <EmptyState />
          ) : (
            members.map((m) => (
              <div key={m.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                      {m.first_name[0]}{m.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{m.first_name} {m.last_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.member_number}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={m.is_active ? "default" : "secondary"} className="text-[10px]">
                      {m.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    {!m.is_approved && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">
                        En attente
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMember(m)} className="h-8 w-8 p-0 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {!m.is_approved && (
                    <Button variant="ghost" size="sm" onClick={() => approveMember(m.id)} className="h-8 w-8 p-0 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(m)} className="h-8 w-8 p-0 rounded-lg">
                    {m.is_active ? (
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMember(m.id)} className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t bg-muted/20">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1 rounded-lg">
            <ChevronLeft className="w-4 h-4" /> Précédent
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" disabled={members.length < 20} onClick={() => setPage((p) => p + 1)} className="gap-1 rounded-lg">
            Suivant <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Member detail dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[var(--font-heading)]">Détail du membre</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Nom complet</p>
                  <p className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">No. membre</p>
                  <p className="font-mono font-medium text-primary">{selectedMember.member_number}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                  <p className="font-medium truncate">{selectedMember.email}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Téléphone</p>
                  <p className="font-medium">{selectedMember.phone}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Statut</p>
                  <p className={`font-medium ${selectedMember.is_approved ? "text-emerald-600" : "text-amber-600"}`}>
                    {selectedMember.is_approved ? "Approuvé" : "En attente"}
                  </p>
                </div>
                <div className="col-span-2 bg-muted/30 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Programme</p>
                  <p className="font-medium">{selectedMember.program}</p>
                </div>
              </div>

              {!selectedMember.is_approved && (
                <Button onClick={() => { approveMember(selectedMember.id); setSelectedMember(null); }} className="w-full gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Approuver ce membre
                </Button>
              )}

              {selectedMember.is_approved && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Aperçu de la carte</p>
                  <MemberCard
                    member={{
                      id: selectedMember.id,
                      member_number: selectedMember.member_number,
                      first_name: selectedMember.first_name,
                      last_name: selectedMember.last_name,
                      program: selectedMember.program,
                      photo_base64: selectedMember.photo_base64,
                      created_at: selectedMember.created_at,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
