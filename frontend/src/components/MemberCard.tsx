"use client";

import { QRCodeSVG } from "qrcode.react";
import { BarcodeDisplay } from "./BarcodeDisplay";
import { Logo } from "./Logo";
import { MemberCardData } from "@/lib/api";

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
      {/* Card with emerald + gold gradient */}
      <div className="relative bg-gradient-to-br from-[#14532d] via-[#1b6b3a] to-[#14532d] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* Decorative geometric overlay */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="stars"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M20 2l4 12h12l-10 7 4 12-10-7-10 7 4-12L4 14h12z"
                  fill="white"
                  fillOpacity="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stars)" />
          </svg>
        </div>

        {/* Gold accent line at top */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#c9952b] to-transparent" />

        {/* Watermark */}
        {watermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] rotate-[-25deg]">
            <p className="text-5xl font-bold whitespace-nowrap text-white tracking-widest">
              {watermark}
            </p>
          </div>
        )}

        <div className="relative p-5 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Logo size={44} className="rounded-xl shadow-lg" />
              <div>
                <h2 className="font-bold text-sm tracking-wide">AEMUL</h2>
                <p className="text-[9px] text-white/60 leading-tight">
                  Assoc. Etudiants Musulmans - ULaval
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-[#c9952b]/20 border border-[#c9952b]/30 rounded-md px-2 py-0.5">
                <p className="text-[8px] text-[#e6b94d] uppercase tracking-widest font-medium">
                  Membre
                </p>
              </div>
            </div>
          </div>

          {/* Gold separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#c9952b]/40 to-transparent mb-4" />

          {/* Body */}
          <div className="flex gap-4 mb-4">
            {/* Photo */}
            <div className="w-[72px] h-[90px] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {member.photo_base64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_base64}
                  alt="Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white/30">
                  {member.first_name[0]}
                  {member.last_name[0]}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="font-bold text-lg leading-tight truncate tracking-wide">
                {member.first_name}
              </p>
              <p className="font-bold text-lg leading-tight truncate tracking-wide text-[#e6b94d]">
                {member.last_name}
              </p>
              <p className="text-[11px] text-white/60 mt-1.5 truncate">
                {member.program}
              </p>
              <p className="font-mono text-xs text-[#c9952b] font-bold mt-1">
                {member.member_number}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex justify-between text-[10px] text-white/40 mb-4 px-1">
            <span>
              Depuis : {new Date(member.created_at).toLocaleDateString("fr-CA")}
            </span>
            <span>
              Exp. : {expirationDate.toLocaleDateString("fr-CA")}
            </span>
          </div>

          {/* Codes section */}
          <div className="bg-white rounded-xl p-3 flex items-center gap-3">
            <div className="shrink-0 p-1 bg-white rounded-lg">
              <QRCodeSVG
                value={verificationUrl}
                size={68}
                level="M"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#14532d"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col items-center">
              <BarcodeDisplay
                value={member.member_number}
                height={32}
                width={1.1}
              />
            </div>
          </div>
        </div>

        {/* Gold accent line at bottom */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#c9952b] to-transparent" />
      </div>
    </div>
  );
}
