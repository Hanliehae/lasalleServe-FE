import { useAuth } from "../context/auth-context.jsx";
import {
  mockLoans,
  mockDamageReports,
  mockAssets,
  getAcademicYearOptions,
  getAcademicYear,
  getSemesterOptions,
  getSemesterFromDate,
} from "../lib/mock-data.js";
import { Button } from "../components/ui/button";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Download,
  FileText,
  Package,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

// Tambahkan fungsi ini jika tidak ada di mock-data
const academicYearOptions = getAcademicYearOptions?.() || [
  "2023/2024",
  "2024/2025",
  "2025/2026",
];
const semesterOptions = getSemesterOptions();

export function ExportPage() {
  const { user } = useAuth();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    getAcademicYear?.() || "2024/2025"
  );
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [reportType, setReportType] = useState("peminjaman");

  const canExport = user?.role === "kepala_buf" || user?.role === "admin_buf";

  if (!canExport) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Anda tidak memiliki akses ke halaman ini
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fungsi bantu untuk mendapatkan tahun ajaran dari tanggal
  const getAcademicYearFromDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Asumsi tahun ajaran Juli-Juni
    if (month >= 7) {
      return `${year}/${year + 1}`;
    } else {
      return `${year - 1}/${year}`;
    }
  };

  // Data untuk berbagai jenis laporan dengan filter semester
  const getReportData = () => {
    const year = selectedAcademicYear;
    const semester = selectedSemester;

    let data = [];

    switch (reportType) {
      case "peminjaman":
        data = mockLoans.filter((loan) => {
          const yearMatch =
            loan.academicYear === year ||
            (loan.createdAt &&
              getAcademicYearFromDate(loan.createdAt) === year);
          const semesterMatch =
            semester === "all" ||
            loan.semester === semester ||
            (loan.createdAt &&
              getSemesterFromDate(loan.createdAt) === semester);
          return yearMatch && semesterMatch;
        });
        break;
      case "pengembalian":
        data = mockLoans.filter((loan) => {
          const yearMatch =
            loan.status === "selesai" &&
            (loan.academicYear === year ||
              (loan.returnedAt &&
                getAcademicYearFromDate(loan.returnedAt) === year));
          const semesterMatch =
            semester === "all" ||
            loan.semester === semester ||
            (loan.returnedAt &&
              getSemesterFromDate(loan.returnedAt) === semester);
          return yearMatch && semesterMatch;
        });
        break;
      case "kerusakan":
        data = mockDamageReports.filter((report) => {
          const yearMatch =
            report.academicYear === year ||
            (report.createdAt &&
              getAcademicYearFromDate(report.createdAt) === year);
          const semesterMatch =
            semester === "all" ||
            report.semester === semester ||
            (report.createdAt &&
              getSemesterFromDate(report.createdAt) === semester);
          return yearMatch && semesterMatch;
        });
        break;
      case "aset_masuk":
        data = generateAssetInData(year).filter((asset) => {
          if (semester === "all") return true;
          // Aset masuk biasanya di semester ganjil (awal tahun ajaran)
          return semester === "ganjil";
        });
        break;
      case "aset_keluar":
        data = generateAssetOutData(year).filter((asset) => {
          if (semester === "all") return true;
          // Gunakan tanggal selesai untuk menentukan semester
          if (asset.tanggal_selesai) {
            return getSemesterFromDate(asset.tanggal_selesai) === semester;
          }
          return true;
        });
        break;
      default:
        data = [];
    }

    return data;
  };

  // Generate data aset masuk (mock)
  const generateAssetInData = (year) => {
    return mockAssets
      .filter((asset) => asset.acquisitionYear === year)
      .map((asset) => ({
        id: asset.id,
        name: asset.name,
        category: asset.category,
        acquisitionDate: asset.acquisitionDate || `${year}-01-15`,
        quantity: asset.totalStock,
        location: asset.location,
        condition: asset.condition,
      }));
  };

  // Generate data aset keluar (mock)
  const generateAssetOutData = (year) => {
    return mockLoans
      .filter(
        (loan) =>
          loan.status === "selesai" &&
          (loan.academicYear === year ||
            (loan.returnedAt &&
              getAcademicYearFromDate(loan.returnedAt) === year))
      )
      .flatMap((loan) => [
        ...(loan.roomId
          ? [
              {
                id: loan.roomId,
                name: loan.roomName,
                type: "ruangan",
                borrower: loan.borrowerName,
                startDate: loan.startDate,
                endDate: loan.endDate,
                status: "dikembalikan",
              },
            ]
          : []),
        ...loan.facilities.map((facility) => ({
          id: facility.id,
          name: facility.name,
          type: "fasilitas",
          borrower: loan.borrowerName,
          startDate: loan.startDate,
          endDate: loan.endDate,
          quantity: facility.quantity,
          status: "dikembalikan",
        })),
      ]);
  };

  // Fungsi handleExport yang diperbaiki
  const handleExport = (
    format,
    type = reportType,
    academicYear = selectedAcademicYear
  ) => {
    const data = getReportData();

    if (data.length === 0) {
      alert(`Tidak ada data untuk laporan ${type} tahun ${academicYear}`);
      return;
    }

    if (format === "csv") {
      exportToCSV(data, type, academicYear);
    } else if (format === "pdf") {
      exportToPDF(data, type, academicYear);
    }
  };

  // Fungsi ekspor ke CSV
  const exportToCSV = (data, type, academicYear) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => `"${String(row[header] || "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan_${type}_${academicYear}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fungsi ekspor ke PDF (simulasi)
  const exportToPDF = (data, type, academicYear) => {
    const printWindow = window.open("", "_blank");
    const content = `
      <html>
        <head>
          <title>Laporan ${type} - ${academicYear}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan ${getReportTypeLabel(type)}</h1>
            <h2>Tahun Ajaran: ${academicYear} - Semester: ${
      selectedSemester === "all"
        ? "Semua Semester"
        : semesterOptions.find((s) => s.value === selectedSemester)?.label
    }</h2>
            <p>Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {})
                  .map((key) => `<th>${key.toUpperCase()}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) => `
                <tr>
                  ${Object.values(row)
                    .map((value) => `<td>${value}</td>`)
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      peminjaman: "Peminjaman",
      pengembalian: "Pengembalian",
      kerusakan: "Kerusakan",
      aset_masuk: "Aset Masuk",
      aset_keluar: "Aset Keluar",
    };
    return labels[type] || type;
  };

  const reportData = getReportData();

  return (
    <div className="space-y-6">
      <div>
        <h1>Laporan & Ekspor Data</h1>
        <p className="text-muted-foreground mt-2">
          Lihat ringkasan dan ekspor data BUF
        </p>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-muted-foreground">Total Aset</CardTitle>
            <Package className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{mockAssets.length}</div>
            <p className="text-muted-foreground">6 kategori berbeda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-muted-foreground">
              Peminjaman Aktif
            </CardTitle>
            <ClipboardList className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">
              {mockLoans.filter((l) => l.status === "disetujui").length}
            </div>
            <p className="text-muted-foreground">Sedang dipinjam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-muted-foreground">
              Laporan Kerusakan
            </CardTitle>
            <AlertTriangle className="size-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{mockDamageReports.length}</div>
            <p className="text-muted-foreground">Perlu penanganan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-muted-foreground">
              Tahun Ajaran
            </CardTitle>
            <FileText className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{selectedAcademicYear}</div>
            <p className="text-muted-foreground">Aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Laporan dengan Semester */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>
            Pilih tahun ajaran, semester, dan jenis laporan untuk diekspor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <Label htmlFor="academic-year">Tahun Ajaran</Label>
              <Select
                value={selectedAcademicYear}
                onValueChange={setSelectedAcademicYear}
              >
                <SelectTrigger className="w-[200px]" id="academic-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicYearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-[200px]" id="semester">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-type">Jenis Laporan</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[200px]" id="report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peminjaman">Laporan Peminjaman</SelectItem>
                  <SelectItem value="pengembalian">
                    Laporan Pengembalian
                  </SelectItem>
                  <SelectItem value="kerusakan">Laporan Kerusakan</SelectItem>
                  <SelectItem value="aset_masuk">Aset Masuk</SelectItem>
                  <SelectItem value="aset_keluar">Aset Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Data dengan Info Semester */}
      <Card>
        <CardHeader>
          <CardTitle>Pratinjau Data</CardTitle>
          <CardDescription>
            {selectedAcademicYear} - Semester:{" "}
            {selectedSemester === "all"
              ? "Semua Semester"
              : semesterOptions.find((s) => s.value === selectedSemester)
                  ?.label}{" "}
            - Jenis: {getReportTypeLabel(reportType)}
            {` (${reportData.length} data ditemukan)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data untuk laporan ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(reportData[0]).map((key) => (
                      <th key={key} className="text-left p-2 font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.length > 5 && (
                <p className="text-muted-foreground text-sm mt-2">
                  Menampilkan 5 dari {reportData.length} records
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ekspor Laporan */}
      <Card>
        <CardHeader>
          <CardTitle>Ekspor Laporan</CardTitle>
          <CardDescription>
            Export data dalam format CSV atau PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport("csv")}
              disabled={reportData.length === 0}
            >
              <Download className="mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => handleExport("pdf")}
              disabled={reportData.length === 0}
            >
              <FileText className="mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
