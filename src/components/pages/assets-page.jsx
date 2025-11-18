import { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { mockAssets } from "../../lib/mock-data";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState(mockAssets);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const canManageAssets = user?.role === "admin_buf";
  const canViewAll =
    user?.role === "admin_buf" ||
    user?.role === "staf_buf" ||
    user?.role === "kepala_buf";

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddAsset = (data) => {
    const newAsset = {
      id: `a${assets.length + 1}`,
      name: data.name || "",
      category: data.category || "fasilitas",
      location: data.location || "",
      totalStock: data.totalStock || 0,
      availableStock: data.availableStock || 0,
      condition: data.condition || "baik",
      description: data.description,
    };
    setAssets([...assets, newAsset]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateAsset = (id, updates) => {
    setAssets(assets.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id) => {
    if (confirm("Yakin ingin menghapus aset ini?")) {
      setAssets(assets.filter((a) => a.id !== id));
    }
  };

  const getConditionBadge = (condition) => {
    const variants = {
      baik: "default",
      rusak_ringan: "secondary",
      rusak_berat: "destructive",
    };
    return (
      <Badge variant={variants[condition]}>{condition.replace("_", " ")}</Badge>
    );
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
                      <TableCell
                        colSpan={canManageAssets ? 7 : 6}
                        className="text-center text-muted-foreground"
                      >
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
                                <p className="text-muted-foreground">
                                  {asset.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {asset.category}
                        </TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell>{asset.totalStock}</TableCell>
                        <TableCell>
                          <span
                            className={
                              asset.availableStock === 0 ? "text-red-600" : ""
                            }
                          >
                            {asset.availableStock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getConditionBadge(asset.condition)}
                        </TableCell>
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
        <Dialog
          open={!!editingAsset}
          onOpenChange={() => setEditingAsset(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Aset</DialogTitle>
              <DialogDescription>Update informasi aset</DialogDescription>
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

function AssetForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      category: "fasilitas",
      location: "",
      totalStock: 0,
      availableStock: 0,
      condition: "baik",
      description: "",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Aset</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Kategori</Label>
        <Select
          value={formData.category}
          onValueChange={(v) => setFormData({ ...formData, category: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fasilitas">Fasilitas</SelectItem>
            <SelectItem value="ruangan">Ruangan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Lokasi</Label>
        <Input
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label>Total Stok</Label>
          <Input
            type="number"
            value={formData.totalStock}
            onChange={(e) =>
              setFormData({ ...formData, totalStock: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex-1">
          <Label>Stok Tersedia</Label>
          <Input
            type="number"
            value={formData.availableStock}
            onChange={(e) =>
              setFormData({
                ...formData,
                availableStock: Number(e.target.value),
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Kondisi</Label>
        <Select
          value={formData.condition}
          onValueChange={(v) => setFormData({ ...formData, condition: v })}
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
        <Label>Deskripsi</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            /* cancel handled by parent dialog */
          }}
        >
          Batal
        </Button>
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  );
}
