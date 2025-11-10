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
  metadataBase: new URL('https://camino.rknastenka.com'),
  title: {
    default: 'Camino - The Minimal Habit Tracker You\'ll Actually Use',
    template: '%s | Camino'
  },
  description: 'Camino is a minimal, distraction-free habit tracker designed to help you stay consistent and focused. Track your daily habits with a clean interface, sync across devices with Google Sign-In, and build better routines that stick.',
  keywords: ['habit tracker', 'habit tracking app', 'daily habits', 'productivity', 'goal tracking', 'routine tracker', 'minimal habit tracker', 'free habit tracker', 'habit builder', 'consistency tracker', 'personal development', 'self improvement'],
  authors: [{ name: 'rknastenka', url: 'https://github.com/rknastenka' }],
  creator: 'rknastenka',
  publisher: 'Camino',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://camino.rknastenka.com',
    title: 'Camino - The Minimal Habit Tracker You\'ll Actually Use',
    description: 'Build better habits with Camino. A minimal, distraction-free habit tracker that syncs across devices. Track daily progress, stay consistent, and achieve your goals.',
    siteName: 'Camino',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Camino Habit Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Camino - The Minimal Habit Tracker You\'ll Actually Use',
    description: 'Build better habits with Camino. A minimal, distraction-free habit tracker that syncs across devices.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://camino.rknastenka.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
        <link rel="canonical" href="https://camino.rknastenka.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Camino',
              description: 'Camino is a minimal, distraction-free habit tracker designed to help you stay consistent and focused. Track your daily habits with a clean interface and sync across devices.',
              url: 'https://camino.rknastenka.com',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web, iOS, Android',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              author: {
                '@type': 'Person',
                name: 'rknastenka',
                url: 'https://github.com/rknastenka',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5',
                ratingCount: '1',
              },
            }),
          }}
        />
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
