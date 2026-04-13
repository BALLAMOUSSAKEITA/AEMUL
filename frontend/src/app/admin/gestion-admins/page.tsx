"use client";

import { useEffect, useState } from "react";
import { api, AdminInfo, AdminManagePayload, AdminManageUpdate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldOff,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  User,
  Search,
} from "lucide-react";

// ── Onglets disponibles ────────────────────────────────────────────────────
const AVAILABLE_TABS = [
  { key: "dashboard",           label: "Dashboard" },
  { key: "membres",             label: "Membres" },
  { key: "evenements",          label: "Événements" },
  { key: "idees",               label: "Idées" },
  { key: "acces",               label: "Codes d'accès" },
  { key: "base-connaissances",  label: "Base de connaissances" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function PermissionBadges({ permissions }: { permissions: string[] | null }) {
  if (permissions === null)
    return <span className="text-xs text-emerald-600 font-semibold">Accès complet</span>;
  if (permissions.length === 0)
    return <span className="text-xs text-muted-foreground">Aucun accès</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {permissions.map((p) => {
        const tab = AVAILABLE_TABS.find((t) => t.key === p);
        return (
          <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0.5">
            {tab?.label ?? p}
          </Badge>
        );
      })}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export default function GestionAdminsPage() {
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [me, setMe] = useState<AdminInfo | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInfo | null>(null);

  // Formulaire création
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>(["dashboard"]);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Formulaire édition
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [editPerms, setEditPerms] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([api.getMe(), api.listAdmins()])
      .then(([meData, adminsData]) => {
        setMe(meData);
        setAdmins(adminsData);
      })
      .finally(() => setLoading(false));
  }, []);

  function togglePerm(key: string, perms: string[], setPerms: (p: string[]) => void) {
    setPerms(perms.includes(key) ? perms.filter((p) => p !== key) : [...perms, key]);
  }

  // ── Création ──────────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!newEmail || !newPassword || !newName) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await api.createAdmin({
        email: newEmail,
        password: newPassword,
        full_name: newName,
        permissions: newPerms,
      } as AdminManagePayload);
      setAdmins((prev) => [...prev, created]);
      setCreateOpen(false);
      setNewEmail(""); setNewPassword(""); setNewName("");
      setNewPerms(["dashboard"]);
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail;
      setError(msg ?? "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  }

  // ── Édition ───────────────────────────────────────────────────────────────
  function openEdit(admin: AdminInfo) {
    setEditTarget(admin);
    setEditName(admin.full_name);
    setEditPassword("");
    setEditPerms(admin.permissions ?? []);
    setShowEditPwd(false);
    setError("");
  }

  async function handleUpdate() {
    if (!editTarget) return;
    setSaving(true);
    setError("");
    const payload: AdminManageUpdate = { full_name: editName };
    if (editPassword) payload.password = editPassword;
    if (!editTarget.is_superadmin) payload.permissions = editPerms;
    try {
      const updated = await api.updateAdmin(editTarget.id, payload);
      setAdmins((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditTarget(null);
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail;
      setError(msg ?? "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  }

  // ── Suppression ───────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    await api.deleteAdmin(deleteTarget.id);
    setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const filtered = admins.filter(
    (a) =>
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-muted-foreground text-sm p-6">Chargement…</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#14532d]" />
            Gestion des administrateurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Créez des comptes admin et définissez leurs accès au dashboard.
          </p>
        </div>
        <Button
          onClick={() => { setCreateOpen(true); setError(""); }}
          className="bg-[#14532d] hover:bg-[#14532d]/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvel admin
        </Button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un admin…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Aucun administrateur trouvé.
          </p>
        )}
        {filtered.map((admin) => (
          <div
            key={admin.id}
            className="bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                admin.is_superadmin ? "bg-[#c9952b]" : "bg-[#14532d]"
              }`}
            >
              {admin.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-semibold text-sm">{admin.full_name}</span>
                {admin.is_superadmin && (
                  <Badge className="bg-[#c9952b]/15 text-[#c9952b] border-[#c9952b]/30 text-[10px] px-1.5">
                    Superadmin
                  </Badge>
                )}
                {admin.id === me?.id && (
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    Vous
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{admin.email}</p>
              <div className="mt-2">
                <PermissionBadges permissions={admin.is_superadmin ? null : admin.permissions} />
              </div>
            </div>

            {/* Actions */}
            {!admin.is_superadmin && (
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(admin)}
                  className="gap-1.5 h-8"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(admin)}
                  className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Dialog Création ─────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); setError(""); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Créer un administrateur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
            <div className="grid gap-1.5">
              <Label>Nom complet</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex : Fatima Dubois" />
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@aemul.com" />
            </div>
            <div className="grid gap-1.5">
              <Label>Mot de passe</Label>
              <div className="relative">
                <Input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mot de passe sécurisé"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Onglets accessibles</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_TABS.map((tab) => (
                  <label
                    key={tab.key}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors text-sm ${
                      newPerms.includes(tab.key)
                        ? "bg-[#14532d]/10 border-[#14532d]/40 text-[#14532d] font-medium"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-[#14532d]"
                      checked={newPerms.includes(tab.key)}
                      onChange={() => togglePerm(tab.key, newPerms, setNewPerms)}
                    />
                    {tab.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-[#14532d] hover:bg-[#14532d]/90"
            >
              {saving ? "Création…" : "Créer l'admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Édition ──────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" /> Modifier {editTarget?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
            <div className="grid gap-1.5">
              <Label>Nom complet</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Nouveau mot de passe <span className="text-muted-foreground text-xs">(laisser vide pour ne pas changer)</span></Label>
              <div className="relative">
                <Input
                  type={showEditPwd ? "text" : "password"}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEditPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {!editTarget?.is_superadmin && (
              <div className="grid gap-2">
                <Label>Onglets accessibles</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TABS.map((tab) => (
                    <label
                      key={tab.key}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors text-sm ${
                        editPerms.includes(tab.key)
                          ? "bg-[#14532d]/10 border-[#14532d]/40 text-[#14532d] font-medium"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-[#14532d]"
                        checked={editPerms.includes(tab.key)}
                        onChange={() => togglePerm(tab.key, editPerms, setEditPerms)}
                      />
                      {tab.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {editTarget?.is_superadmin && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Ce compte superadmin a accès à tout le dashboard.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Annuler</Button>
            <Button
              onClick={handleUpdate}
              disabled={saving}
              className="bg-[#14532d] hover:bg-[#14532d]/90"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Alert suppression ───────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deleteTarget?.full_name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce compte admin sera définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
