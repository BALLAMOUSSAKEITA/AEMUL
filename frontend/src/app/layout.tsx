import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AEMUL - Association des Étudiants Musulmans de l'Université Laval",
  description:
    "Plateforme de gestion des membres de l'AEMUL. Inscrivez-vous et obtenez votre carte de membre.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AEMUL",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1b6b3a",
  interactiveWidget: "resizes-content",
};

import { I18nProvider } from "@/lib/i18n";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider>{children}</I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
              // Fix mobile keyboard hiding focused inputs
              (function() {
                if (!window.visualViewport) return;
                var pendingScroll = null;

                // When keyboard opens, visualViewport height shrinks
                window.visualViewport.addEventListener('resize', function() {
                  // Add CSS variable with actual visible height
                  document.documentElement.style.setProperty(
                    '--vh-visible',
                    window.visualViewport.height + 'px'
                  );

                  // Scroll focused input into visible area
                  var el = document.activeElement;
                  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                    clearTimeout(pendingScroll);
                    pendingScroll = setTimeout(function() {
                      var rect = el.getBoundingClientRect();
                      var vpHeight = window.visualViewport.height;
                      var vpTop = window.visualViewport.offsetTop;
                      // If input is below the visible viewport
                      if (rect.bottom > vpTop + vpHeight - 20) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      // If input is above the visible viewport
                      if (rect.top < vpTop + 20) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }
                });

                // Also scroll on focus
                document.addEventListener('focusin', function(e) {
                  var el = e.target;
                  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    setTimeout(function() {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 400);
                  }
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
