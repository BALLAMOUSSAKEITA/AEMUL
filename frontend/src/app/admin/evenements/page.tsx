"use client";

import { useEffect, useState } from "react";
import { api, Event as AemulEvent, CreateEventPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  X,
  Edit3,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AdminEventsPage() {
  const { t } = useI18n();
  const [events, setEvents] = useState<AemulEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<CreateEventPayload>({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await api.listEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ title: "", description: "", date: "", location: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(evt: AemulEvent) {
    setForm({
      title: evt.title,
      description: evt.description || "",
      date: evt.date.slice(0, 16),
      location: evt.location || "",
    });
    setEditingId(evt.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setFormLoading(true);
    try {
      if (editingId) {
        await api.updateEvent(editingId, form);
      } else {
        await api.createEvent(form);
      }
      await loadEvents();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("admin.events.confirm_delete"))) return;
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">{t("admin.events.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t("admin.events.subtitle")}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("admin.events.new")}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">{editingId ? t("admin.events.edit") : t("admin.events.create")} {t("admin.events.event_suffix")}</h2>
            <button onClick={resetForm}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("admin.events.title_label")}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Iftar communautaire"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.events.desc_label")}</Label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t("admin.events.desc_placeholder")}
                rows={3}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("admin.events.date_label")}</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.events.location_label")}</Label>
                <Input
                  value={form.location || ""}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Pavillon Desjardins"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? t("admin.events.edit") : t("admin.events.publish")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-card rounded-2xl border p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <CalendarDays className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm text-muted-foreground">{t("admin.events.no_events")}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {t("admin.events.no_events_desc")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => {
            const eventDate = new Date(evt.date);
            const isPast = eventDate < new Date();
            return (
              <div
                key={evt.id}
                className={`bg-card rounded-2xl border p-5 flex items-start justify-between gap-4 ${
                  isPast ? "opacity-60" : ""
                }`}
              >
                <div className="flex gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary uppercase">
                      {eventDate.toLocaleDateString("fr-CA", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold text-primary leading-none">
                      {eventDate.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{evt.title}</h3>
                    {evt.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {evt.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>
                        {eventDate.toLocaleDateString("fr-CA")} à{" "}
                        {eventDate.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {evt.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(evt)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
