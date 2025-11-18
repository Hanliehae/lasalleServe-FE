import { useAuth } from '../../lib/auth-context';
import { mockLoans, mockDamageReports, mockAssets } from '../../lib/mock-data';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Download, FileText, Package, AlertTriangle, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function ExportPage() {
  const { user } = useAuth();

  const canExport = user?.role === 'kepala_buf' || user?.role === 'admin_buf';

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

  const loansByMonth = [
    { bulan: 'Jan', total: 12 },
    { bulan: 'Feb', total: 19 },
    { bulan: 'Mar', total: 15 },
    { bulan: 'Apr', total: 22 },
    { bulan: 'Mei', total: 18 },
    { bulan: 'Jun', total: 25 },
  ];

  const assetsByCategory = [
    { name: 'Ruangan', value: mockAssets.filter(a => a.category === 'ruangan').length },
    { name: 'Fasilitas', value: mockAssets.filter(a => a.category === 'fasilitas').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExport = (type: string) => {
    // Mock export - in real app, call API to generate CSV/PDF
    alert(`Mengekspor laporan ${type}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Laporan & Ekspor Data</h1>
        <p className="text-muted-foreground mt-2">
          Lihat ringkasan dan ekspor data BUF
        </p>
      </div>

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
            <CardTitle className="text-muted-foreground">Total Peminjaman</CardTitle>
            <ClipboardList className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{mockLoans.length}</div>
            <p className="text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-muted-foreground">Laporan Kerusakan</CardTitle>
            <AlertTriangle className="size-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{mockDamageReports.length}</div>
            <p className="text-muted-foreground">
              {mockDamageReports.filter(r => r.status === 'menunggu').length} belum selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-muted-foreground">Tingkat Utilisasi</CardTitle>
            <FileText className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">78%</div>
            <p className="text-muted-foreground">Rata-rata bulanan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peminjaman per Bulan</CardTitle>
            <CardDescription>Tren peminjaman 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loansByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Aset</CardTitle>
            <CardDescription>Breakdown aset berdasarkan kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ekspor Laporan</CardTitle>
          <CardDescription>
            Download laporan dalam format CSV atau PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => handleExport('peminjaman')}
            >
              <Download className="mb-2 size-5" />
              <div className="text-left">
                <p>Laporan Peminjaman</p>
                <p className="text-muted-foreground mt-1">
                  Data peminjaman lengkap dengan status
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => handleExport('kerusakan')}
            >
              <Download className="mb-2 size-5" />
              <div className="text-left">
                <p>Laporan Kerusakan</p>
                <p className="text-muted-foreground mt-1">
                  Riwayat dan status kerusakan aset
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4"
              onClick={() => handleExport('inventori')}
            >
              <Download className="mb-2 size-5" />
              <div className="text-left">
                <p>Laporan Inventori</p>
                <p className="text-muted-foreground mt-1">
                  Stok dan kondisi semua aset
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
