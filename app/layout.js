import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

/**
 * Viewport Configuration for Next.js App Router.
 * Next.js 14+ requires viewport and themeColor to be exported separately from metadata.
 * Forces mobile-first rendering and prevents iOS auto-zoom.
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1D9E75",
};

/**
 * Global Metadata Configuration for Next.js App Router.
 * Handles SEO, Social Media Link Previews (Open Graph).
 */
export const metadata = {
  metadataBase: new URL("https://bengkel-ai.vercel.app"), // Required for absolute OG image paths
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

  openGraph: {
    title: "BengkelAI - Asisten Cerdas Bengkel UMKM",
    description:
      "Tingkatkan pelayanan bengkel Anda dengan diagnosis AI dan manajemen histori servis yang mudah.",
    url: "/",
    siteName: "BengkelAI",
    images: [
      {
        src: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BengkelAI Dashboard Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "BengkelAI - Asisten Cerdas Bengkel UMKM",
    description: "Tingkatkan pelayanan bengkel Anda dengan diagnosis AI.",
    images: ["/og-image.jpg"],
  },
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
