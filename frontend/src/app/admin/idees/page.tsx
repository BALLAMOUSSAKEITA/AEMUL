"use client";

import { useEffect, useState } from "react";
import { api, IdeaItem } from "@/lib/api";
import { Lightbulb, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AdminIdeasPage() {
  const { t } = useI18n();
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listIdeas().then(setIdeas).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-[#c9952b]" />
            {t("idea.admin_title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("idea.admin_subtitle")}</p>
        </div>
        {!loading && ideas.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-[#c9952b]/10 text-[#c9952b] rounded-full px-3.5 py-1.5 text-xs font-semibold shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
            {ideas.length} suggestion{ideas.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="bg-white border border-border/60 rounded-2xl p-14 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#c9952b]/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#c9952b]" />
          </div>
          <p className="font-semibold text-sm">{t("idea.empty")}</p>
          <p className="text-xs text-muted-foreground mt-1">Les suggestions des membres apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea, idx) => (
            <div
              key={idea.id}
              className="bg-white border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#c9952b]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-[#c9952b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed text-foreground">{idea.content}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-semibold text-muted-foreground/50 bg-muted px-2 py-0.5 rounded-full">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(idea.created_at).toLocaleDateString("fr-CA", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                      {" à "}
                      {new Date(idea.created_at).toLocaleTimeString("fr-CA", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
