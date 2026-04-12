"use client";

import { useEffect, useState } from "react";
import { api, KnowledgeEntryItem, KnowledgeEntryPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Tag,
  Filter,
} from "lucide-react";

// ── Constantes ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Présentation",
  "Contact",
  "Bureau",
  "Mission & valeurs",
  "Activités",
  "Adhésion",
  "FAQ",
  "Événements",
  "Autres",
];

const CATEGORY_COLORS: Record<string, string> = {
  Présentation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Contact: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Bureau: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Mission & valeurs": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Activités: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Adhésion: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  FAQ: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Événements: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  Autres: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Autres"];
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {category}
    </span>
  );
}

const EMPTY_FORM: KnowledgeEntryPayload & { id?: string } = {
  title: "",
  content: "",
  category: "Présentation",
  keywords: "",
  is_active: true,
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BaseConnaissancesPage() {
  const [entries, setEntries] = useState<KnowledgeEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Toutes");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeEntryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Chargement ──
  async function load() {
    try {
      const data = await api.listKb();
      setEntries(data);
    } catch {
      setError("Impossible de charger la base de connaissances.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ── Filtrage ──
  const filtered = entries.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      (e.keywords ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Toutes" || e.category === filterCat;
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && e.is_active) ||
      (filterActive === "inactive" && !e.is_active);
    return matchSearch && matchCat && matchActive;
  });

  // ── Grouper par catégorie ──
  const byCategory = filtered.reduce<Record<string, KnowledgeEntryItem[]>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});

  // ── Dialog ──
  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(item: KnowledgeEntryItem) {
    setForm({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      keywords: item.keywords ?? "",
      is_active: item.is_active,
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Le titre et le contenu sont obligatoires.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload: KnowledgeEntryPayload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        keywords: form.keywords?.trim() || null,
        is_active: form.is_active,
      };
      if (form.id) {
        const updated = await api.updateKbEntry(form.id, payload);
        setEntries((prev) => prev.map((e) => (e.id === form.id ? updated : e)));
      } else {
        const created = await api.createKbEntry(payload);
        setEntries((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: KnowledgeEntryItem) {
    try {
      const updated = await api.updateKbEntry(item.id, { is_active: !item.is_active });
      setEntries((prev) => prev.map((e) => (e.id === item.id ? updated : e)));
    } catch {
      /* ignore */
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteKbEntry(deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  }

  const activeCount = entries.filter((e) => e.is_active).length;

  // ── Rendu ──
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#14532d]" />
            Base de connaissances
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Alimentez le chatbot AEMUL —{" "}
            <span className="font-medium text-[#14532d]">{activeCount}</span> entrée
            {activeCount !== 1 ? "s" : ""} active{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-[#14532d] hover:bg-[#166534] text-white gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouvelle entrée
        </Button>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Toutes">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex rounded-xl border overflow-hidden text-sm">
            {(
              [
                { value: "all", label: "Tout" },
                { value: "active", label: "Actives" },
                { value: "inactive", label: "Inactives" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterActive(value)}
                className={`px-3 py-2 transition-colors ${
                  filterActive === value
                    ? "bg-[#14532d] text-white"
                    : "bg-background text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">
            {search ? "Aucun résultat" : "Aucune entrée dans la base"}
          </p>
          {!search && (
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Ajoutez des entrées pour alimenter le chatbot : présentation, contact, bureau, activités…
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <CategoryBadge category={cat} />
                <span className="text-xs text-muted-foreground">
                  {items.length} entrée{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const expanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`group bg-card border rounded-2xl overflow-hidden transition-all ${
                        !item.is_active ? "opacity-60" : ""
                      }`}
                    >
                      {/* Ligne principale */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            {!item.is_active && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          {item.keywords && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Tag className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                              <p className="text-xs text-muted-foreground/60 truncate">
                                {item.keywords}
                              </p>
                            </div>
                          )}
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleActive(item)}
                            title={item.is_active ? "Désactiver" : "Activer"}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          >
                            {item.is_active ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Contenu expandable */}
                      {expanded && (
                        <div className="px-4 pb-4 border-t bg-muted/20">
                          <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed pt-3">
                            {item.content}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tip ── */}
      {!loading && entries.length > 0 && (
        <div className="rounded-2xl bg-[#14532d]/5 border border-[#14532d]/15 px-4 py-3 text-sm text-[#14532d] dark:text-green-400">
          <strong>Astuce :</strong> Plus vos entrées sont précises et les mots-clés bien remplis, meilleures seront les réponses du chatbot.
        </div>
      )}

      {/* ── Dialog Ajout / Édition ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#14532d]" />
              {form.id ? "Modifier l'entrée" : "Nouvelle entrée"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Titre */}
            <div className="space-y-1.5">
              <Label>Titre *</Label>
              <Input
                placeholder="ex : Présentation de l'AEMUL, Contact, Président…"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Catégorie */}
            <div className="space-y-1.5">
              <Label>Catégorie *</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Contenu */}
            <div className="space-y-1.5">
              <Label>Contenu *</Label>
              <Textarea
                placeholder="Rédigez le contenu de cette entrée. Ce texte sera utilisé comme réponse du chatbot. Soyez précis et complet."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={6}
                className="rounded-xl resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {form.content.length} caractères
              </p>
            </div>

            {/* Mots-clés */}
            <div className="space-y-1.5">
              <Label>
                Mots-clés{" "}
                <span className="text-muted-foreground font-normal">(optionnel, séparés par des virgules)</span>
              </Label>
              <Input
                placeholder="ex : président, bureau, responsable, comité"
                value={form.keywords ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Les mots-clés améliorent la pertinence des réponses du chatbot.
              </p>
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.is_active}
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                  form.is_active ? "bg-[#14532d]" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.is_active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <Label className="cursor-pointer">
                {form.is_active ? "Entrée active (visible par le chatbot)" : "Entrée inactive (ignorée par le chatbot)"}
              </Label>
            </div>

            {formError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
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
            <AlertDialogTitle>Supprimer cette entrée ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;entrée{" "}
              <span className="font-semibold">« {deleteTarget?.title} »</span> sera
              définitivement supprimée de la base de connaissances.
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
