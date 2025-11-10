import { IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { HabitsProvider } from "./contexts/HabitsContext";

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-ibm-plex-serif",
});

export const metadata = {
  title: "Camino",
  description: "Minimal Social Habit Tracker",
  icons: {
    icon: '/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Camino',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${ibmPlexSerif.variable} antialiased font-serif`}
      >
        <AuthProvider>
          <HabitsProvider>
            {children}
          </HabitsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
