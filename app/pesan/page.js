"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Loader2,
  Copy,
  Edit,
  Send,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { generateWhatsAppMessage } from "@/lib/anthropic";
import { saveService } from "@/lib/storage";

/**
 * Internal Component for WhatsApp Message Generator
 * Handled inside a Suspense boundary to comply with Next.js build requirements.
 */
function PesanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [view, setView] = useState("form");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    no_wa: "",
    kendaraan: "", // Field kendaraan dikembalikan
    ringkasan_kerusakan: "",
    estimasi_biaya: "",
    estimasi_selesai: "",
    nada_pesan: "formal",
  });

  const [generatedMessage, setGeneratedMessage] = useState("");

  /**
   * Smart Auto-Fill: Menarik data draf dari halaman Diagnosis secara otomatis.
   * Mencegah mekanik mengetik ulang data yang sama.
   */
  useEffect(() => {
    // 1. Coba tarik data lengkap dari Draf (bengkelai_draft) terlebih dahulu
    try {
      const draftString = localStorage.getItem("bengkelai_draft");
      if (draftString) {
        const draftData = JSON.parse(draftString);

        // Format uang ke Rupiah bertitik
        const rawBiaya = draftData.total_biaya || "";
        const formattedBiaya = rawBiaya
          ? new Intl.NumberFormat("id-ID").format(rawBiaya)
          : "";

        // Gabungkan Merk dan Plat Nomor
        const kendaraanInfo = [draftData.merk_kendaraan, draftData.plat_nomor]
          .filter(Boolean)
          .join(" - ");

        // Gabungkan keluhan asli dan tindakan yang dicentang mekanik
        let tindakanText = draftData.keluhan || "";
        if (
          draftData.tindakan_dipilih &&
          draftData.tindakan_dipilih.length > 0
        ) {
          const listTindakan = draftData.tindakan_dipilih
            .map((t) => t.nama)
            .join(", ");
          tindakanText += `\nPenanganan: ${listTindakan}`;
        }

        setFormData((prev) => ({
          ...prev,
          nama_pelanggan: draftData.nama_pemilik || prev.nama_pelanggan,
          kendaraan: kendaraanInfo,
          ringkasan_kerusakan: tindakanText,
          estimasi_biaya: formattedBiaya,
        }));

        setIsAutoFilled(true);
        setTimeout(() => setIsAutoFilled(false), 5000);
        return; // Selesai, hentikan fungsi agar tidak tertimpa URL
      }
    } catch (e) {
      console.error("Gagal membaca draf:", e);
    }

    // 2. Fallback: Jika tidak ada draf, baca dari URL (searchParams)
    const nama = searchParams.get("nama");
    const keluhan = searchParams.get("keluhan");
    const estimasi = searchParams.get("estimasi");

    if (nama || keluhan || estimasi) {
      let formattedEstimasi = estimasi || "";
      if (estimasi) {
        const rawValue = estimasi.replace(/\D/g, "");
        formattedEstimasi = rawValue
          ? new Intl.NumberFormat("id-ID").format(rawValue)
          : "";
      }

      setFormData((prev) => ({
        ...prev,
        nama_pelanggan: nama || prev.nama_pelanggan,
        ringkasan_kerusakan: keluhan || prev.ringkasan_kerusakan,
        estimasi_biaya: formattedEstimasi,
      }));
    }
  }, [searchParams]);

  const handleBiayaChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setFormData((prev) => ({ ...prev, estimasi_biaya: "" }));
      return;
    }
    const formattedValue = new Intl.NumberFormat("id-ID").format(rawValue);
    setFormData((prev) => ({ ...prev, estimasi_biaya: formattedValue }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.nama_pelanggan ||
      !formData.ringkasan_kerusakan ||
      !formData.estimasi_biaya ||
      !formData.estimasi_selesai
    ) {
      setErrorMsg("Harap lengkapi seluruh data terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      // Gabungkan kendaraan ke ringkasan saat dikirim ke AI agar konteksnya jelas
      const payloadData = {
        ...formData,
        ringkasan_kerusakan: `Kendaraan: ${formData.kendaraan}\nDetail: ${formData.ringkasan_kerusakan}`,
      };

      const result = await generateWhatsAppMessage(payloadData);
      setGeneratedMessage(result);
      setView("preview");
    } catch (error) {
      setErrorMsg("Koneksi AI bermasalah, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Gagal menyalin pesan.");
    }
  };

  const handleOpenWA = () => {
    if (!formData.no_wa) {
      alert("Masukkan nomor WhatsApp pelanggan terlebih dahulu.");
      return;
    }
    const cleanNumber = formData.no_wa.replace(/\D/g, "");
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(url, "_blank");
  };

  const handleSaveAndFinish = () => {
    const draftString = localStorage.getItem("bengkelai_draft");
    const cleanBiaya = Number(formData.estimasi_biaya.replace(/\./g, ""));

    if (draftString) {
      const draftData = JSON.parse(draftString);
      saveService({
        ...draftData,
        no_wa: formData.no_wa,
        pesan_wa: generatedMessage,
        status: "proses",
      });
      localStorage.removeItem("bengkelai_draft");
    } else {
      saveService({
        nama_pemilik: formData.nama_pelanggan,
        no_wa: formData.no_wa,
        keluhan: formData.ringkasan_kerusakan,
        total_biaya: cleanBiaya,
        pesan_wa: generatedMessage,
        status: "proses",
      });
    }

    alert("Data Servis & Pesan WA berhasil disimpan!");
    router.push("/laporan");
  };

  if (loading) {
    return (
      <main className="p-4 flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#534AB7]" />
        <h2 className="text-lg font-bold">AI Sedang Membuat Pesan...</h2>
        <p className="text-sm text-[#6B7280] text-center">
          Menyusun pesan WhatsApp profesional untuk pelanggan.
        </p>
      </main>
    );
  }

  if (view === "preview") {
    return (
      <main className="p-4 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#534AB7]" />
          <h1 className="text-xl font-bold">Preview Pesan WA</h1>
        </div>

        <Card className="bg-[#DCF8C6] border-[#B7E3A1]">
          <div className="mb-2 text-xs font-semibold text-[#6B7280]">
            Preview pesan WA
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {generatedMessage}
          </p>
        </Card>

        {copied && (
          <div className="bg-green-50 text-green-700 rounded-[8px] p-3 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Pesan tersalin!
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button variant="secondary" onClick={() => setView("form")}>
            <Edit className="w-4 h-4" /> Edit Ulang
          </Button>
          <Button onClick={handleCopy}>
            <Copy className="w-4 h-4" /> Salin Pesan
          </Button>
          <Button
            onClick={handleOpenWA}
            className="bg-[#534AB7] hover:bg-[#433B9B]"
          >
            <Send className="w-4 h-4" /> Buka di WhatsApp
          </Button>
          <Button
            onClick={handleSaveAndFinish}
            className="bg-[#1D9E75] hover:bg-[#085041] mt-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Simpan ke Histori & Selesai
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 flex flex-col gap-5 pb-24">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-[#534AB7]" />
        <h1 className="text-xl font-bold">Generator Pesan WA</h1>
      </div>

      {isAutoFilled && (
        <div className="bg-[#F0F9FF] border border-[#bae6fd] p-4 rounded-[16px] flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <Info className="w-5 h-5 text-[#0284C7] flex-shrink-0" />
          <p className="text-[13px] text-[#0369A1] font-medium leading-relaxed">
            Data otomatis ditarik dari hasil diagnosis.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 rounded-[8px] p-3 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3">
          <Input
            label="Nama Pelanggan"
            value={formData.nama_pelanggan}
            onChange={(e) =>
              setFormData({ ...formData, nama_pelanggan: e.target.value })
            }
          />
          <Input
            label="Nomor WhatsApp"
            placeholder="628123456789"
            value={formData.no_wa}
            onChange={(e) =>
              setFormData({ ...formData, no_wa: e.target.value })
            }
          />
          <Input
            label="Mobil / Kendaraan"
            placeholder="Contoh: Avanza 2018"
            value={formData.kendaraan}
            onChange={(e) =>
              setFormData({ ...formData, kendaraan: e.target.value })
            }
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <Textarea
            label="Ringkasan Kerusakan dan Tindakan"
            value={formData.ringkasan_kerusakan}
            onChange={(e) =>
              setFormData({ ...formData, ringkasan_kerusakan: e.target.value })
            }
          />
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              label="Estimasi Biaya (Rp)"
              value={formData.estimasi_biaya}
              onChange={handleBiayaChange}
              className="pl-12"
            />
            <span className="absolute left-4 top-[35px] text-gray-500 font-medium select-none">
              Rp
            </span>
          </div>
          <Input
            label="Estimasi Waktu Selesai"
            placeholder="Hari ini jam 16.00"
            value={formData.estimasi_selesai}
            onChange={(e) =>
              setFormData({ ...formData, estimasi_selesai: e.target.value })
            }
          />
        </Card>

        <Card>
          <label className="text-sm font-medium block mb-3">Nada Pesan</label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Formal & Sopan", value: "formal" },
              { label: "Santai & Ramah", value: "santai" },
              { label: "Singkat & Padat", value: "singkat" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, nada_pesan: item.value })
                }
                className={`px-3 py-2 rounded-full text-sm font-semibold border transition-all ${
                  formData.nada_pesan === item.value
                    ? "bg-[#534AB7] text-white border-[#534AB7]"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        <Button type="submit" className="bg-[#534AB7] hover:bg-[#433B9B]">
          Generate Pesan WA
        </Button>
      </form>
    </main>
  );
}

/**
 * Main Export wrapped in React Suspense boundary.
 * Prevents Next.js build errors triggered by useSearchParams() static rendering.
 */
export default function SuspenseWrapper() {
  return (
    <Suspense
      fallback={
        <div className="p-4 flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#534AB7]" />
          <p className="text-sm font-medium text-gray-500">Memuat Halaman...</p>
        </div>
      }
    >
      <PesanContent />
    </Suspense>
  );
}
