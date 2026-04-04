"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Member } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { MemberCard } from "@/components/MemberCard";

export default function MembresPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listMembers({
        search: search || undefined,
        page,
        per_page: 20,
      });
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function toggleActive(member: Member) {
    try {
      await api.updateMember(member.id, { is_active: !member.is_active });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Membres</h1>
          <p className="text-muted-foreground">Gérer les membres de l&apos;association</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Liste des membres</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>No. membre</TableHead>
                  <TableHead>NI</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun membre trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {m.first_name[0]}
                            {m.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {m.first_name} {m.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{m.member_number}</TableCell>
                      <TableCell className="text-sm">{m.student_id}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{m.program}</TableCell>
                      <TableCell>
                        <Badge variant={m.is_active ? "default" : "secondary"}>
                          {m.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(m.created_at).toLocaleDateString("fr-CA")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMember(m)}
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(m)}
                            title={m.is_active ? "Désactiver" : "Activer"}
                          >
                            {m.is_active ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMember(m.id)}
                            title="Supprimer"
                          >
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
              <p className="text-center py-8 text-muted-foreground">Chargement...</p>
            ) : members.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucun membre trouvé.</p>
            ) : (
              members.map((m) => (
                <div key={m.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {m.first_name[0]}{m.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{m.first_name} {m.last_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{m.member_number}</p>
                      </div>
                    </div>
                    <Badge variant={m.is_active ? "default" : "secondary"} className="shrink-0">
                      {m.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMember(m)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(m)}>
                      {m.is_active ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMember(m.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={members.length < 20}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Member detail dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détail du membre</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">No. membre</p>
                  <p className="font-mono font-medium">{selectedMember.member_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedMember.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NI</p>
                  <p className="font-medium">{selectedMember.student_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Année</p>
                  <p className="font-medium">{selectedMember.study_year}e année</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Programme</p>
                  <p className="font-medium">{selectedMember.program}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Aperçu de la carte</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
