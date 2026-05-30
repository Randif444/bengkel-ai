import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

/**
 * Global Metadata Configuration for Next.js App Router.
 * Handles SEO, Social Media Link Previews (Open Graph), and Browser configurations.
 */
export const metadata = {
  title: "BengkelAI - Asisten Cerdas Bengkel UMKM",
  description:
    "Aplikasi asisten mekanik bertenaga AI untuk mendiagnosis kerusakan mobil, membuat estimasi biaya, dan mengelola histori servis bengkel UMKM.",
  keywords: [
    "bengkel",
    "AI",
    "mekanik",
    "UMKM",
    "otomotif",
    "diagnosis mobil",
    "aplikasi bengkel",
  ],
  authors: [{ name: "Randi" }],

  // Open Graph (For rich previews on WhatsApp, Facebook, LinkedIn)
  openGraph: {
    title: "BengkelAI - Asisten Cerdas Bengkel UMKM",
    description:
      "Tingkatkan pelayanan bengkel Anda dengan diagnosis AI dan manajemen histori servis yang mudah.",
    url: "https://bengkelai.vercel.app", // Update this with your actual Vercel domain later
    siteName: "BengkelAI",
    images: [
      {
        src: "/og-image.jpg", // Pointing to public/og-image.jpg
        width: 1200,
        height: 630,
        alt: "BengkelAI Dashboard Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  // Twitter Card configuration
  twitter: {
    card: "summary_large_image",
    title: "BengkelAI - Asisten Cerdas Bengkel UMKM",
    description: "Tingkatkan pelayanan bengkel Anda dengan diagnosis AI.",
    images: ["/og-image.jpg"], // Pointing to public/og-image.jpg
  },

  // Prevent auto-zoom on iOS inputs and define theme color
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  themeColor: "#1D9E75",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${jakarta.className} bg-gray-200 text-[#1A1A1A]`}>
        <div className="max-w-[430px] mx-auto min-h-screen bg-[#F5F5F5] relative shadow-2xl overflow-x-hidden pb-[80px]">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
