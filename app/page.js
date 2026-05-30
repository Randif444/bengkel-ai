"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PenTool, MessageSquare, FileText, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getConfig, getServices } from "@/lib/storage";

/**
 * Application Dashboard (Home Page)
 * Displays key metrics and primary navigation routes. Designed with a clean,
 * "Smart Home Dashboard" aesthetic for immediate visual clarity.
 *
 * @returns {JSX.Element} The main landing page view
 */
export default function Home() {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState({ bulanIni: 0, antrian: 0, selesai: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedConfig = getConfig();
    setConfig(savedConfig);

    const services = getServices();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let countBulanIni = 0;
    let countAntrian = 0;
    let countSelesai = 0;

    services.forEach((servis) => {
      const date = new Date(servis.tanggal);
      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        countBulanIni++;
        if (servis.status === "proses") countAntrian++;
        if (servis.status === "selesai") countSelesai++;
      }
    });

    setStats({
      bulanIni: countBulanIni,
      antrian: countAntrian,
      selesai: countSelesai,
    });
    setIsLoading(false);
  }, []);

  return (
    <main className="p-5 flex flex-col gap-8 pb-24">
      {/* Header Section */}
      <div className="flex justify-between items-start mt-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-[#6B7280] tracking-wide uppercase">
            Selamat Datang,
          </p>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {isLoading ? "Memuat..." : config?.nama_bengkel || "BengkelAI"}
          </h1>
        </div>

        {/* Profile Avatar / Logo Wrapper */}
        <div className="relative w-14 h-14 rounded-full bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.15)] flex items-center justify-center p-2 border-2 border-white overflow-hidden">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* System Status Indicator */}
      <div className="flex items-center gap-2 bg-[#E1F5EE] self-start px-4 py-2 rounded-full shadow-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1D9E75]"></span>
        </span>
        <span className="text-xs font-extrabold text-[#085041]">
          Sistem AI Aktif & Siap
        </span>
      </div>

      {/* Floating Statistics Cards */}
      <div>
        <h2 className="text-sm font-bold text-[#1A1A1A] mb-3 ml-1">
          Ringkasan Bulan Ini
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-[24px] bg-white shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)]">
            <span className="text-3xl font-black text-[#1D9E75]">
              {stats.bulanIni}
            </span>
            <span className="text-[10px] text-[#6B7280] mt-1 font-bold">
              Total Servis
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-[24px] bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] shadow-[0_8px_30px_-10px_rgba(245,158,11,0.15)]">
            <span className="text-3xl font-black text-[#D97706]">
              {stats.antrian}
            </span>
            <span className="text-[10px] text-[#92400E] mt-1 font-bold">
              Di Antrian
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-[24px] bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] shadow-[0_8px_30px_-10px_rgba(16,185,129,0.15)]">
            <span className="text-3xl font-black text-[#059669]">
              {stats.selesai}
            </span>
            <span className="text-[10px] text-[#065F46] mt-1 font-bold">
              Selesai
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Menu */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-[#1A1A1A] mb-1 ml-1">
          Menu Utama
        </h2>

        <Link href="/diagnosis" className="block">
          <Card className="flex items-center gap-4 p-5 hover:scale-[1.02] transition-transform cursor-pointer bg-gradient-to-r from-white to-[#F8FAFC]">
            <div className="bg-[#E1F5EE] p-4 rounded-full shadow-inner">
              <PenTool className="w-6 h-6 text-[#1D9E75]" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Tanya Kerusakan
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 font-medium">
                Analisis AI untuk keluhan mobil
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </Card>
        </Link>

        <Link href="/pesan" className="block">
          <Card className="flex items-center gap-4 p-5 hover:scale-[1.02] transition-transform cursor-pointer bg-gradient-to-r from-white to-[#F8FAFC]">
            <div className="bg-[#EEEDFE] p-4 rounded-full shadow-inner">
              <MessageSquare className="w-6 h-6 text-[#534AB7]" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Pesan WhatsApp
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 font-medium">
                Buat laporan profesional ke pelanggan
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </Card>
        </Link>

        <Link href="/laporan" className="block">
          <Card className="flex items-center gap-4 p-5 hover:scale-[1.02] transition-transform cursor-pointer bg-gradient-to-r from-white to-[#F8FAFC]">
            <div className="bg-orange-50 p-4 rounded-full shadow-inner">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Histori & Keuangan
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 font-medium">
                Kelola data servis bengkel
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </Card>
        </Link>
      </div>
    </main>
  );
}
