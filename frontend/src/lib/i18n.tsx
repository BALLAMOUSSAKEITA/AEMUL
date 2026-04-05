"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lang = "fr" | "ar" | "en";

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    "nav.home": "Accueil",
    "nav.profile": "Profil",
    "nav.card": "Carte",
    "nav.prayers": "Prières",
    "nav.events": "Événements",
    "nav.logout": "Déconnexion",
    "nav.faq": "FAQ",
    "nav.about": "À propos",
    "nav.member_area": "Espace membre",
    "nav.register": "S'inscrire",
    "prayer.next": "Prochaine prière",
    "prayer.fajr": "Fajr",
    "prayer.shurooq": "Shurooq",
    "prayer.dhuhr": "Dhuhr",
    "prayer.asr": "Asr",
    "prayer.maghrib": "Maghreb",
    "prayer.isha": "Isha",
    "prayer.iqama": "Iqama",
    "prayer.jumah": "Jumu'ah",
    "events.title": "Événements",
    "events.upcoming": "À venir",
    "events.past": "Passés",
    "events.no_events": "Aucun événement pour le moment.",
    "events.location": "Lieu",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.back": "Retour",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "theme.toggle": "Changer de thème",
    "lang.fr": "Français",
    "lang.ar": "العربية",
    "lang.en": "English",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.profile": "الملف",
    "nav.card": "البطاقة",
    "nav.prayers": "الصلوات",
    "nav.events": "الأنشطة",
    "nav.logout": "تسجيل الخروج",
    "nav.faq": "الأسئلة",
    "nav.about": "من نحن",
    "nav.member_area": "فضاء العضو",
    "nav.register": "التسجيل",
    "prayer.next": "الصلاة القادمة",
    "prayer.fajr": "الفجر",
    "prayer.shurooq": "الشروق",
    "prayer.dhuhr": "الظهر",
    "prayer.asr": "العصر",
    "prayer.maghrib": "المغرب",
    "prayer.isha": "العشاء",
    "prayer.iqama": "الإقامة",
    "prayer.jumah": "الجمعة",
    "events.title": "الأنشطة",
    "events.upcoming": "القادمة",
    "events.past": "السابقة",
    "events.no_events": "لا توجد أنشطة حالياً.",
    "events.location": "المكان",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.back": "رجوع",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "theme.toggle": "تغيير السمة",
    "lang.fr": "Français",
    "lang.ar": "العربية",
    "lang.en": "English",
  },
  en: {
    "nav.home": "Home",
    "nav.profile": "Profile",
    "nav.card": "Card",
    "nav.prayers": "Prayers",
    "nav.events": "Events",
    "nav.logout": "Logout",
    "nav.faq": "FAQ",
    "nav.about": "About",
    "nav.member_area": "Member Area",
    "nav.register": "Register",
    "prayer.next": "Next prayer",
    "prayer.fajr": "Fajr",
    "prayer.shurooq": "Shurooq",
    "prayer.dhuhr": "Dhuhr",
    "prayer.asr": "Asr",
    "prayer.maghrib": "Maghrib",
    "prayer.isha": "Isha",
    "prayer.iqama": "Iqama",
    "prayer.jumah": "Jumu'ah",
    "events.title": "Events",
    "events.upcoming": "Upcoming",
    "events.past": "Past",
    "events.no_events": "No events at the moment.",
    "events.location": "Location",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.loading": "Loading...",
    "common.error": "Error",
    "theme.toggle": "Toggle theme",
    "lang.fr": "Français",
    "lang.ar": "العربية",
    "lang.en": "English",
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (key) => key,
  dir: "ltr",
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && translations[saved]) setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l === "ar" ? "ar" : l === "en" ? "en" : "fr";
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] || translations.fr[key] || key,
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}
