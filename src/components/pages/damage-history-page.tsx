import { useState } from 'react';
import { mockDamageReports, mockAssets } from '../../lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Eye, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

type TimePeriod = '7' | '30' | '60' | '90';

export function DamageHistoryPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30');

  // Filter reports based on time period
  const getFilteredReports = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(timePeriod) * 24 * 60 * 60 * 1000);
    return mockDamageReports.filter(report => new Date(report.createdAt) >= daysAgo);
  };

  const filteredReports = getFilteredReports();

  // Group by priority
  const priorityStats = {
    tinggi: filteredReports.filter(r => r.priority === 'tinggi').length,
    sedang: filteredReports.filter(r => r.priority === 'sedang').length,
    rendah: filteredReports.filter(r => r.priority === 'rendah').length,
  };

  // Group by status
  const statusStats = {
    menunggu: filteredReports.filter(r => r.status === 'menunggu').length,
    dalam_perbaikan: filteredReports.filter(r => r.status === 'dalam_perbaikan').length,
    selesai: filteredReports.filter(r => r.status === 'selesai').length,
  };

  // Group by most damaged facilities
  const facilityDamageStats = filteredReports.reduce((acc, report) => {
    const asset = mockAssets.find(a => a.id === report.assetId);
    // Only count facilities, not rooms
    if (asset && asset.category === 'fasilitas') {
      acc[asset.name] = (acc[asset.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Sort by count and get top 5
  const topDamagedFacilities = Object.entries(facilityDamageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Data for charts
  const priorityChartData = [
    { name: 'Tinggi', value: priorityStats.tinggi, fill: '#ef4444' },
    { name: 'Sedang', value: priorityStats.sedang, fill: '#f59e0b' },
    { name: 'Rendah', value: priorityStats.rendah, fill: '#10b981' },
  ];

  const statusChartData = [
    { name: 'Menunggu', value: statusStats.menunggu },
    { name: 'Dalam Perbaikan', value: statusStats.dalam_perbaikan },
    { name: 'Selesai', value: statusStats.selesai },
  ];

  const facilityDamageChartData = topDamagedFacilities.map(([name, count]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value: count,
  }));

  // Trend data (reports per week)
  const getTrendData = () => {
    const weeks = parseInt(timePeriod) / 7;
    const data = [];
    for (let i = Math.ceil(weeks) - 1; i >= 0; i--) {
      const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(Date.now() - (i - 1) * 7 * 24 * 60 * 60 * 1000);
      const count = mockDamageReports.filter(r => {
        const date = new Date(r.createdAt);
        return date >= weekStart && date < weekEnd;
      }).length;
      data.push({
        week: `Minggu ${Math.ceil(weeks) - i}`,
        laporan: count,
      });
    }
    return data;
  };

  const trendData = getTrendData();

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      'rendah': { variant: 'secondary', label: 'Rendah' },
      'sedang': { variant: 'default', label: 'Sedang' },
      'tinggi': { variant: 'destructive', label: 'Tinggi' },
    };
    return <Badge variant={variants[priority].variant}>{variants[priority].label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      'menunggu': { variant: 'secondary', label: 'Menunggu' },
      'dalam_perbaikan': { variant: 'default', label: 'Dalam Perbaikan' },
      'selesai': { variant: 'default', label: 'Selesai' },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Riwayat Kerusakan</h1>
          <p className="text-muted-foreground mt-2">
            Analisis dan pemantauan laporan kerusakan aset
          </p>
        </div>
        <Select value={timePeriod} onValueChange={(v: TimePeriod) => setTimePeriod(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Hari Terakhir</SelectItem>
            <SelectItem value="30">30 Hari Terakhir</SelectItem>
            <SelectItem value="60">60 Hari Terakhir</SelectItem>
            <SelectItem value="90">90 Hari Terakhir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Laporan</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredReports.length}</div>
            <p className="text-xs text-muted-foreground">
              dalam {timePeriod} hari terakhir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Prioritas Tinggi</CardTitle>
            <TrendingUp className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{priorityStats.tinggi}</div>
            <p className="text-xs text-muted-foreground">
              {priorityStats.tinggi > 0 ? 'Perlu perhatian segera' : 'Tidak ada'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Dalam Perbaikan</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{statusStats.dalam_perbaikan}</div>
            <p className="text-xs text-muted-foreground">
              sedang ditangani
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Selesai</CardTitle>
            <Calendar className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{statusStats.selesai}</div>
            <p className="text-xs text-muted-foreground">
              sudah diperbaiki
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Laporan Kerusakan</CardTitle>
            <CardDescription>Jumlah laporan per minggu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="laporan" stroke="#eab308" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Prioritas</CardTitle>
            <CardDescription>Berdasarkan tingkat prioritas</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
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

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Perbaikan</CardTitle>
            <CardDescription>Berdasarkan status penanganan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Facility Damage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Fasilitas Terdampak</CardTitle>
            <CardDescription>Berdasarkan jumlah kerusakan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={facilityDamageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Laporan</CardTitle>
          <CardDescription>Daftar lengkap laporan kerusakan dengan foto bukti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada laporan dalam periode ini
              </p>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3>{report.assetName}</h3>
                        {getPriorityBadge(report.priority)}
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Dilaporkan oleh: {report.reporterName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tanggal: {new Date(report.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 size-4" />
                          Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detail Laporan Kerusakan</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Aset</p>
                              <p>{report.assetName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Pelapor</p>
                              <p>{report.reporterName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Prioritas</p>
                              <div>{getPriorityBadge(report.priority)}</div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <div>{getStatusBadge(report.status)}</div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Deskripsi Kerusakan</p>
                            <p className="border rounded-md p-3 bg-muted/50">{report.description}</p>
                          </div>

                          {report.assignedTo && (
                            <div>
                              <p className="text-sm text-muted-foreground">Ditangani oleh</p>
                              <p>{report.assignedTo}</p>
                            </div>
                          )}

                          {report.photoUrl ? (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Foto Bukti</p>
                              <div className="border rounded-md overflow-hidden">
                                <ImageWithFallback
                                  src={report.photoUrl}
                                  alt={`Foto kerusakan ${report.assetName}`}
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
                              Tidak ada foto bukti
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Dibuat</p>
                              <p>{new Date(report.createdAt).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Terakhir diupdate</p>
                              <p>{new Date(report.updatedAt).toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div>
                    <p className="text-sm">{report.description}</p>
                  </div>

                  {report.photoUrl && (
                    <div className="flex gap-2">
                      <div className="w-24 h-24 border rounded-md overflow-hidden">
                        <ImageWithFallback
                          src={report.photoUrl}
                          alt="Foto kerusakan"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}