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
import { useState, useRef } from "react";
import {
  Camera,
  Loader2,
  User,
  Mail,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

const schema = z.object({
  first_name: z
    .string()
    .min(2, "Le prenom doit contenir au moins 2 caracteres"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(10, "Numero de telephone invalide"),
  student_id: z.string().min(5, "Numero etudiant invalide"),
  program: z.string().min(2, "Programme requis"),
  study_level: z.enum(["baccalaureat", "maitrise", "doctorat"], { required_error: "Niveau d'études requis" }),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { id: 1, label: "Identite", icon: User },
  { id: 2, label: "Contact", icon: Mail },
  { id: 3, label: "Etudes", icon: GraduationCap },
];

interface Props {
  onSubmit: (data: CreateMemberPayload) => void;
  loading?: boolean;
}

export function RegistrationForm({ onSubmit, loading }: Props) {
  const [step, setStep] = useState(1);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
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
      2: ["email", "phone", "student_id"],
    };
    const valid = await trigger(fieldsMap[step]);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }

  function onFormSubmit(data: FormData) {
    onSubmit({ ...data, photo_base64: photoBase64 });
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
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
                className={`text-[11px] mt-1.5 font-medium transition-colors ${
                  step >= s.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 md:w-20 h-0.5 mx-2 mb-5 rounded transition-colors duration-300 ${
                  step > s.id ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Step 1 - Identity */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  Qui etes-vous ?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Commencez par vos informations personnelles
                </p>
              </div>

              {/* Photo */}
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
                        Ajouter
                      </span>
                    </div>
                  )}
                </button>
                <p className="text-xs text-muted-foreground">
                  Photo de profil (optionnel)
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
                  <Label htmlFor="first_name">Prenom</Label>
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
                  <Label htmlFor="last_name">Nom</Label>
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
                Continuer
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2 - Contact */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  Comment vous contacter ?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Vos coordonnees et numero etudiant
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
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
                  <Label htmlFor="phone">Telephone</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="student_id">Numero etudiant (NI)</Label>
                  <Input
                    id="student_id"
                    {...register("student_id")}
                    placeholder="111 222 333"
                    className="h-11"
                  />
                  {errors.student_id && (
                    <p className="text-xs text-destructive">
                      {errors.student_id.message}
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
                  Retour
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-11 gap-2"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 - Studies */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">
                  Vos etudes
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Dernieres informations pour finaliser
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="program">Programme d&apos;etudes</Label>
                  <Input
                    id="program"
                    {...register("program")}
                    placeholder="Genie informatique"
                    className="h-11"
                  />
                  {errors.program && (
                    <p className="text-xs text-destructive">
                      {errors.program.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Niveau d&apos;études</Label>
                  <Select
                    defaultValue="baccalaureat"
                    onValueChange={(v) => setValue("study_level", v as "baccalaureat" | "maitrise" | "doctorat")}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baccalaureat">Baccalauréat</SelectItem>
                      <SelectItem value="maitrise">Maîtrise</SelectItem>
                      <SelectItem value="doctorat">Doctorat</SelectItem>
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
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
                >
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {loading ? "Inscription..." : "Finaliser"}
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
