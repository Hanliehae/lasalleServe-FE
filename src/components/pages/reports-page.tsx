import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { mockDamageReports, mockAssets, DamageReport } from '../../lib/mock-data';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Search, AlertTriangle, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState(mockDamageReports);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canManage = user?.role === 'staf_buf' || user?.role === 'admin_buf';

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.assetName.toLowerCase().includes(search.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateReport = (data: Partial<DamageReport>) => {
    const newReport: DamageReport = {
      id: `r${reports.length + 1}`,
      assetId: data.assetId || '',
      assetName: mockAssets.find(a => a.id === data.assetId)?.name || '',
      reportedBy: user?.id || '',
      reporterName: user?.name || '',
      description: data.description || '',
      priority: data.priority || 'sedang',
      status: 'menunggu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReports([...reports, newReport]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateStatus = (id: string, status: DamageReport['status']) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
    ));
  };

  const handleUpdatePriority = (id: string, priority: DamageReport['priority']) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, priority, updatedAt: new Date().toISOString() } : r
    ));
  };

  const getStatusBadge = (status: DamageReport['status']) => {
    const variants: Record<DamageReport['status'], { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      'menunggu': { variant: 'secondary', label: 'Menunggu' },
      'dalam_perbaikan': { variant: 'default', label: 'Dalam Perbaikan' },
      'selesai': { variant: 'default', label: 'Selesai' },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  const getPriorityBadge = (priority: DamageReport['priority']) => {
    const variants: Record<DamageReport['priority'], { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      'rendah': { variant: 'secondary', label: 'Rendah' },
      'sedang': { variant: 'default', label: 'Sedang' },
      'tinggi': { variant: 'destructive', label: 'Tinggi' },
    };
    return <Badge variant={variants[priority].variant}>{variants[priority].label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Laporan Kerusakan</h1>
          <p className="text-muted-foreground mt-2">
            Kelola laporan kerusakan aset
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Lapor Kerusakan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lapor Kerusakan Aset</DialogTitle>
              <DialogDescription>
                Laporkan kerusakan yang ditemukan pada aset
              </DialogDescription>
            </DialogHeader>
            <ReportForm onSubmit={handleCreateReport} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="size-5 text-muted-foreground" />
              <Input
                placeholder="Cari aset atau pelapor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="dalam_perbaikan">Dalam Perbaikan</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aset</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    {canManage && <TableHead>Aksi</TableHead>}
                    {canManage && <TableHead>Detail</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 8 : 6} className="text-center text-muted-foreground">
                        Tidak ada laporan ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="size-4 text-orange-600" />
                            {report.assetName}
                          </div>
                        </TableCell>
                        <TableCell>{report.reporterName}</TableCell>
                        <TableCell>
                          <p className="max-w-xs truncate">{report.description}</p>
                        </TableCell>
                        <TableCell>
                          {canManage ? (
                            <Select
                              value={report.priority}
                              onValueChange={(value: DamageReport['priority']) =>
                                  handleUpdatePriority(report.id, value)
                                }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rendah">Rendah</SelectItem>
                                <SelectItem value="sedang">Sedang</SelectItem>
                                <SelectItem value="tinggi">Tinggi</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            getPriorityBadge(report.priority)
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {new Date(report.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Select
                              value={report.status}
                              onValueChange={(value: DamageReport['status']) =>
                                handleUpdateStatus(report.id, value)
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="menunggu">Menunggu</SelectItem>
                                <SelectItem value="dalam_perbaikan">Dalam Perbaikan</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                        {canManage && (
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="mr-2 size-4" />
                                  Lihat
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
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReportFormProps {
  onSubmit: (data: Partial<DamageReport>) => void;
}

function ReportForm({ onSubmit }: ReportFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<DamageReport>>({
    assetId: '',
    description: '',
  });

  // Check if user can set priority (only BUF staff and admin)
  const canSetPriority = user?.role === 'staf_buf' || user?.role === 'admin_buf';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Set default priority to 'sedang' if user cannot set priority
    const submitData = {
      ...formData,
      priority: canSetPriority ? formData.priority : 'sedang',
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="asset">Pilih Aset</Label>
        <Select
          value={formData.assetId}
          onValueChange={(value) => setFormData({ ...formData, assetId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih aset yang rusak..." />
          </SelectTrigger>
          <SelectContent>
            {mockAssets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Kerusakan</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Jelaskan detail kerusakan yang ditemukan..."
          rows={4}
          required
        />
      </div>

      {canSetPriority && (
        <div className="space-y-2">
          <Label htmlFor="priority">Prioritas</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: DamageReport['priority']) =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih prioritas..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rendah">Rendah</SelectItem>
              <SelectItem value="sedang">Sedang</SelectItem>
              <SelectItem value="tinggi">Tinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="photo">Upload Foto Kerusakan (Optional)</Label>
        <Input
          id="photo"
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />
      </div>

      <Button type="submit" className="w-full">
        Kirim Laporan
      </Button>
    </form>
  );
}