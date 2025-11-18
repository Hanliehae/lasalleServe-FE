import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { mockLoans } from '../../lib/mock-data';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function HistoryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  const canViewAll = user?.role === 'admin_buf' || user?.role === 'staf_buf';

  // Filter history based on user role
  const history = mockLoans.filter(loan => {
    if (canViewAll) return true;
    return loan.borrowerId === user?.id;
  });

  const filteredHistory = history.filter((loan) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      loan.borrowerName.toLowerCase().includes(searchTerm) ||
      (loan.roomName && loan.roomName.toLowerCase().includes(searchTerm)) ||
      loan.facilities.some(f => f.name.toLowerCase().includes(searchTerm));
    
    const loanDate = new Date(loan.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let matchesTime = true;
    if (timeFilter === '7days') matchesTime = daysDiff <= 7;
    if (timeFilter === '30days') matchesTime = daysDiff <= 30;
    if (timeFilter === '90days') matchesTime = daysDiff <= 90;
    
    return matchesSearch && matchesTime;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'menunggu': { variant: 'secondary', label: 'Menunggu' },
      'disetujui': { variant: 'default', label: 'Disetujui' },
      'ditolak': { variant: 'destructive', label: 'Ditolak' },
      'selesai': { variant: 'outline', label: 'Selesai' },
    };
    return <Badge variant={variants[status]?.variant || 'secondary'}>{variants[status]?.label || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Riwayat Peminjaman</h1>
        <p className="text-muted-foreground mt-2">
          {canViewAll ? 'Lihat riwayat semua peminjaman' : 'Lihat riwayat peminjaman Anda'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="size-5 text-muted-foreground" />
              <Input
                placeholder="Cari aset atau peminjam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="90days">90 Hari Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {canViewAll && <TableHead>Peminjam</TableHead>}
                  <TableHead>Aset</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal Pinjam</TableHead>
                  <TableHead>Tanggal Kembali</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canViewAll ? 7 : 6} className="text-center text-muted-foreground">
                      Tidak ada riwayat ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((loan) => (
                    <TableRow key={loan.id}>
                      {canViewAll && <TableCell>{loan.borrowerName}</TableCell>}
                      <TableCell>
                        <div className="space-y-1">
                          {loan.roomName && (
                            <p>Ruangan: {loan.roomName}</p>
                          )}
                          {loan.facilities && loan.facilities.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <p>Fasilitas:</p>
                              <ul className="list-disc list-inside">
                                {loan.facilities.map((f, idx) => (
                                  <li key={idx}>{f.name} ({f.quantity}x)</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {loan.facilities.reduce((total, f) => total + f.quantity, 0)} item
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          {new Date(loan.startDate).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          {new Date(loan.endDate).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate text-muted-foreground">
                          {loan.purpose || '-'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground">
                Menampilkan {filteredHistory.length} dari {history.length} riwayat
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}