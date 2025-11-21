import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Plus, Search } from "lucide-react";

import { ImageWithFallback } from "../components/common/ImageWithFallback.jsx";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../context/auth-context.jsx";
import { mockDamageReports, mockAssets } from "../lib/mock-data.js";

const MANAGER_ROLES = ["staf_buf", "admin_buf"];
const STATUS_OPTIONS = [
  { value: "menunggu", label: "Menunggu" },
  { value: "dalam_perbaikan", label: "Dalam Perbaikan" },
  { value: "selesai", label: "Selesai" },
];

const PRIORITY_OPTIONS = [
  { value: "rendah", label: "Rendah" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
];

const STATUS_BADGE_VARIANTS = {
  menunggu: { variant: "secondary", label: "Menunggu" },
  dalam_perbaikan: { variant: "default", label: "Dalam Perbaikan" },
  selesai: { variant: "default", label: "Selesai" },
};

const PRIORITY_BADGE_VARIANTS = {
  rendah: { variant: "secondary", label: "Rendah" },
  sedang: { variant: "default", label: "Sedang" },
  tinggi: { variant: "destructive", label: "Tinggi" },
};

export function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState(mockDamageReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canManage = MANAGER_ROLES.includes(user?.role ?? "");

  const filteredReports = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return reports.filter((report) => {
      const matchesSearch =
        report.assetName.toLowerCase().includes(keyword) ||
        report.reporterName.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleStatusChange = (value) => setStatusFilter(value);

  const handleCreateReport = (formData) => {
    const asset = mockAssets.find((item) => item.id === formData.assetId);

    const newReport = {
      id: `r${reports.length + 1}`,
      assetId: formData.assetId ?? "",
      assetName: asset?.name ?? "",
      reportedBy: user?.id ?? "",
      reporterName: user?.name ?? "Pengguna",
      description: formData.description ?? "",
      priority: formData.priority ?? "sedang",
      status: "menunggu",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReports((prev) => [...prev, newReport]);
    setIsDialogOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Laporan Kerusakan</h1>
          <p className="text-muted-foreground mt-2">
            Kelola laporan kerusakan aset
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Lapor Kerusakan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Search className="size-5 text-muted-foreground" />
              <Input
                placeholder="Cari aset atau pelapor..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ReportsTable
            reports={filteredReports}
            canManage={canManage}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePriority={handleUpdatePriority}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lapor Kerusakan Aset</DialogTitle>
            <DialogDescription>
              Laporkan kerusakan yang ditemukan pada aset.
            </DialogDescription>
          </DialogHeader>
          <ReportForm
            onSubmit={handleCreateReport}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ReportForm skeleton (tanpa tipe) */
function ReportsTable({
  reports,
  canManage,
  onUpdateStatus,
  onUpdatePriority,
}) {
  if (reports.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Tidak ada laporan ditemukan
      </div>
    );
  }

  return (
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
            {reports.map((report) => (
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
                      onValueChange={(value) =>
                        onUpdatePriority(report.id, value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <PriorityBadge value={report.priority} />
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge value={report.status} />
                </TableCell>
                <TableCell>
                  {new Date(report.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Select
                      value={report.status}
                      onValueChange={(value) =>
                        onUpdateStatus(report.id, value)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
                {canManage && (
                  <TableCell>
                    <ReportDetailDialog report={report} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const config = STATUS_BADGE_VARIANTS[value] ?? STATUS_BADGE_VARIANTS.menunggu;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function PriorityBadge({ value }) {
  const config =
    PRIORITY_BADGE_VARIANTS[value] ?? PRIORITY_BADGE_VARIANTS.sedang;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function ReportDetailDialog({ report }) {
  return (
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
          <DetailField label="Aset" value={report.assetName} />
          <DetailField label="Pelapor" value={report.reporterName} />
          <DetailField label="Prioritas">
            <PriorityBadge value={report.priority} />
          </DetailField>
          <DetailField label="Status">
            <StatusBadge value={report.status} />
          </DetailField>
          <DetailField label="Deskripsi" value={report.description} />
          {report.photoUrl && (
            <div className="space-y-2">
              <Label>Foto Kerusakan</Label>
              <ImageWithFallback
                src={report.photoUrl}
                alt={`Foto kerusakan ${report.assetName}`}
                className="w-full rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value, children }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {children ? (
        <div className="mt-1">{children}</div>
      ) : (
        <p className="mt-1 text-sm">{value}</p>
      )}
    </div>
  );
}

function ReportForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    assetId: "",
    description: "",
    priority: "sedang",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Aset</Label>
        <Select
          value={formData.assetId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, assetId: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih aset" />
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
        <Label>Deskripsi</Label>
        <Textarea
          value={formData.description}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Prioritas</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, priority: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
