import { useState } from "react";
import { useAuth } from "../context/auth-context.jsx";
import { mockDamageReports, mockAssets } from "../lib/mock-data.js";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Plus, Search, AlertTriangle, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState(mockDamageReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canManage = user?.role === "staf_buf" || user?.role === "admin_buf";

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.assetName.toLowerCase().includes(search.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateReport = (data) => {
    const newReport = {
      id: `r${reports.length + 1}`,
      assetId: data.assetId || "",
      assetName: mockAssets.find((a) => a.id === data.assetId)?.name || "",
      reportedBy: user?.id || "",
      reporterName: user?.name || "",
      description: data.description || "",
      priority: data.priority || "sedang",
      status: "menunggu",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReports([...reports, newReport]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateStatus = (id, status) => {
    setReports(
      reports.map((r) =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      )
    );
  };

  const handleUpdatePriority = (id, priority) => {
    setReports(
      reports.map((r) =>
        r.id === id
          ? { ...r, priority, updatedAt: new Date().toISOString() }
          : r
      )
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      menunggu: { variant: "secondary", label: "Menunggu" },
      dalam_perbaikan: { variant: "default", label: "Dalam Perbaikan" },
      selesai: { variant: "default", label: "Selesai" },
    };
    return (
      <Badge variant={variants[status].variant}>{variants[status].label}</Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      rendah: { variant: "secondary", label: "Rendah" },
      sedang: { variant: "default", label: "Sedang" },
      tinggi: { variant: "destructive", label: "Tinggi" },
    };
    return (
      <Badge variant={variants[priority].variant}>
        {variants[priority].label}
      </Badge>
    );
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
                      <TableCell
                        colSpan={canManage ? 8 : 6}
                        className="text-center text-muted-foreground"
                      >
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
                          <p className="max-w-xs truncate">
                            {report.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          {canManage ? (
                            <Select
                              value={report.priority}
                              onValueChange={(value) =>
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
                          {new Date(report.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Select
                              value={report.status}
                              onValueChange={(value) =>
                                handleUpdateStatus(report.id, value)
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="menunggu">
                                  Menunggu
                                </SelectItem>
                                <SelectItem value="dalam_perbaikan">
                                  Dalam Perbaikan
                                </SelectItem>
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
                                  <DialogTitle>
                                    Detail Laporan Kerusakan
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {/* detail content */}
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

/* ReportForm skeleton (tanpa tipe) */
function ReportForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    assetId: "",
    description: "",
    priority: "sedang",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label>Aset</Label>
      <Select
        value={formData.assetId}
        onValueChange={(v) => setFormData({ ...formData, assetId: v })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {mockAssets.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label>Deskripsi</Label>
      <Textarea
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <Label>Prioritas</Label>
      <Select
        value={formData.priority}
        onValueChange={(v) => setFormData({ ...formData, priority: v })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rendah">Rendah</SelectItem>
          <SelectItem value="sedang">Sedang</SelectItem>
          <SelectItem value="tinggi">Tinggi</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button">
          Batal
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
