import React from "react";

// (Mock imports as in original TSX — keep or replace with real project imports)
const useAuth = () => ({
  user: { name: "Pengguna Sistem", role: "admin_buf" },
});
const getMockDashboardStats = (role) => {
  if (role === "kepala_buf")
    return {
      totalAssets: 1500,
      totalReports: 45,
      totalLoans: 320,
      lowStockAssets: 12,
    };
  if (role === "admin_buf")
    return {
      totalAssets: 1500,
      pendingLoans: 15,
      activeLoans: 60,
      pendingReports: 8,
    };
  if (role === "staf_buf")
    return {
      pendingLoans: 15,
      pendingReports: 8,
      activeLoans: 60,
      overdueLoans: 5,
    };
  return {
    activeLoans: 3,
    pendingLoans: 2,
    totalAssets: 1500,
    totalReports: 5,
  };
};

const Card = ({ children }) => (
  <div className="border rounded-lg shadow-sm">{children}</div>
);
const CardHeader = ({ children, className }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }) => (
  <h3 className={`text-sm font-medium ${className}`}>{children}</h3>
);
const CardDescription = ({ children }) => (
  <p className="text-sm text-gray-500">{children}</p>
);
const CardContent = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Package = ({ className }) => (
  <span className={`mr-1 ${className}`}>📦</span>
);
const ClipboardList = ({ className }) => (
  <span className={`mr-1 ${className}`}>📋</span>
);
const AlertTriangle = ({ className }) => (
  <span className={`mr-1 ${className}`}>⚠️</span>
);
const Clock = ({ className }) => (
  <span className={`mr-1 ${className}`}>🕒</span>
);
const TrendingDown = ({ className }) => (
  <span className={`mr-1 ${className}`}>📉</span>
);

export function DashboardPage() {
  const { user } = useAuth();
  const stats = getMockDashboardStats(user?.role || "");
  const iconMap = {
    Package,
    ClipboardList,
    AlertTriangle,
    Clock,
    TrendingDown,
  };

  const getStatsCards = () => {
    const role = user?.role;
    if (role === "kepala_buf") {
      return [
        {
          title: "Total Aset",
          value: stats.totalAssets,
          icon: "Package",
          color: "text-blue-600",
        },
        {
          title: "Total Peminjaman",
          value: stats.totalLoans,
          icon: "ClipboardList",
          color: "text-green-600",
        },
        {
          title: "Laporan Kerusakan",
          value: stats.totalReports,
          icon: "AlertTriangle",
          color: "text-orange-600",
        },
        {
          title: "Stok Rendah",
          value: stats.lowStockAssets,
          icon: "TrendingDown",
          color: "text-red-600",
        },
      ];
    }
    if (role === "admin_buf") {
      return [
        {
          title: "Total Aset",
          value: stats.totalAssets,
          icon: "Package",
          color: "text-blue-600",
        },
        {
          title: "Permintaan Pending",
          value: stats.pendingLoans,
          icon: "Clock",
          color: "text-yellow-600",
        },
        {
          title: "Peminjaman Aktif",
          value: stats.activeLoans,
          icon: "ClipboardList",
          color: "text-green-600",
        },
        {
          title: "Laporan Pending",
          value: stats.pendingReports,
          icon: "AlertTriangle",
          color: "text-red-600",
        },
      ];
    }
    if (role === "staf_buf") {
      return [
        {
          title: "Permintaan Baru",
          value: stats.pendingLoans,
          icon: "Clock",
          color: "text-yellow-600",
        },
        {
          title: "Kerusakan Baru",
          value: stats.pendingReports,
          icon: "AlertTriangle",
          color: "text-red-600",
        },
        {
          title: "Pinjaman Aktif",
          value: stats.activeLoans,
          icon: "ClipboardList",
          color: "text-green-600",
        },
        {
          title: "Pinjaman Jatuh Tempo",
          value: stats.overdueLoans,
          icon: "Clock",
          color: "text-orange-600",
        },
      ];
    }
    return [
      {
        title: "Peminjaman Aktif",
        value: stats.activeLoans,
        icon: "ClipboardList",
        color: "text-green-600",
      },
      {
        title: "Permintaan Pending",
        value: stats.pendingLoans,
        icon: "Clock",
        color: "text-yellow-600",
      },
      {
        title: "Total Aset Tersedia",
        value: stats.totalAssets,
        icon: "Package",
        color: "text-blue-600",
      },
      {
        title: "Laporan Saya",
        value: stats.totalReports,
        icon: "AlertTriangle",
        color: "text-orange-600",
      },
    ];
  };

  const statsCards = getStatsCards();

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Selamat datang, {user?.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`size-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Fitur yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(user?.role === "civitas" ||
              user?.role === "mahasiswa" ||
              user?.role === "dosen" ||
              user?.role === "staf") && (
              <>
                <button className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <p>Ajukan Peminjaman Baru</p>
                  <p className="text-muted-foreground mt-1">
                    Pilih aset dan buat permintaan peminjaman
                  </p>
                </button>
                <button className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <p>Lapor Kerusakan</p>
                  <p className="text-muted-foreground mt-1">
                    Laporkan kerusakan aset yang ditemukan
                  </p>
                </button>
              </>
            )}
            {(user?.role === "staf_buf" || user?.role === "admin_buf") && (
              <>
                <button className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <p>Validasi Peminjaman</p>
                  <p className="text-muted-foreground mt-1">
                    Review dan approve permintaan peminjaman
                  </p>
                </button>
                <button className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <p>Kelola Aset</p>
                  <p className="text-muted-foreground mt-1">
                    Tambah atau update data aset
                  </p>
                </button>
              </>
            )}
            {user?.role === "kepala_buf" && (
              <>
                <button className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <p>Ekspor Laporan</p>
                  <p className="text-muted-foreground mt-1">
                    Download laporan peminjaman dan kerusakan
                  </p>
                </button>
                <button className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <p>Lihat Ringkasan</p>
                  <p className="text-muted-foreground mt-1">
                    Analisis data peminjaman dan aset
                  </p>
                </button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Update terkini sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-green-600 mt-2" />
              <div className="flex-1">
                <p>Peminjaman disetujui</p>
                <p className="text-muted-foreground">
                  Ruang Seminar A - 2 jam yang lalu
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-yellow-600 mt-2" />
              <div className="flex-1">
                <p>Permintaan baru masuk</p>
                <p className="text-muted-foreground">
                  Proyektor LCD (2 unit) - 3 jam yang lalu
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-red-600 mt-2" />
              <div className="flex-1">
                <p>Laporan kerusakan</p>
                <p className="text-muted-foreground">
                  Laptop Dell - 5 jam yang lalu
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-2 rounded-full bg-blue-600 mt-2" />
              <div className="flex-1">
                <p>Aset dikembalikan</p>
                <p className="text-muted-foreground">
                  Sound System - 1 hari yang lalu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
