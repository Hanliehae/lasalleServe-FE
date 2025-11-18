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

export function LoansPage() {
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
          const Icon = iconMap[stat.icon];
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`size-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ... sisanya UI seperti card Aksi Cepat dan Aktivitas Terbaru (salin dari TSX asli) */}
    </div>
  );
}
