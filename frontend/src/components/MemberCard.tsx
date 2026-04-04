"use client";

import { QRCodeSVG } from "qrcode.react";
import { BarcodeDisplay } from "./BarcodeDisplay";
import { MemberCardData } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

interface Props {
  member: MemberCardData;
  watermark?: string;
}

export function MemberCard({ member, watermark }: Props) {
  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/carte/${member.id}`;
  const expirationDate = new Date(
    new Date(member.created_at).getFullYear() + 1,
    5,
    30
  );

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground shadow-2xl overflow-hidden">
        {/* Watermark overlay */}
        {watermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] rotate-[-30deg]">
            <p className="text-4xl font-bold whitespace-nowrap">{watermark}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg font-bold">A</span>
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">AEMUL</h2>
            <p className="text-[10px] opacity-80 leading-tight">
              Association des Étudiants Musulmans
            </p>
            <p className="text-[10px] opacity-80 leading-tight">
              Université Laval
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] opacity-70">CARTE DE MEMBRE</p>
            <p className="font-mono text-xs font-bold">{member.member_number}</p>
          </div>
        </div>

        <Separator className="bg-white/20 mb-4" />

        {/* Body */}
        <div className="flex gap-4 mb-4">
          {/* Photo */}
          <div className="w-20 h-24 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {member.photo_base64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photo_base64}
                alt="Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl opacity-50">
                {member.first_name[0]}
                {member.last_name[0]}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg leading-tight truncate">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-xs opacity-80 mt-1 truncate">{member.program}</p>
            <div className="mt-2 text-[10px] opacity-70 space-y-0.5">
              <p>
                Membre depuis :{" "}
                {new Date(member.created_at).toLocaleDateString("fr-CA")}
              </p>
              <p>
                Expire le :{" "}
                {expirationDate.toLocaleDateString("fr-CA")}
              </p>
            </div>
          </div>
        </div>

        {/* Codes */}
        <div className="bg-white rounded-xl p-3 flex items-center gap-3">
          <QRCodeSVG
            value={verificationUrl}
            size={70}
            level="M"
            includeMargin={false}
          />
          <div className="flex-1 min-w-0 flex flex-col items-center">
            <BarcodeDisplay value={member.member_number} height={35} width={1.2} />
          </div>
        </div>
      </div>
    </div>
  );
}
