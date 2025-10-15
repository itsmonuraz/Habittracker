import { IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-ibm-plex-serif",
});

export const metadata = {
  title: "Social Habit Tracker",
  description: "Track your habits and view others' progress",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSerif.variable} antialiased font-serif`}
      >
        {children}
      </body>
    </html>
  );
}
