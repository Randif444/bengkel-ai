"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Trash2,
  Calendar,
  Filter,
  Wallet,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getServices, deleteService, updateService } from "@/lib/storage";

/**
 * Report & History Page Component
 * Displays financial statistics, service history, and provides filtering
 * and CSV export capabilities. Implements an accordion UI for detailed views
 * including AI diagnosis, spareparts, and WhatsApp logs.
 *
 * @returns {JSX.Element} The reports dashboard view
 */
export default function LaporanPage() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [stats, setStats] = useState({
    totalPendapatan: 0,
    totalServis: 0,
    potensiPendapatan: 0,
  });

  const [expandedId, setExpandedId] = useState(null);
  const [filterBulan, setFilterBulan] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  const bulanList = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Fetch data on initial mount and when window regains focus
  useEffect(() => {
    const fetchAndSetData = () => {
      const data = getServices();
      // Sort by newest first based on ISO date string
      const sortedData = data.sort(
        (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
      );
      setServices(sortedData);
    };

    fetchAndSetData();
    window.addEventListener("focus", fetchAndSetData);
    return () => window.removeEventListener("focus", fetchAndSetData);
  }, []);

  // Re-run filters and recalculate statistics whenever data or filter criteria change
  useEffect(() => {
    let result = [...services];

    // 1. Apply Month Filter
    if (filterBulan !== "semua") {
      result = result.filter((s) => {
        const date = new Date(s.tanggal);
        return date.getMonth().toString() === filterBulan;
      });
    }

    // 2. Apply Status Filter
    if (filterStatus !== "semua") {
      result = result.filter((s) => s.status === filterStatus);
    }

    setFilteredServices(result);

    // 3. Calculate Financial Statistics based on filtered results
    let pendapatan = 0;
    let potensi = 0;

    result.forEach((s) => {
      const biaya = Number(s.total_biaya || 0);
      if (s.status === "selesai") {
        pendapatan += biaya; // Actual revenue
      } else {
        potensi += biaya; // Potential revenue (Accounts Receivable)
      }
    });

    setStats({
      totalPendapatan: pendapatan,
      potensiPendapatan: potensi,
      totalServis: result.length,
    });
  }, [services, filterBulan, filterStatus]);

  /**
   * Handles the deletion of a service record with user confirmation.
   * Prevents event bubbling to avoid triggering the accordion toggle.
   */
  const handleDelete = (e, id) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus histori servis ini? Data tidak dapat dikembalikan.",
    );
    if (confirmDelete) {
      const isSuccess = deleteService(id);
      if (isSuccess) setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  /**
   * Marks a service record as completed (payment received).
   */
  const handleMarkSelesai = (e, id) => {
    e.stopPropagation();
    const confirmSelesai = window.confirm(
      "Kendaraan sudah selesai diperbaiki dan sudah dibayar?",
    );
    if (confirmSelesai) {
      updateService(id, { status: "selesai" });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "selesai" } : s)),
      );
    }
  };

  /**
   * Toggles the accordion expansion for a specific service record.
   */
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /**
   * Generates and downloads a CSV file containing the currently filtered service records.
   * Includes WhatsApp number for marketing and formats currency with dot separators.
   */
  const handleExportCSV = () => {
    if (filteredServices.length === 0) {
      alert("Tidak ada data untuk diekspor pada bulan/status ini.");
      return;
    }

    const headers =
      "Tanggal,Nama Pelanggan,No WhatsApp,Plat Nomor,Merk,Keluhan,Status,Total Biaya (Rp)\n";
    const rows = filteredServices
      .map((s) => {
        const tgl = new Date(s.tanggal).toLocaleDateString("id-ID");
        // Sanitize inputs to prevent CSV formatting breaks (e.g., replace commas with semicolons)
        const keluhanBersih = s.keluhan.replace(/,/g, ";").replace(/\n/g, " ");
        // Format nominal with dots (Indonesian locale)
        const biayaTerformat = Number(s.total_biaya || 0).toLocaleString(
          "id-ID",
        );
        // Ensure WA number exists, fallback to dash if empty
        const noWa = s.no_wa || "-";

        return `"${tgl}","${s.nama_pemilik}","${noWa}","${s.plat_nomor}","${s.merk_kendaraan}","${keluhanBersih}","${s.status}","${biayaTerformat}"`;
      })
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_BengkelAI_${filterBulan !== "semua" ? bulanList[parseInt(filterBulan)] : "Semua"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="p-4 flex flex-col gap-5">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <FileText className="text-orange-500 w-6 h-6" />
          <h1 className="text-xl font-bold text-[#1A1A1A]">
            Laporan & Histori
          </h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 bg-[#E1F5EE] text-[#085041] px-3 py-1.5 rounded-full text-xs font-bold border border-[#1D9E75]/30 hover:bg-[#1D9E75] hover:text-white transition-colors"
        >
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      {/* Financial Statistics Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Actual Revenue Card */}
        <Card className="flex flex-col gap-2 bg-gradient-to-br from-[#1D9E75] to-[#085041] border-none text-white p-4 col-span-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-90">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Total Uang Masuk</span>
            </div>
            <Badge
              variant="selesai"
              className="bg-white/20 text-white border-none"
            >
              Selesai
            </Badge>
          </div>
          <span className="text-2xl font-extrabold truncate">
            Rp {Number(stats.totalPendapatan || 0).toLocaleString("id-ID")}
          </span>
        </Card>

        {/* Accounts Receivable (Potential Revenue) Card */}
        <Card className="flex flex-col gap-1 bg-yellow-50 border-yellow-200 p-3">
          <div className="flex justify-between items-center text-yellow-800">
            <span className="text-xs font-bold">Menunggu Bayaran</span>
          </div>
          <span className="text-lg font-extrabold text-yellow-900 truncate">
            Rp {Number(stats.potensiPendapatan || 0).toLocaleString("id-ID")}
          </span>
          <span className="text-[10px] text-yellow-700">
            Masih dalam proses
          </span>
        </Card>

        {/* Total Services Count Card */}
        <Card className="flex flex-col gap-1 bg-white p-3">
          <div className="flex items-center gap-1 text-[#6B7280]">
            <span className="text-xs font-bold uppercase">Total Servis</span>
          </div>
          <span className="text-lg font-extrabold text-[#1A1A1A]">
            {stats.totalServis}{" "}
            <span className="text-xs font-normal text-[#6B7280]">unit</span>
          </span>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-3 mt-1">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Bulan
          </label>
          <select
            className="w-full bg-white border border-[#D1D5DB] rounded-[16px] px-3 py-2 text-sm font-medium outline-none focus:border-[#1D9E75]"
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
          >
            <option value="semua">Semua Bulan</option>
            {bulanList.map((bln, index) => (
              <option key={index} value={index.toString()}>
                {bln}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status
          </label>
          <select
            className="w-full bg-white border border-[#D1D5DB] rounded-[16px] px-3 py-2 text-sm font-medium outline-none focus:border-[#1D9E75]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua Status</option>
            <option value="proses">Proses</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="flex flex-col gap-3 pb-4">
        <h2 className="text-sm font-bold text-[#1A1A1A] mt-2">
          Daftar Kendaraan
        </h2>

        {filteredServices.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[24px] border border-dashed border-gray-300">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-[#6B7280] font-medium">
              Belum ada data servis.
            </p>
          </div>
        ) : (
          filteredServices.map((servis) => {
            const dateObj = new Date(servis.tanggal);
            const tglFormat = `${dateObj.getDate()} ${bulanList[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            const isExpanded = expandedId === servis.id;

            return (
              <Card
                key={servis.id}
                className={`flex flex-col gap-3 transition-all cursor-pointer ${isExpanded ? "border-[#1D9E75] shadow-md ring-1 ring-[#1D9E75]/20" : "hover:border-gray-300"}`}
                onClick={() => toggleExpand(servis.id)}
              >
                {/* Card Header (Summary) */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-start gap-1 flex-1 pr-2">
                    <h3 className="font-bold text-[#1A1A1A] text-sm leading-tight">
                      {servis.nama_pemilik}
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium">
                      {servis.plat_nomor} • {servis.merk_kendaraan}
                    </p>
                    <Badge variant={servis.status} className="mt-1 capitalize">
                      {servis.status}
                    </Badge>
                  </div>

                  {/* Action Buttons Container */}
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    {servis.status === "proses" && (
                      <button
                        onClick={(e) => handleMarkSelesai(e, servis.id)}
                        // Perubahan difokuskan di sini: Diperlebar, padding ditambah, warna hijau, & ada teks
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors font-bold text-sm"
                        title="Tandai Selesai (Sudah Dibayar)"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Selesai
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, servis.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      title="Hapus Histori"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#1A1A1A] bg-gray-50 p-2 rounded-[6px] border border-gray-100 line-clamp-2">
                  <span className="font-semibold text-gray-700">Keluhan: </span>
                  {servis.keluhan}
                </div>

                <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-[#6B7280] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {tglFormat}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-extrabold text-[#1D9E75]">
                      Rp{" "}
                      {Number(servis.total_biaya || 0).toLocaleString("id-ID")}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Accordion Detail Content */}
                {isExpanded && (
                  <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {/* Render AI Diagnosis Explanation */}
                    {servis.analisis_ai?.penjelasan_awam && (
                      <div>
                        <span className="text-[11px] font-bold text-[#085041] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                          <Wrench className="w-3 h-3" /> Analisis Mekanik
                        </span>
                        <p className="text-xs text-[#1A1A1A] leading-relaxed bg-[#E1F5EE] p-3 rounded-lg border border-[#1D9E75]/20">
                          {servis.analisis_ai.penjelasan_awam}
                        </p>
                      </div>
                    )}

                    {/* Render Selected Services */}
                    {servis.tindakan_dipilih &&
                      servis.tindakan_dipilih.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                            Tindakan Dikerjakan:
                          </span>
                          <div className="flex flex-col gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            {servis.tindakan_dipilih.map((t, i) => (
                              <div
                                key={i}
                                className="flex gap-2 items-start text-xs text-gray-700"
                              >
                                <span className="text-[#1D9E75] mt-0.5">•</span>
                                <span>{t.nama}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Render Additional Items / Spareparts */}
                    {servis.spareparts && servis.spareparts.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                          Item Tambahan / Sparepart:
                        </span>
                        <div className="flex flex-col gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {servis.spareparts.map((sp, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-start text-xs text-gray-700"
                            >
                              <div className="flex gap-2">
                                <span className="text-orange-500 mt-0.5">
                                  •
                                </span>
                                <span>
                                  {sp.namaBarang || "Item Tanpa Nama"}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {/* Remove existing dots from formatted input to safely parse as number */}
                                Rp{" "}
                                {Number(
                                  sp.harga.toString().replace(/\./g, "") || 0,
                                ).toLocaleString("id-ID")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Render Discount if applied */}
                    {servis.diskon > 0 && (
                      <div className="flex justify-between items-center bg-red-50 p-2 rounded-lg border border-red-100 text-xs">
                        <span className="font-bold text-red-700">
                          Diskon Diberikan:
                        </span>
                        <span className="font-bold text-red-700">
                          - Rp {Number(servis.diskon).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    {/* Render Generated WhatsApp Log */}
                    {servis.pesan_wa && (
                      <div>
                        <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                          <MessageSquare className="w-3 h-3" /> Log WhatsApp
                        </span>
                        <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#14532d] bg-[#DCF8C6] p-3 rounded-lg border border-[#B7E3A1]/50">
                          {servis.pesan_wa}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
