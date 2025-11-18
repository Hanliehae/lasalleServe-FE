import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { mockLoans, mockAssets, Loan } from '../../lib/mock-data';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Search, CheckCircle, XCircle, Calendar, AlertCircle, Trash2, X, Minus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function LoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState(mockLoans);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRoomLoanDialogOpen, setIsRoomLoanDialogOpen] = useState(false);
  const [isFacilityLoanDialogOpen, setIsFacilityLoanDialogOpen] = useState(false);

  const canApprove = user?.role === 'staf_buf' || user?.role === 'admin_buf';
  const canCreateLoan = user?.role === 'civitas' || user?.role === 'mahasiswa' || user?.role === 'dosen' || user?.role === 'staf';

  const filteredLoans = loans.filter((loan) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      loan.borrowerName.toLowerCase().includes(searchTerm) ||
      (loan.roomName && loan.roomName.toLowerCase().includes(searchTerm)) ||
      loan.facilities.some(f => f.name.toLowerCase().includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateLoan = (data: Partial<Loan>) => {
    const newLoan: Loan = {
      id: `l${loans.length + 1}`,
      borrowerId: user?.id || '',
      borrowerName: user?.name || '',
      roomId: data.roomId,
      roomName: data.roomName,
      facilities: data.facilities || [],
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: 'menunggu',
      purpose: data.purpose || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLoans([...loans, newLoan]);
  };

  const handleApproveLoan = (id: string) => {
    setLoans(loans.map(l => l.id === id ? { ...l, status: 'disetujui' as const, updatedAt: new Date().toISOString() } : l));
  };

  const handleRejectLoan = (id: string) => {
    setLoans(loans.map(l => l.id === id ? { ...l, status: 'ditolak' as const, updatedAt: new Date().toISOString() } : l));
  };

  const getStatusBadge = (status: Loan['status']) => {
    const variants: Record<Loan['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'menunggu': { variant: 'secondary', label: 'Menunggu' },
      'disetujui': { variant: 'default', label: 'Disetujui' },
      'ditolak': { variant: 'destructive', label: 'Ditolak' },
      'selesai': { variant: 'outline', label: 'Selesai' },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Peminjaman Aset</h1>
          <p className="text-muted-foreground mt-2">
            {canApprove ? 'Kelola permintaan peminjaman aset' : 'Ajukan dan lihat status peminjaman Anda'}
          </p>
        </div>
        {canCreateLoan && (
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isRoomLoanDialogOpen} onOpenChange={setIsRoomLoanDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 size-4" />
                  Pinjam Ruangan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajukan Peminjaman Ruangan</DialogTitle>
                  <DialogDescription>
                    Isi form untuk mengajukan peminjaman ruangan (dapat disertai fasilitas)
                  </DialogDescription>
                </DialogHeader>
                <RoomLoanForm onSubmit={(data) => {
                  handleCreateLoan(data);
                  setIsRoomLoanDialogOpen(false);
                }} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isFacilityLoanDialogOpen} onOpenChange={setIsFacilityLoanDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 size-4" />
                  Pinjam Fasilitas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajukan Peminjaman Fasilitas</DialogTitle>
                  <DialogDescription>
                    Isi form untuk mengajukan peminjaman fasilitas
                  </DialogDescription>
                </DialogHeader>
                <FacilityLoanForm onSubmit={(data) => {
                  handleCreateLoan(data);
                  setIsFacilityLoanDialogOpen(false);
                }} />
              </DialogContent>
            </Dialog>
          </div>
        )}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
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
                    {canApprove && <TableHead>Peminjam</TableHead>}
                    <TableHead>Aset</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead>Status</TableHead>
                    {canApprove && <TableHead>Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canApprove ? 6 : 5} className="text-center text-muted-foreground">
                        Tidak ada peminjaman ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        {canApprove && <TableCell>{loan.borrowerName}</TableCell>}
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
                            {loan.purpose && (
                              <p className="text-sm text-muted-foreground">Keperluan: {loan.purpose}</p>
                            )}
                          </div>
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
                        {canApprove && loan.status === 'menunggu' && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveLoan(loan.id)}
                              >
                                <CheckCircle className="mr-1 size-4 text-green-600" />
                                Setuju
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRejectLoan(loan.id)}
                              >
                                <XCircle className="mr-1 size-4 text-red-600" />
                                Tolak
                              </Button>
                            </div>
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

interface LoanFormProps {
  onSubmit: (data: Partial<Loan>) => void;
}

function RoomLoanForm({ onSubmit }: LoanFormProps) {
  const [formData, setFormData] = useState<{
    location?: string;
    roomId?: string;
    roomName?: string;
    facilities: { id: string; name: string; quantity: number }[];
    startDate: string;
    endDate: string;
    purpose: string;
  }>({
    facilities: [],
    startDate: '',
    endDate: '',
    purpose: '',
  });

  const [searchFacility, setSearchFacility] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const rooms = mockAssets.filter(a => 
    a.category === 'ruangan' && 
    (!formData.location || a.location === formData.location)
  );
  const facilities = mockAssets.filter(a => 
    a.category === 'fasilitas' && 
    a.name.toLowerCase().includes(searchFacility.toLowerCase())
  );
  
  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  const addFacility = (facility: typeof mockAssets[0]) => {
    // Check if already added
    if (formData.facilities.some(f => f.id === facility.id)) {
      return;
    }
    setFormData({
      ...formData,
      facilities: [...formData.facilities, { id: facility.id, name: facility.name, quantity: 1 }],
    });
    setSearchFacility('');
  };

  const removeFacility = (facilityId: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f.id !== facilityId),
    });
  };

  const updateFacilityQuantity = (facilityId: string, quantity: number) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.map(f => 
        f.id === facilityId ? { ...f, quantity } : f
      ),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location">Pilih Lokasi Gedung</Label>
        <Select
          value={formData.location}
          onValueChange={(value) => {
            setFormData({ ...formData, location: value, roomId: undefined, roomName: undefined });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih gedung..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gedung Agustinus">Gedung Agustinus</SelectItem>
            <SelectItem value="Gedung Josephus">Gedung Josephus</SelectItem>
            <SelectItem value="Gedung Katarina">Gedung Katarina</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.location && (
        <div className="space-y-2">
          <Label htmlFor="room">Pilih Ruangan</Label>
          <Select
            value={formData.roomId}
            onValueChange={(value) => {
              const room = rooms.find(r => r.id === value);
              setFormData({ ...formData, roomId: value, roomName: room?.name });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih ruangan..." />
            </SelectTrigger>
            <SelectContent>
              {rooms.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Tidak ada ruangan tersedia di gedung ini
                </div>
              ) : (
                rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>{room.name}</span>
                      {room.availableStock === 0 ? (
                        <Badge variant="destructive">Penuh</Badge>
                      ) : (
                        <Badge variant="secondary">Tersedia</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedRoom && (
            <div className="flex items-center gap-2 text-sm">
              {selectedRoom.availableStock === 0 ? (
                <>
                  <AlertCircle className="size-4 text-red-600" />
                  <span className="text-red-600">Ruangan sedang penuh</span>
                </>
              ) : (
                <>
                  <CheckCircle className="size-4 text-green-600" />
                  <span className="text-green-600">Ruangan tersedia</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Tambah Fasilitas Pendukung (Optional)</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari fasilitas..."
              value={searchFacility}
              onChange={(e) => setSearchFacility(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        {/* Available Facilities List */}
        <div className="border rounded-md max-h-96 overflow-y-auto">
          <div className="p-3 bg-muted/50 border-b">
            <p className="text-sm">Daftar Fasilitas Tersedia</p>
          </div>
          {facilities.length === 0 && searchFacility ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Tidak ada fasilitas ditemukan</p>
          ) : (
            mockAssets.filter(a => 
              a.category === 'fasilitas' && 
              a.name.toLowerCase().includes(searchFacility.toLowerCase())
            ).map((facility) => {
              const selectedFacility = formData.facilities.find(f => f.id === facility.id);
              const currentQuantity = selectedFacility?.quantity || 0;
              
              return (
                <div key={facility.id} className="p-3 border-b last:border-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                      <p>{facility.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Lokasi: {facility.location}
                      </p>
                      <p className="text-sm">
                        {facility.availableStock === 0 ? (
                          <span className="text-red-600">Habis</span>
                        ) : (
                          <span className="text-green-600">Tersedia: {facility.availableStock} unit</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {currentQuantity === 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addFacility(facility)}
                          disabled={facility.availableStock === 0}
                        >
                          <Plus className="size-4 mr-1" />
                          Tambah
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (currentQuantity === 1) {
                                removeFacility(facility.id);
                              } else {
                                updateFacilityQuantity(facility.id, currentQuantity - 1);
                              }
                            }}
                          >
                            <Minus className="size-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={facility.availableStock}
                            value={currentQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0 && val <= facility.availableStock) {
                                updateFacilityQuantity(facility.id, val);
                              }
                            }}
                            className="w-16 text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateFacilityQuantity(facility.id, Math.min(currentQuantity + 1, facility.availableStock))}
                            disabled={currentQuantity >= facility.availableStock}
                          >
                            <Plus className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFacility(facility.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary of Selected Facilities */}
        {formData.facilities.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm mb-2">Ringkasan Fasilitas Dipilih:</p>
            <ul className="text-sm space-y-1">
              {formData.facilities.map((facility) => (
                <li key={facility.id} className="flex justify-between">
                  <span>{facility.name}</span>
                  <span className="text-muted-foreground">{facility.quantity} unit</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal Mulai</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Tanggal Selesai</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Keperluan</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="Jelaskan keperluan peminjaman..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">Upload Surat (Optional)</Label>
        <Input
          id="document"
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          className="cursor-pointer"
        />
      </div>

      <Button type="submit" className="w-full">
        Ajukan Peminjaman
      </Button>
    </form>
  );
}

function FacilityLoanForm({ onSubmit }: LoanFormProps) {
  const [formData, setFormData] = useState<{
    facilities: { id: string; name: string; quantity: number }[];
    startDate: string;
    endDate: string;
    purpose: string;
  }>({
    facilities: [],
    startDate: '',
    endDate: '',
    purpose: '',
  });

  const [searchFacility, setSearchFacility] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const facilities = mockAssets.filter(a => 
    a.category === 'fasilitas' && 
    a.name.toLowerCase().includes(searchFacility.toLowerCase())
  );

  const addFacility = (facility: typeof mockAssets[0]) => {
    // Check if already added
    if (formData.facilities.some(f => f.id === facility.id)) {
      return;
    }
    setFormData({
      ...formData,
      facilities: [...formData.facilities, { id: facility.id, name: facility.name, quantity: 1 }],
    });
    setSearchFacility('');
  };

  const removeFacility = (facilityId: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f.id !== facilityId),
    });
  };

  const updateFacilityQuantity = (facilityId: string, quantity: number) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.map(f => 
        f.id === facilityId ? { ...f, quantity } : f
      ),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Pilih Fasilitas</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari fasilitas..."
              value={searchFacility}
              onChange={(e) => setSearchFacility(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        {/* Available Facilities List */}
        <div className="border rounded-md max-h-96 overflow-y-auto">
          <div className="p-3 bg-muted/50 border-b">
            <p className="text-sm">Daftar Fasilitas Tersedia</p>
          </div>
          {facilities.length === 0 && searchFacility ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Tidak ada fasilitas ditemukan</p>
          ) : (
            mockAssets.filter(a => 
              a.category === 'fasilitas' && 
              a.name.toLowerCase().includes(searchFacility.toLowerCase())
            ).map((facility) => {
              const selectedFacility = formData.facilities.find(f => f.id === facility.id);
              const currentQuantity = selectedFacility?.quantity || 0;
              
              return (
                <div key={facility.id} className="p-3 border-b last:border-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                      <p>{facility.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Lokasi: {facility.location}
                      </p>
                      <p className="text-sm">
                        {facility.availableStock === 0 ? (
                          <span className="text-red-600">Habis</span>
                        ) : (
                          <span className="text-green-600">Tersedia: {facility.availableStock} unit</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {currentQuantity === 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addFacility(facility)}
                          disabled={facility.availableStock === 0}
                        >
                          <Plus className="size-4 mr-1" />
                          Tambah
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (currentQuantity === 1) {
                                removeFacility(facility.id);
                              } else {
                                updateFacilityQuantity(facility.id, currentQuantity - 1);
                              }
                            }}
                          >
                            <Minus className="size-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={facility.availableStock}
                            value={currentQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0 && val <= facility.availableStock) {
                                updateFacilityQuantity(facility.id, val);
                              }
                            }}
                            className="w-16 text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateFacilityQuantity(facility.id, Math.min(currentQuantity + 1, facility.availableStock))}
                            disabled={currentQuantity >= facility.availableStock}
                          >
                            <Plus className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFacility(facility.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary of Selected Facilities */}
        {formData.facilities.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm mb-2">Ringkasan Fasilitas Dipilih:</p>
            <ul className="text-sm space-y-1">
              {formData.facilities.map((facility) => (
                <li key={facility.id} className="flex justify-between">
                  <span>{facility.name}</span>
                  <span className="text-muted-foreground">{facility.quantity} unit</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal Mulai</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Tanggal Selesai</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Keperluan</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="Jelaskan keperluan peminjaman..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">Upload Surat (Optional)</Label>
        <Input
          id="document"
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          className="cursor-pointer"
        />
      </div>

      <Button type="submit" className="w-full">
        Ajukan Peminjaman
      </Button>
    </form>
  );
}