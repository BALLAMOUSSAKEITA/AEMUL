"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateMemberPayload } from "@/lib/api";
import { useState, useRef, useMemo } from "react";
import {
  Camera,
  Loader2,
  User,
  Mail,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Check,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  program: string;
  study_level: "baccalaureat" | "maitrise" | "doctorat";
};

interface Props {
  onSubmit: (data: CreateMemberPayload) => void;
  loading?: boolean;
}

export function RegistrationForm({ onSubmit, loading }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [policyError, setPolicyError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const schema = useMemo(() => z.object({
    first_name: z.string().min(2, t("form.firstname_min")),
    last_name: z.string().min(2, t("form.lastname_min")),
    email: z.string().email(t("form.email_invalid")),
    phone: z.string().min(10, t("form.phone_invalid")),
    program: z.string().min(2, t("form.program_required")),
    study_level: z.enum(["baccalaureat", "maitrise", "doctorat"], { message: t("form.study_level_required") }),
  }), [t]);

  const STEPS = [
    { id: 1, label: t("form.step_identity"), icon: User },
    { id: 2, label: t("form.step_contact"), icon: Mail },
    { id: 3, label: t("form.step_studies"), icon: GraduationCap },
    { id: 4, label: t("form.step_confirm"), icon: ShieldCheck },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { study_level: "baccalaureat" },
  });

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoBase64(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function nextStep() {
    const fieldsMap: Record<number, (keyof FormData)[]> = {
      1: ["first_name", "last_name"],
      2: ["email", "phone"],
      3: ["program", "study_level"],
    };
    if (fieldsMap[step]) {
      const valid = await trigger(fieldsMap[step]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 4));
  }

  function onFormSubmit(data: FormData) {
    if (!acceptedPolicy) {
      setPolicyError(true);
      return;
    }
    onSubmit({ ...data, photo_base64: photoBase64 });
  }

  const STUDY_LEVEL_LABELS: Record<string, string> = {
    baccalaureat: t("form.bachelor"),
    maitrise: t("form.master"),
    doctorat: t("form.doctorate"),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step > s.id
                    ? "bg-primary text-primary-foreground"
                    : step === s.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium transition-colors ${
                  step >= s.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 md:w-14 h-0.5 mx-1.5 mb-5 rounded transition-colors duration-300 ${
                  step > s.id ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  {t("form.who_are_you")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("form.personal_info")}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative group w-28 h-28 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary hover:from-primary/5 hover:to-primary/10 transition-all duration-300"
                >
                  {photoBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoBase64}
                      alt="Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                        {t("form.add_photo")}
                      </span>
                    </div>
                  )}
                </button>
                <p className="text-xs text-muted-foreground">
                  {t("form.photo_optional")}
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t("form.first_name")}</Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    placeholder="Moussa"
                    className="h-11"
                  />
                  {errors.first_name && (
                    <p className="text-xs text-destructive">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t("form.last_name")}</Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    placeholder="Keita"
                    className="h-11"
                  />
                  {errors.last_name && (
                    <p className="text-xs text-destructive">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={nextStep}
                className="w-full h-11 gap-2"
              >
                {t("common.continue")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  {t("form.contact_title")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("form.contact_subtitle")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("form.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="moussa.keita@ulaval.ca"
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("form.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="418-555-0123"
                    className="h-11"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("common.back")}
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-11 gap-2"
                >
                  {t("common.continue")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  {t("form.studies_title")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("form.studies_subtitle")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program">{t("form.program")}</Label>
                  <Input
                    id="program"
                    {...register("program")}
                    placeholder="Génie informatique"
                    className="h-11"
                  />
                  {errors.program && (
                    <p className="text-xs text-destructive">
                      {errors.program.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("form.study_level")}</Label>
                  <Select
                    defaultValue="baccalaureat"
                    onValueChange={(v) => setValue("study_level", v as "baccalaureat" | "maitrise" | "doctorat")}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t("form.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baccalaureat">{t("form.bachelor")}</SelectItem>
                      <SelectItem value="maitrise">{t("form.master")}</SelectItem>
                      <SelectItem value="doctorat">{t("form.doctorate")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.study_level && (
                    <p className="text-xs text-destructive">{errors.study_level.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 h-11 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("common.back")}
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-11 gap-2"
                >
                  {t("common.continue")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  {t("form.confirm_title")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("form.confirm_subtitle")}
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("form.summary")}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <span className="text-muted-foreground">{t("form.name_label")}</span>
                  <span className="font-medium">{getValues("first_name")} {getValues("last_name")}</span>
                  <span className="text-muted-foreground">{t("form.email_label")}</span>
                  <span className="font-medium truncate">{getValues("email")}</span>
                  <span className="text-muted-foreground">{t("form.phone_label")}</span>
                  <span className="font-medium">{getValues("phone")}</span>
                  <span className="text-muted-foreground">{t("form.program_label")}</span>
                  <span className="font-medium">{getValues("program")}</span>
                  <span className="text-muted-foreground">{t("form.level_label")}</span>
                  <span className="font-medium">{STUDY_LEVEL_LABELS[getValues("study_level")] || getValues("study_level")}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold">{t("form.privacy_title")}</h3>
                </div>
                <div className="bg-muted/30 border rounded-xl p-4 max-h-48 overflow-y-auto text-xs text-muted-foreground leading-relaxed space-y-3 scroll-smooth">
                  <p className="font-semibold text-foreground">Politique de confidentialité — AEMUL</p>
                  <p>
                    L&apos;Association des Étudiants Musulmans de l&apos;Université Laval (AEMUL)
                    s&apos;engage à protéger la vie privée de ses membres conformément à la
                    Loi sur la protection des renseignements personnels dans le secteur privé du Québec (Loi 25).
                  </p>
                  <p className="font-semibold text-foreground">1. Données collectées</p>
                  <p>
                    Nous collectons les informations suivantes lors de votre inscription :
                    nom, prénom, adresse courriel, numéro de téléphone, programme d&apos;études,
                    niveau d&apos;études et photo de profil (optionnelle). Ces données sont nécessaires
                    à la gestion de votre adhésion et à la génération de votre carte de membre.
                  </p>
                  <p className="font-semibold text-foreground">2. Utilisation des données</p>
                  <p>
                    Vos données personnelles sont utilisées exclusivement pour :
                    la gestion de votre compte membre, la génération de votre carte de membre numérique,
                    les communications liées aux activités de l&apos;AEMUL et les notifications
                    relatives aux heures de prières (si vous les activez).
                  </p>
                  <p className="font-semibold text-foreground">3. Partage des données</p>
                  <p>
                    Vos données personnelles ne sont jamais vendues, louées ou partagées avec des tiers
                    à des fins commerciales. Seuls les administrateurs autorisés de l&apos;AEMUL ont accès
                    à vos informations dans le cadre de la gestion de l&apos;association.
                  </p>
                  <p className="font-semibold text-foreground">4. Sécurité</p>
                  <p>
                    Vos données sont stockées de manière sécurisée. Les mots de passe sont chiffrés
                    et votre carte de membre est protégée par un mécanisme d&apos;affichage temporaire.
                    Les communications sont chiffrées via HTTPS.
                  </p>
                  <p className="font-semibold text-foreground">5. Conservation</p>
                  <p>
                    Vos données sont conservées pendant la durée de votre adhésion.
                    Vous pouvez demander la suppression de votre compte et de vos données
                    à tout moment en contactant un administrateur.
                  </p>
                  <p className="font-semibold text-foreground">6. Vos droits</p>
                  <p>
                    Vous avez le droit d&apos;accéder à vos données personnelles, de les rectifier,
                    de les supprimer et de retirer votre consentement. Pour exercer ces droits,
                    contactez-nous à admin@aemul.com.
                  </p>
                </div>
              </div>

              <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                acceptedPolicy
                  ? "border-primary bg-primary/5"
                  : policyError
                    ? "border-destructive bg-destructive/5"
                    : "border-border hover:border-primary/40"
              }`}>
                <input
                  type="checkbox"
                  checked={acceptedPolicy}
                  onChange={(e) => {
                    setAcceptedPolicy(e.target.checked);
                    if (e.target.checked) setPolicyError(false);
                  }}
                  className="mt-0.5 w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm leading-snug">
                  {t("form.privacy_accept")}
                </span>
              </label>
              {policyError && (
                <p className="text-xs text-destructive">
                  {t("form.privacy_required")}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="flex-1 h-11 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("common.back")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
                >
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {loading ? t("form.submitting") : t("form.submit")}
                  {!loading && <Check className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
