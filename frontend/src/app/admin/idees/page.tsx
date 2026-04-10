"use client";

import { useEffect, useState } from "react";
import { api, IdeaItem } from "@/lib/api";
import { Lightbulb, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AdminIdeasPage() {
  const { t } = useI18n();
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listIdeas().then(setIdeas).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">{t("idea.admin_title")}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{t("idea.admin_subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="bg-card rounded-2xl border p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Lightbulb className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm text-muted-foreground">{t("idea.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-card rounded-2xl border p-5">
              <p className="text-sm leading-relaxed">{idea.content}</p>
              <p className="text-xs text-muted-foreground mt-3">
                {new Date(idea.created_at).toLocaleDateString("fr-CA")} à{" "}
                {new Date(idea.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
