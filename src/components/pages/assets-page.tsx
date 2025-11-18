import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { mockAssets, Asset } from '../../lib/mock-data';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState(mockAssets);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const canManageAssets = user?.role === 'admin_buf';
  const canViewAll = user?.role === 'admin_buf' || user?.role === 'staf_buf' || user?.role === 'kepala_buf';

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddAsset = (data: Partial<Asset>) => {
    const newAsset: Asset = {
      id: `a${assets.length + 1}`,
      name: data.name || '',
      category: data.category || 'fasilitas',
      location: data.location || '',
      totalStock: data.totalStock || 0,
      availableStock: data.availableStock || 0,
      condition: data.condition || 'baik',
      description: data.description,
    };
    setAssets([...assets, newAsset]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(assets.map(a => a.id === id ? { ...a, ...updates } : a));
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Yakin ingin menghapus aset ini?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const getConditionBadge = (condition: Asset['condition']) => {
    const variants: Record<Asset['condition'], 'default' | 'secondary' | 'destructive'> = {
      'baik': 'default',
      'rusak_ringan': 'secondary',
      'rusak_berat': 'destructive',
    };
    return <Badge variant={variants[condition]}>{condition.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Manajemen Aset</h1>
          <p className="text-muted-foreground mt-2">
            Kelola aset dan fasilitas BUF
          </p>
        </div>
        {canManageAssets && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Tambah Aset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Aset Baru</DialogTitle>
                <DialogDescription>
                  Masukkan informasi aset yang akan ditambahkan
                </DialogDescription>
              </DialogHeader>
              <AssetForm onSubmit={handleAddAsset} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="size-5 text-muted-foreground" />
              <Input
                placeholder="Cari aset atau lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="ruangan">Ruangan</SelectItem>
                <SelectItem value="fasilitas">Fasilitas</SelectItem>
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
                    <TableHead>Nama Aset</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Stok Total</TableHead>
                    <TableHead>Tersedia</TableHead>
                    <TableHead>Kondisi</TableHead>
                    {canManageAssets && <TableHead>Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManageAssets ? 7 : 6} className="text-center text-muted-foreground">
                        Tidak ada aset ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="size-4 text-muted-foreground" />
                            <div>
                              <p>{asset.name}</p>
                              {asset.description && (
                                <p className="text-muted-foreground">{asset.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{asset.category}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell>{asset.totalStock}</TableCell>
                        <TableCell>
                          <span className={asset.availableStock === 0 ? 'text-red-600' : ''}>
                            {asset.availableStock}
                          </span>
                        </TableCell>
                        <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                        {canManageAssets && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingAsset(asset)}
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAsset(asset.id)}
                              >
                                <Trash2 className="size-4 text-destructive" />
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

      {editingAsset && (
        <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Aset</DialogTitle>
              <DialogDescription>
                Update informasi aset
              </DialogDescription>
            </DialogHeader>
            <AssetForm
              initialData={editingAsset}
              onSubmit={(data) => handleUpdateAsset(editingAsset.id, data)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface AssetFormProps {
  initialData?: Asset;
  onSubmit: (data: Partial<Asset>) => void;
}

function AssetForm({ initialData, onSubmit }: AssetFormProps) {
  const [formData, setFormData] = useState<Partial<Asset>>(initialData || {
    name: '',
    category: 'fasilitas',
    location: '',
    totalStock: 0,
    availableStock: 0,
    condition: 'baik',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Aset</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select
          value={formData.category}
          onValueChange={(value: 'ruangan' | 'fasilitas') =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ruangan">Ruangan</SelectItem>
            <SelectItem value="fasilitas">Fasilitas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Lokasi</Label>
        <Select
          value={formData.location}
          onValueChange={(value: Asset['location']) =>
            setFormData({ ...formData, location: value })
          }
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalStock">Stok Total</Label>
          <Input
            id="totalStock"
            type="number"
            min="0"
            value={formData.totalStock}
            onChange={(e) => setFormData({ ...formData, totalStock: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availableStock">Stok Tersedia</Label>
          <Input
            id="availableStock"
            type="number"
            min="0"
            value={formData.availableStock}
            onChange={(e) => setFormData({ ...formData, availableStock: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Kondisi</Label>
        <Select
          value={formData.condition}
          onValueChange={(value: Asset['condition']) =>
            setFormData({ ...formData, condition: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baik">Baik</SelectItem>
            <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
            <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        {initialData ? 'Update' : 'Tambah'} Aset
      </Button>
    </form>
  );
}