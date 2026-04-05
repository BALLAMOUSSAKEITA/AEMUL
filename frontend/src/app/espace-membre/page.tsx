"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, Member, MemberCardData, Event as AemulEvent } from "@/lib/api";
import { MemberCard } from "@/components/MemberCard";
import { PrayerTimes } from "@/components/PrayerTimes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  User,
  Lock,
  Loader2,
  Shield,
  Clock,
  Save,
  Sunrise,
  Eye,
  ShieldCheck,
  CalendarDays,
  MapPin,
} from "lucide-react";

const CARD_DISPLAY_DURATION = 30;

function EspaceMembreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "accueil";

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    program: "",
    study_level: "baccalaureat",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [events, setEvents] = useState<AemulEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [card, setCard] = useState<MemberCardData | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardCountdown, setCardCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMember = useCallback(async () => {
    try {
      const m = await api.getMyProfile();
      setMember(m);
      setProfileForm({
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
        program: m.program,
        study_level: m.study_level,
      });
      if (m.must_change_password) setShowPasswordModal(true);
    } catch {
      localStorage.removeItem("member_token");
      router.replace("/connexion");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadMember();
    setEventsLoading(true);
    api.listEvents(true).then(setEvents).catch(() => {}).finally(() => setEventsLoading(false));
  }, [loadMember]);

  function startCardCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCardCountdown(CARD_DISPLAY_DURATION);
    countdownRef.current = setInterval(() => {
      setCardCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCard(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPassword.length < 6) {
      setPwError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Les mots de passe ne correspondent pas.");
      return;
    }
    setPwLoading(true);
    try {
      await api.changePassword(newPassword);
      setShowPasswordModal(false);
      setMember((prev) => prev ? { ...prev, must_change_password: false } : prev);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const updated = await api.updateProfile(profileForm);
      setMember(updated);
      setProfileMsg("Profil mis à jour !");
    } catch (err: unknown) {
      setProfileMsg(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function loadCard() {
    setCardLoading(true);
    setCardError(null);
    try {
      const c = await api.getMyCard();
      setCard(c);
      startCardCountdown();
    } catch (err: unknown) {
      setCardError(err instanceof Error ? err.message : "Impossible de charger la carte.");
    } finally {
      setCardLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) return null;

  return (
    <>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-card rounded-t-3xl sm:rounded-2xl border shadow-2xl p-6 sm:p-8 w-full sm:max-w-sm space-y-5 safe-bottom">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">
                Changez votre mot de passe
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pour votre sécurité, choisissez un nouveau mot de passe.
              </p>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {pwError && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3 text-sm">
                  {pwError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 text-base rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 text-base rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full min-h-[48px] gap-2 rounded-xl text-base" disabled={pwLoading}>
                {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tab === "accueil" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-5 text-primary-foreground">
              <h1 className="text-xl font-bold font-[var(--font-heading)]">
                Salam, {member.first_name} !
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                Membre #{member.member_number}
              </p>

              <div className="mt-4 flex gap-2">
                <div className={`flex-1 rounded-xl px-3 py-2.5 ${member.is_approved ? "bg-white/15" : "bg-amber-500/30"}`}>
                  <div className="flex items-center gap-1.5">
                    {member.is_approved ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px] font-semibold">
                      {member.is_approved ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2.5 bg-white/15">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">
                      {member.is_approved ? "Carte dispo" : "Non dispo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!member.is_approved && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-amber-800">En attente d&apos;approbation</p>
                  <p className="text-xs text-amber-700/70 mt-0.5">
                    Un administrateur doit valider votre inscription pour accéder à votre carte.
                  </p>
                </div>
              </div>
            )}

            <PrayerTimes compact />

            <div className="grid grid-cols-2 gap-3">
              <a href="/espace-membre?tab=profil" className="bg-card rounded-2xl border p-4 flex flex-col items-center gap-2 active:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium">Mon profil</span>
              </a>
              <a href="/espace-membre?tab=carte" className="bg-card rounded-2xl border p-4 flex flex-col items-center gap-2 active:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <span className="text-xs font-medium">Ma carte</span>
              </a>
            </div>
          </div>
        )}

        {tab === "profil" && (
          <div className="bg-card rounded-2xl border p-5">
            <h2 className="text-lg font-bold font-[var(--font-heading)] mb-5">Mon profil</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Prénom</Label>
                  <Input
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="h-12 text-base rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom</Label>
                  <Input
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="h-12 text-base rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={member.email} disabled className="h-12 text-base rounded-xl opacity-60" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-12 text-base rounded-xl"
                  type="tel"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Programme</Label>
                <Input
                  value={profileForm.program}
                  onChange={(e) => setProfileForm((f) => ({ ...f, program: e.target.value }))}
                  className="h-12 text-base rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Niveau d&apos;études</Label>
                <Select
                  value={profileForm.study_level}
                  onValueChange={(v) => setProfileForm((f) => ({ ...f, study_level: v ?? f.study_level }))}
                >
                  <SelectTrigger className="h-12 text-base rounded-xl">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baccalaureat">Baccalauréat</SelectItem>
                    <SelectItem value="maitrise">Maîtrise</SelectItem>
                    <SelectItem value="doctorat">Doctorat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profileMsg && (
                <p className={`text-sm font-medium ${profileMsg.includes("mis à jour") ? "text-emerald-600" : "text-destructive"}`}>
                  {profileMsg}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" className="min-h-[48px] gap-2 rounded-xl flex-1" disabled={profileLoading}>
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPasswordModal(true)} className="min-h-[48px] gap-2 rounded-xl flex-1">
                  <Lock className="w-4 h-4" />
                  Changer mot de passe
                </Button>
              </div>
            </form>
          </div>
        )}

        {tab === "carte" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border p-5">
              <h2 className="text-lg font-bold font-[var(--font-heading)] mb-1">Ma carte</h2>
              <p className="text-sm text-muted-foreground mb-5">
                {member.is_approved
                  ? "Votre carte de membre AEMUL."
                  : "Disponible après approbation."}
              </p>

              {!member.is_approved ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm text-muted-foreground">En attente</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Un administrateur doit valider votre inscription.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cardLoading && !card && (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}

                  {cardError && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3 text-sm">
                      {cardError}
                    </div>
                  )}

                  {card && cardCountdown > 0 && (
                    <>
                      <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">
                            Masquage auto pour votre sécurité
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center relative"
                          >
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle
                                cx="18" cy="18" r="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-amber-500/20"
                              />
                              <circle
                                cx="18" cy="18" r="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${(cardCountdown / CARD_DISPLAY_DURATION) * 100.53} 100.53`}
                                strokeLinecap="round"
                                className="text-amber-500 transition-all duration-1000 ease-linear"
                              />
                            </svg>
                            <span className="text-[10px] font-bold font-mono text-amber-600 tabular-nums">
                              {cardCountdown}
                            </span>
                          </div>
                        </div>
                      </div>
                      <MemberCard member={card} />
                    </>
                  )}

                  {!card && !cardLoading && (
                    <div className="space-y-4">
                      <div className="py-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-medium text-sm">Afficher ma carte</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                          Par mesure de sécurité, votre carte sera visible pendant {CARD_DISPLAY_DURATION} secondes.
                        </p>
                      </div>
                      <Button onClick={loadCard} className="w-full min-h-[48px] gap-2 rounded-xl text-base">
                        <CreditCard className="w-4 h-4" />
                        Afficher ma carte
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-[var(--font-heading)]">Événements à venir</h2>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="bg-card rounded-2xl border p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <CalendarDays className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm text-muted-foreground">Aucun événement prévu</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Revenez bientôt pour découvrir nos prochaines activités.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => {
                  const d = new Date(evt.date);
                  return (
                    <div key={evt.id} className="bg-card rounded-2xl border overflow-hidden">
                      <div className="flex gap-4 p-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center shrink-0 text-primary-foreground">
                          <span className="text-[10px] font-bold uppercase">
                            {d.toLocaleDateString("fr-CA", { month: "short" })}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {d.getDate()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm">{evt.title}</h3>
                          {evt.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{evt.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "prieres" && (
          <PrayerTimes />
        )}
      </div>
    </>
  );
}

export default function EspaceMembrePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <EspaceMembreContent />
    </Suspense>
  );
}
