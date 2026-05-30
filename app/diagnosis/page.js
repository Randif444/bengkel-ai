"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ChevronLeft,
  Loader2,
  Save,
  MessageSquare,
  CheckCircle2,
  Calculator,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { analyzeVehicleComplaint } from "@/lib/anthropic";
import { saveService } from "@/lib/storage";

export default function DiagnosisPage() {
  const router = useRouter();

  const [view, setView] = useState("form");

  const [formData, setFormData] = useState({
    nama_pemilik: "",
    plat_nomor: "",
    merk_kendaraan: "",
    keluhan: "",
  });

  const [aiResult, setAiResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Invoice Calculator State
  const [selectedActions, setSelectedActions] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [diskon, setDiskon] = useState("");

  const keluhanUmum = [
    "Bunyi mesin aneh",
    "Overheat",
    "Boros BBM",
    "Rem kurang pakem",
    "Asap knalpot",
    "AC tidak dingin",
    "Mesin brebet",
    "Suspensi keras",
  ];

  const handleChipClick = (keluhan) => {
    setFormData((prev) => ({
      ...prev,
      keluhan: prev.keluhan ? `${prev.keluhan}, ${keluhan}` : keluhan,
    }));
  };

  const formatRupiah = (value) => {
    if (!value) return "";
    const cleanNumber = value.toString().replace(/\D/g, "");
    if (cleanNumber === "") return "";
    return Number(cleanNumber).toLocaleString("id-ID");
  };

  const parseRupiah = (formattedValue) => {
    if (!formattedValue) return 0;
    return Number(formattedValue.toString().replace(/\./g, ""));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.nama_pemilik ||
      !formData.plat_nomor ||
      !formData.merk_kendaraan ||
      !formData.keluhan
    ) {
      setErrorMsg("Harap lengkapi semua data kendaraan dan keluhan.");
      return;
    }

    setView("loading");

    try {
      const result = await analyzeVehicleComplaint(formData);
      setAiResult(result);

      // Reset invoice states upon new analysis
      setSelectedActions([]);
      setSpareparts([]);
      setDiskon("");

      setView("result");
    } catch (error) {
      console.error(error);
      setErrorMsg(
        "Gagal terhubung ke AI atau format respons tidak sesuai. Coba lagi.",
      );
      setView("form");
    }
  };

  const handleActionToggle = (tindakan) => {
    setSelectedActions((prev) => {
      const isSelected = prev.find((item) => item.nama === tindakan.nama);
      if (isSelected) {
        return prev.filter((item) => item.nama !== tindakan.nama);
      } else {
        return [...prev, tindakan];
      }
    });
  };

  const handleAddSparepart = () => {
    setSpareparts([
      ...spareparts,
      { id: Date.now().toString(), namaBarang: "", harga: "" },
    ]);
  };

  const handleRemoveSparepart = (id) => {
    setSpareparts(spareparts.filter((sp) => sp.id !== id));
  };

  const handleSparepartChange = (id, field, value) => {
    setSpareparts(
      spareparts.map((sp) => {
        if (sp.id === id) {
          if (field === "harga") return { ...sp, harga: formatRupiah(value) };
          return { ...sp, [field]: value };
        }
        return sp;
      }),
    );
  };

  const handleDiskonChange = (e) => {
    setDiskon(formatRupiah(e.target.value));
  };

  const subTotalJasa = selectedActions.reduce(
    (acc, curr) => acc + (curr?.estimasi_biaya_min || 0),
    0,
  );
  const subTotalSparepart = spareparts.reduce(
    (acc, curr) => acc + parseRupiah(curr.harga),
    0,
  );
  const diskonValue = parseRupiah(diskon);

  const finalTotal = subTotalJasa + subTotalSparepart - diskonValue;

  const handleSaveToHistory = () => {
    if (!aiResult) return;

    if (
      finalTotal === 0 &&
      selectedActions.length === 0 &&
      spareparts.length === 0
    ) {
      const confirmEmpty = window.confirm(
        "Anda belum mencentang tindakan atau memasukkan barang. Tetap simpan dengan total Rp 0?",
      );
      if (!confirmEmpty) return;
    }

    saveService({
      ...formData,
      analisis_ai: aiResult,
      tindakan_dipilih: selectedActions,
      spareparts: spareparts,
      diskon: diskonValue,
      total_biaya: finalTotal,
      pesan_wa: "",
    });

    alert("Berhasil disimpan ke histori!");
    router.push("/laporan");
  };

  const handleCreateWA = () => {
    let rincianTindakan = selectedActions
      .map((a) => `- Jasa: ${a.nama}`)
      .join("\n");

    if (spareparts.length > 0) {
      const partText = spareparts
        .filter((sp) => sp.namaBarang)
        .map((sp) => `- Part: ${sp.namaBarang} (Rp ${sp.harga})`)
        .join("\n");
      if (partText) rincianTindakan += `\n${partText}`;
    }

    if (diskonValue > 0)
      rincianTindakan += `\n- (Diskon Potongan Harga: Rp ${diskon})`;

    const draftData = {
      ...formData,
      analisis_ai: aiResult,
      tindakan_dipilih: selectedActions,
      spareparts: spareparts,
      diskon: diskonValue,
      total_biaya: finalTotal,
    };

    // Store draft to memory to persist data between page transitions
    localStorage.setItem("bengkelai_draft", JSON.stringify(draftData));

    const params = new URLSearchParams({
      nama: formData.nama_pemilik,
      keluhan:
        formData.keluhan +
        (rincianTindakan
          ? `\n\n*Rincian Pengerjaan & Part:*\n${rincianTindakan}`
          : ""),
      estimasi: finalTotal,
    });

    router.push(`/pesan?${params.toString()}`);
  };

  if (view === "form") {
    return (
      <main className="p-4 flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="text-[#1D9E75] w-6 h-6" />
          <h1 className="text-xl font-bold text-[#1A1A1A]">Tanya Kerusakan</h1>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-[8px] text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <Input
              label="Nama Pemilik"
              placeholder="Contoh: Pak Budi"
              value={formData.nama_pemilik}
              onChange={(e) =>
                setFormData({ ...formData, nama_pemilik: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Plat Nomor"
                placeholder="B 1234 CD"
                value={formData.plat_nomor}
                onChange={(e) =>
                  setFormData({ ...formData, plat_nomor: e.target.value })
                }
              />
              <Input
                label="Merk/Tipe"
                placeholder="Avanza 2019"
                value={formData.merk_kendaraan}
                onChange={(e) =>
                  setFormData({ ...formData, merk_kendaraan: e.target.value })
                }
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <Textarea
              label="Ceritakan Keluhan"
              placeholder="Contoh: mesin bunyi tek-tek waktu pagi..."
              value={formData.keluhan}
              onChange={(e) =>
                setFormData({ ...formData, keluhan: e.target.value })
              }
            />

            <div>
              <span className="text-xs text-[#6B7280] mb-2 block">
                Pintasan Keluhan:
              </span>
              <div className="flex flex-wrap gap-2">
                {keluhanUmum.map((keluhan) => (
                  <button
                    key={keluhan}
                    type="button"
                    onClick={() => handleChipClick(keluhan)}
                    className="bg-[#E1F5EE] text-[#085041] border border-[#1D9E75]/30 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#1D9E75] hover:text-white transition-colors"
                  >
                    + {keluhan}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Button type="submit" className="mt-2 text-lg py-[14px]">
            Analisis dengan AI
          </Button>
        </form>
      </main>
    );
  }

  if (view === "loading") {
    return (
      <main className="p-4 flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
        <h2 className="text-lg font-bold text-[#1A1A1A]">
          AI Sedang Menganalisis...
        </h2>
        <p className="text-sm text-center text-[#6B7280]">
          Memeriksa keluhan {formData.merk_kendaraan} milik{" "}
          {formData.nama_pemilik}
        </p>
      </main>
    );
  }

  if (view === "result" && aiResult) {
    if (!aiResult?.penjelasan_awam && !aiResult?.rekomendasi_tindakan) {
      return (
        <main className="p-4 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("form")}
              className="p-1 bg-white rounded-full shadow-sm"
            >
              <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
            </button>
            <h1 className="text-lg font-bold text-red-600">
              Format AI Melenceng
            </h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 overflow-hidden">
            <p className="text-sm text-red-800 mb-2 font-semibold">
              Data raw response:
            </p>
            <pre className="text-[10px] text-gray-800 bg-white p-3 rounded border border-red-100 overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {typeof aiResult === "object"
                ? JSON.stringify(aiResult, null, 2)
                : String(aiResult)}
            </pre>
          </div>
          <Button onClick={() => setView("form")} variant="secondary">
            Coba Analisis Ulang
          </Button>
        </main>
      );
    }

    return (
      <main className="p-4 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("form")}
            className="p-1 bg-white rounded-full shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">
              Hasil Diagnosis
            </h1>
            <p className="text-xs text-[#6B7280]">
              {formData.merk_kendaraan} • {formData.plat_nomor}
            </p>
          </div>
        </div>

        <div className="bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-[12px] p-4">
          <h3 className="text-sm font-bold text-[#085041] mb-1">
            Penjelasan untuk Pelanggan:
          </h3>
          <p className="text-sm text-[#1A1A1A] leading-relaxed">
            {aiResult?.penjelasan_awam || "Tidak ada penjelasan tambahan."}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">
            Kemungkinan Penyebab
          </h3>
          <div className="flex flex-col gap-2">
            {aiResult?.kemungkinan_penyebab?.map((penyebab, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 p-3 rounded-[8px] text-xs font-semibold text-[#1A1A1A] shadow-sm flex items-start gap-2"
              >
                <span className="text-[#1D9E75] mt-0.5">•</span>
                <span>{penyebab}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-2 flex justify-between items-center">
            Pilih Tindakan & Servis
            <span className="text-[10px] font-normal text-[#6B7280] bg-gray-100 px-2 py-1 rounded-full">
              Pilih untuk masuk ke nota
            </span>
          </h3>

          <div className="flex flex-col gap-3">
            {aiResult?.rekomendasi_tindakan?.map((tindakan, i) => {
              const isSelected = selectedActions.find(
                (item) => item.nama === tindakan.nama,
              );

              return (
                <Card
                  key={i}
                  onClick={() => handleActionToggle(tindakan)}
                  className={`flex flex-col gap-2 cursor-pointer transition-all ${isSelected ? "border-[#1D9E75] ring-1 ring-[#1D9E75] bg-[#E1F5EE]/30" : "hover:border-gray-300"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? "bg-[#1D9E75] border-[#1D9E75]" : "border-gray-300 bg-white"}`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#1A1A1A] pr-2 leading-tight">
                        {tindakan?.nama}
                      </h4>
                    </div>
                    <Badge variant={tindakan?.prioritas || "opsional"}>
                      {tindakan?.prioritas || "opsional"}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#6B7280] ml-7">
                    {tindakan?.keterangan || "-"}
                  </p>

                  <div
                    className={`mt-1 pt-2 border-t font-semibold text-sm ml-7 flex justify-between ${isSelected ? "border-[#1D9E75]/20 text-[#1D9E75]" : "border-gray-100 text-[#1D9E75]"}`}
                  >
                    <span>Estimasi Jasa/Part:</span>
                    <span>
                      Rp{" "}
                      {(tindakan?.estimasi_biaya_min || 0).toLocaleString(
                        "id-ID",
                      )}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-[12px] p-4 flex flex-col gap-3 shadow-sm mt-1">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Kalkulator Biaya
              </h3>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-gray-600 font-medium">
              Subtotal Jasa (Dicentang)
            </span>
            <span className="font-bold text-gray-800">
              Rp {subTotalJasa.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 font-medium">
                Sparepart / Tambahan
              </span>
              <button
                onClick={handleAddSparepart}
                className="text-[10px] font-bold text-[#1D9E75] bg-[#E1F5EE] px-2 py-1 rounded flex items-center gap-1 hover:bg-[#1D9E75] hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" /> Tambah Item
              </button>
            </div>

            {spareparts.map((sp) => (
              <div key={sp.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nama barang..."
                  value={sp.namaBarang}
                  onChange={(e) =>
                    handleSparepartChange(sp.id, "namaBarang", e.target.value)
                  }
                  className="flex-1 bg-white border border-gray-300 rounded-md px-2 py-1.5 text-[16px] text-[#1A1A1A] outline-none focus:border-[#1D9E75]"
                />
                <div className="relative w-[110px]">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-gray-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={sp.harga}
                    onChange={(e) =>
                      handleSparepartChange(sp.id, "harga", e.target.value)
                    }
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 rounded-md pl-7 pr-2 py-1.5 text-[16px] font-bold text-[#1A1A1A] text-right outline-none focus:border-[#1D9E75]"
                  />
                </div>
                <button
                  onClick={() => handleRemoveSparepart(sp.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
              (-) Diskon / Potongan
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-400">
                Rp
              </span>
              <input
                type="text"
                className="w-[120px] bg-white border border-gray-300 rounded-md pl-8 pr-2 py-1.5 text-[16px] font-bold text-right text-red-600 outline-none focus:border-red-400 transition-colors"
                value={diskon}
                onChange={handleDiskonChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-1">
            <span className="text-sm font-extrabold text-[#1A1A1A]">
              Total Kesepakatan
            </span>
            <span className="text-lg font-extrabold text-[#1D9E75]">
              Rp {finalTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {}
        {aiResult?.catatan_mekanik && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-[12px] p-3 flex gap-3 items-start mt-2">
            <span className="text-lg">💡</span>
            <p className="text-xs text-yellow-800 font-medium leading-relaxed">
              <span className="font-bold block mb-1">Catatan Mekanik:</span>
              {aiResult.catatan_mekanik}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4 mb-2">
          <Button
            onClick={handleCreateWA}
            className="bg-[#534AB7] hover:bg-[#433B9B]"
          >
            <MessageSquare className="w-5 h-5" />
            Lanjut Buat Pesan WA
          </Button>
          <Button onClick={handleSaveToHistory} variant="secondary">
            <Save className="w-5 h-5 text-gray-600" />
            Simpan Langsung ke Histori
          </Button>
        </div>
      </main>
    );
  }

  return null;
}
