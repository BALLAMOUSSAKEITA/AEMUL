"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, Member, MemberCardData } from "@/lib/api";
import { MemberCard } from "@/components/MemberCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  User,
  Lock,
  Loader2,
  RefreshCw,
  Shield,
  Clock,
  Save,
} from "lucide-react";

export default function EspaceMembrePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "accueil";

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Profile edit
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    program: "",
    study_year: 1,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Card
  const [card, setCard] = useState<MemberCardData | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const loadMember = useCallback(async () => {
    try {
      const m = await api.getMyProfile();
      setMember(m);
      setProfileForm({
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
        program: m.program,
        study_year: m.study_year,
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
  }, [loadMember]);

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
      setProfileMsg("Profil mis à jour avec succès !");
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
      {/* Password change modal (forced on first login) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border shadow-2xl p-8 max-w-sm w-full space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h2 className="text-xl font-bold font-[var(--font-heading)]">
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
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 gap-2" disabled={pwLoading}>
                {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Welcome header */}
        {tab === "accueil" && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border p-6 md:p-8">
              <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-1">
                Bienvenue, {member.first_name} !
              </h1>
              <p className="text-muted-foreground text-sm">
                Membre #{member.member_number}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`rounded-xl p-4 border ${member.is_approved ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {member.is_approved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    <span className={`text-xs font-semibold ${member.is_approved ? "text-emerald-700" : "text-amber-700"}`}>
                      {member.is_approved ? "Approuvé" : "En attente"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {member.is_approved
                      ? "Votre inscription est validée."
                      : "Un admin doit valider votre inscription."}
                  </p>
                </div>

                <div className="rounded-xl p-4 border bg-primary/5 border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">Profil</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{member.program}</p>
                </div>

                <div className="rounded-xl p-4 border bg-[var(--gold)]/5 border-[var(--gold)]/10">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-[var(--gold)]" />
                    <span className="text-xs font-semibold text-[var(--gold)]">Carte</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {member.is_approved ? "Disponible" : "Indisponible jusqu'à approbation"}
                  </p>
                </div>
              </div>
            </div>

            {!member.is_approved && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-amber-800">Inscription en attente</p>
                  <p className="text-xs text-amber-700/70 mt-0.5">
                    Votre inscription doit être approuvée par un administrateur avant de pouvoir
                    générer votre carte de membre.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profil" && (
          <div className="bg-card rounded-2xl border p-6 md:p-8">
            <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6">Mon profil</h2>
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={member.email} disabled className="h-11 opacity-60" />
                <p className="text-[10px] text-muted-foreground">L&apos;email ne peut pas être modifié.</p>
              </div>

              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Programme</Label>
                <Input
                  value={profileForm.program}
                  onChange={(e) => setProfileForm((f) => ({ ...f, program: e.target.value }))}
                  className="h-11"
                />
              </div>

              {profileMsg && (
                <p className={`text-sm ${profileMsg.includes("succès") ? "text-emerald-600" : "text-destructive"}`}>
                  {profileMsg}
                </p>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="gap-2" disabled={profileLoading}>
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPasswordModal(true)} className="gap-2">
                  <Lock className="w-4 h-4" />
                  Changer mot de passe
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Card tab */}
        {tab === "carte" && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border p-6 md:p-8">
              <h2 className="text-xl font-bold font-[var(--font-heading)] mb-2">Ma carte de membre</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {member.is_approved
                  ? "Générez ou régénérez votre carte à tout moment."
                  : "Votre carte sera disponible une fois votre inscription approuvée."}
              </p>

              {!member.is_approved ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">En attente d&apos;approbation</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Un administrateur doit valider votre inscription.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={loadCard} className="gap-2" disabled={cardLoading}>
                    {cardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {card ? "Régénérer la carte" : "Générer ma carte"}
                  </Button>

                  {cardError && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3 text-sm">
                      {cardError}
                    </div>
                  )}

                  {card && (
                    <div className="max-w-sm">
                      <MemberCard member={card} watermark={new Date().toLocaleTimeString("fr-CA")} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
