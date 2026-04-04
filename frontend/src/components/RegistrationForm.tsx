"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateMemberPayload } from "@/lib/api";
import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

const schema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  student_id: z.string().min(5, "Numéro étudiant invalide"),
  program: z.string().min(2, "Programme requis"),
  study_year: z.number().min(1).max(10),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: CreateMemberPayload) => void;
  loading?: boolean;
}

export function RegistrationForm({ onSubmit, loading }: Props) {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { study_year: 1 },
  });

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  }

  function onFormSubmit(data: FormData) {
    onSubmit({ ...data, photo_base64: photoBase64 });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Remplissez tous les champs pour compléter votre inscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary transition-colors"
            >
              {photoBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoBase64}
                  alt="Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-muted-foreground" />
              )}
            </button>
            <p className="text-xs text-muted-foreground">Photo de profil (optionnel)</p>
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
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" {...register("first_name")} placeholder="Moussa" />
              {errors.first_name && (
                <p className="text-xs text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input id="last_name" {...register("last_name")} placeholder="Keita" />
              {errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="moussa.keita@ulaval.ca"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="418-555-0123"
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="student_id">Numéro étudiant (NI)</Label>
            <Input
              id="student_id"
              {...register("student_id")}
              placeholder="111 222 333"
            />
            {errors.student_id && (
              <p className="text-xs text-destructive">{errors.student_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Programme d&apos;études</Label>
            <Input
              id="program"
              {...register("program")}
              placeholder="Génie informatique"
            />
            {errors.program && (
              <p className="text-xs text-destructive">{errors.program.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Année d&apos;études</Label>
            <Select
              defaultValue="1"
              onValueChange={(v) => setValue("study_year", Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y === 1
                      ? "1ère année"
                      : `${y}e année`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
