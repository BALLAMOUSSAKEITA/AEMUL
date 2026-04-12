"use client";

import { useEffect, useState } from "react";
import { api, AccessCodeItem, AccessCodePayload } from "@/lib/api";
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
import {
  KeyRound,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Pencil,
  Trash2,
  Check,
  Search,
} from "lucide-react";

// ── Icônes de plateformes ────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "from-pink-500 to-purple-600",
  facebook: "from-blue-600 to-blue-800",
  canva: "from-sky-400 to-cyan-600",
  twitter: "from-sky-400 to-blue-500",
  x: "from-gray-700 to-gray-900",
  youtube: "from-red-500 to-red-700",
  linkedin: "from-blue-700 to-blue-900",
  tiktok: "from-black to-gray-800",
  snapchat: "from-yellow-300 to-yellow-500",
  discord: "from-indigo-500 to-indigo-700",
  whatsapp: "from-green-500 to-green-700",
  gmail: "from-red-400 to-orange-500",
  google: "from-blue-400 to-red-400",
  default: "from-emerald-600 to-teal-700",
};

function getPlatformGradient(name: string): string {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return PLATFORM_COLORS.default;
}

function PlatformAvatar({ name }: { name: string }) {
  const gradient = getPlatformGradient(name);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <div
      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}
    >
      {initials}
    </div>
  );
}

// ── Bouton copier ────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copier"
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ── Formulaire ───────────────────────────────────────────────────────────────

const EMPTY_FORM: AccessCodePayload & { id?: string } = {
  platform_name: "",
  identifier: "",
  password: "",
  notes: "",
};

const PLATFORM_SUGGESTIONS = [
  "Instagram",
  "Facebook",
  "Canva",
  "Twitter / X",
  "YouTube",
  "LinkedIn",
  "TikTok",
  "Snapchat",
  "Discord",
  "WhatsApp",
  "Gmail",
  "Google",
];

// ── Page principale ──────────────────────────────────────────────────────────

export default function AccesPage() {
  const [codes, setCodes] = useState<AccessCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Dialog états
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Visibilité des mots de passe par carte
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AccessCodeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Chargement ──
  async function load() {
    try {
      const data = await api.listAccessCodes();
      setCodes(data);
    } catch {
      setError("Impossible de charger les codes d'accès.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ── Filtrage ──
  const filtered = codes.filter((c) =>
    c.platform_name.toLowerCase().includes(search.toLowerCase()) ||
    c.identifier.toLowerCase().includes(search.toLowerCase())
  );

  // ── Visibilité mot de passe ──
  function togglePassword(id: string) {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Ouvrir dialog (ajout) ──
  function openAdd() {
    setForm(EMPTY_FORM);
    setShowFormPassword(false);
    setFormError("");
    setDialogOpen(true);
  }

  // ── Ouvrir dialog (édition) ──
  function openEdit(item: AccessCodeItem) {
    setForm({
      id: item.id,
      platform_name: item.platform_name,
      identifier: item.identifier,
      password: item.password,
      notes: item.notes ?? "",
    });
    setShowFormPassword(false);
    setFormError("");
    setDialogOpen(true);
  }

  // ── Sauvegarder ──
  async function handleSave() {
    if (!form.platform_name.trim() || !form.identifier.trim() || !form.password.trim()) {
      setFormError("Plateforme, identifiant et mot de passe sont requis.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload: AccessCodePayload = {
        platform_name: form.platform_name.trim(),
        identifier: form.identifier.trim(),
        password: form.password,
        notes: form.notes?.trim() || null,
      };

      if (form.id) {
        const updated = await api.updateAccessCode(form.id, payload);
        setCodes((prev) => prev.map((c) => (c.id === form.id ? updated : c)));
      } else {
        const created = await api.createAccessCode(payload);
        setCodes((prev) => [...prev, created].sort((a, b) => a.platform_name.localeCompare(b.platform_name)));
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  // ── Supprimer ──
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteAccessCode(deleteTarget.id);
      setCodes((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // keep dialog open on error
    } finally {
      setDeleting(false);
    }
  }

  // ── Rendu ──
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-[#14532d]" />
            Codes d&apos;accès
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comptes des plateformes de l&apos;association (données chiffrées)
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-[#14532d] hover:bg-[#166534] text-white gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter une plateforme
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une plateforme…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[140px] rounded-2xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">
            {search ? "Aucun résultat" : "Aucun code d'accès enregistré"}
          </p>
          {!search && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              Cliquez sur « Ajouter une plateforme » pour commencer.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const visible = visiblePasswords.has(item.id);
            return (
              <div
                key={item.id}
                className="group relative bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                {/* Entête de la carte */}
                <div className="flex items-center gap-3">
                  <PlatformAvatar name={item.platform_name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.platform_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Ajouté le{" "}
                      {new Date(item.created_at).toLocaleDateString("fr-CA", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Identifiant */}
                <div className="rounded-xl bg-muted/40 px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Identifiant
                    </p>
                    <p className="text-sm font-mono truncate">{item.identifier}</p>
                  </div>
                  <CopyButton value={item.identifier} />
                </div>

                {/* Mot de passe */}
                <div className="rounded-xl bg-muted/40 px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Mot de passe
                    </p>
                    <p className="text-sm font-mono truncate">
                      {visible ? item.password : "••••••••••••"}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => togglePassword(item.id)}
                      title={visible ? "Masquer" : "Afficher"}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      {visible ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <CopyButton value={item.password} />
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-xl px-3 py-2 line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialog Ajout / Édition ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#14532d]" />
              {form.id ? "Modifier le code d'accès" : "Ajouter une plateforme"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Plateforme */}
            <div className="space-y-1.5">
              <Label>Plateforme *</Label>
              <Input
                list="platform-suggestions"
                placeholder="ex : Instagram, Canva…"
                value={form.platform_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, platform_name: e.target.value }))
                }
              />
              <datalist id="platform-suggestions">
                {PLATFORM_SUGGESTIONS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            {/* Identifiant */}
            <div className="space-y-1.5">
              <Label>Identifiant / E-mail *</Label>
              <Input
                placeholder="nom d'utilisateur ou courriel"
                value={form.identifier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, identifier: e.target.value }))
                }
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <Label>Mot de passe *</Label>
              <div className="relative">
                <Input
                  type={showFormPassword ? "text" : "password"}
                  placeholder="mot de passe"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showFormPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>
                Notes{" "}
                <span className="text-muted-foreground font-normal">(optionnel)</span>
              </Label>
              <Input
                placeholder="ex : compte principal, accès limité…"
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>

            {formError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#14532d] hover:bg-[#166534] text-white"
            >
              {saving ? "Enregistrement…" : form.id ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Alert suppression ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce code d&apos;accès ?</AlertDialogTitle>
            <AlertDialogDescription>
              La plateforme{" "}
              <span className="font-semibold">{deleteTarget?.platform_name}</span> sera
              définitivement supprimée. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
