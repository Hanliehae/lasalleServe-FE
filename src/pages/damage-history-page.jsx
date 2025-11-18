import { useState } from "react";
import { useAuth } from "../context/auth-context.jsx";
import { mockDamageReports, mockAssets } from "../lib/mock-data.js";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { ImageWithFallback } from "../components/common/ImageWithFallback.jsx";
import {
  Calendar,
  Eye,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
  Pie,
  Cell,
} from "recharts";

export function DamageHistoryPage() {
  const [timePeriod, setTimePeriod] = useState("30");

  // Filter reports based on time period
  const getFilteredReports = () => {
    const now = new Date();
    const daysAgo = new Date(
      now.getTime() - parseInt(timePeriod) * 24 * 60 * 60 * 1000
    );

    // Asumsi mockDamageReports dan report.createdAt tersedia
    if (!mockDamageReports) return [];

    return mockDamageReports.filter(
      (report) => new Date(report.createdAt) >= daysAgo
    );
  };

  const filteredReports = getFilteredReports();

  // Group by priority
  const priorityStats = filteredReports.reduce(
    (acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    },
    { tinggi: 0, sedang: 0, rendah: 0 }
  );

  // Group by status
  const statusStats = filteredReports.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { menunggu: 0, dalam_perbaikan: 0, selesai: 0 }
  );

  // Group by most damaged facilities
  const facilityDamageStats = filteredReports.reduce((acc, report) => {
    // Cari aset berdasarkan ID
    const asset = mockAssets.find((a) => a.id === report.assetId);

    // Hanya hitung fasilitas, bukan ruangan
    if (asset && asset.category === "fasilitas") {
      acc[asset.name] = (acc[asset.name] || 0) + 1;
    }
    return acc;
  }, {}); // Menghilangkan anotasi tipe TypeScript

  // Sort by count and get top 5
  const topDamagedFacilities = Object.entries(facilityDamageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Data for charts
  const priorityChartData = [
    { name: "Tinggi", value: priorityStats.tinggi, fill: "#ef4444" },
    { name: "Sedang", value: priorityStats.sedang, fill: "#f59e0b" },
    { name: "Rendah", value: priorityStats.rendah, fill: "#10b981" },
  ];

  const statusChartData = [
    { name: "Menunggu", value: statusStats.menunggu },
    { name: "Dalam Perbaikan", value: statusStats.dalam_perbaikan },
    { name: "Selesai", value: statusStats.selesai },
  ];

  const facilityDamageChartData = topDamagedFacilities.map(([name, count]) => ({
    name: name.length > 20 ? name.substring(0, 20) + "..." : name,
    value: count,
  }));

  // Trend data (reports per week)
  const getTrendData = () => {
    const periodDays = parseInt(timePeriod);
    const weeks = periodDays / 7;
    const data = [];

    // Loop dari minggu paling awal hingga minggu sekarang
    for (let i = Math.ceil(weeks) - 1; i >= 0; i--) {
      // weekEnd adalah hari terakhir dari periode (misal: Hari Ini jika i=0, 7 hari lalu jika i=1, dst)
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);

      // weekStart adalah 7 hari sebelum weekEnd
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

      const count = mockDamageReports.filter((r) => {
        const date = new Date(r.createdAt);
        // Hitung laporan yang jatuh dalam rentang [weekStart, weekEnd)
        return date >= weekStart && date < weekEnd;
      }).length;

      // Nama minggu disesuaikan agar urutan chart benar (Minggu 1, Minggu 2, ...)
      data.push({
        week: `Minggu ${Math.ceil(weeks) - i}`,
        laporan: count,
      });
    }
    return data;
  };

  const trendData = getTrendData();

  const getPriorityBadge = (priority) => {
    const variants = {
      rendah: { variant: "secondary", label: "Rendah" },
      sedang: { variant: "default", label: "Sedang" },
      tinggi: { variant: "destructive", label: "Tinggi" },
    };
    return variants[priority] || { variant: "default", label: priority };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Kerusakan</h1>
        <p className="text-muted-foreground mt-2">
          Analisis dan statistik laporan kerusakan aset
        </p>
      </div>

      {/* Time Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Periode Waktu</CardTitle>
          <CardDescription>
            Pilih periode untuk melihat statistik kerusakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Hari Terakhir</SelectItem>
              <SelectItem value="30">30 Hari Terakhir</SelectItem>
              <SelectItem value="90">90 Hari Terakhir</SelectItem>
              <SelectItem value="180">6 Bulan Terakhir</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Dalam {timePeriod} hari terakhir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prioritas Tinggi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priorityStats.tinggi}</div>
            <p className="text-xs text-muted-foreground">
              Memerlukan perhatian segera
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.menunggu}</div>
            <p className="text-xs text-muted-foreground">Belum ditangani</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.selesai}</div>
            <p className="text-xs text-muted-foreground">Sudah diperbaiki</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Prioritas</CardTitle>
            <CardDescription>
              Jumlah laporan berdasarkan tingkat prioritas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Laporan</CardTitle>
            <CardDescription>
              Distribusi status penanganan laporan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Laporan Kerusakan</CardTitle>
          <CardDescription>
            Perkembangan jumlah laporan per minggu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="laporan"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Damaged Facilities */}
      <Card>
        <CardHeader>
          <CardTitle>Fasilitas Paling Sering Rusak</CardTitle>
          <CardDescription>
            5 fasilitas dengan laporan kerusakan terbanyak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facilityDamageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
