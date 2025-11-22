import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Search,
  Package,
  MapPin,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/auth-context.jsx";
import { mockAssets, mockLoans } from "../lib/mock-data.js";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from "../components/ui/checkbox";

const APPROVER_ROLES = ["staf_buf", "admin_buf"];

export function ReturnPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState(mockLoans);
  const [assets, setAssets] = useState(mockAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnData, setReturnData] = useState({
    returnedItems: [],
    notes: "",
    condition: "baik",
  });

  const canApprove = APPROVER_ROLES.includes(user?.role ?? "");

  // Filter peminjaman yang sudah disetujui dan sedang berjalan atau sudah selesai
  const eligibleLoans = useMemo(() => {
    return loans.filter(
      (loan) => loan.status === "disetujui" || loan.status === "selesai"
    );
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    const today = new Date().toISOString().split("T")[0];

    return eligibleLoans.filter((loan) => {
      const matchesSearch =
        loan.borrowerName.toLowerCase().includes(keyword) ||
        (loan.roomName && loan.roomName.toLowerCase().includes(keyword)) ||
        loan.facilities.some((facility) =>
          facility.name.toLowerCase().includes(keyword)
        );

      // Filter berdasarkan status pengembalian
      let matchesStatus = true;
      if (statusFilter === "pending") {
        // Peminjaman yang masih berjalan atau sudah lewat tanggal selesai
        matchesStatus = loan.endDate >= today && loan.status === "disetujui";
      } else if (statusFilter === "overdue") {
        // Peminjaman yang sudah lewat tanggal selesai
        matchesStatus = loan.endDate < today && loan.status === "disetujui";
      } else if (statusFilter === "returned") {
        // Peminjaman yang sudah dikembalikan
        matchesStatus = loan.status === "selesai";
      }

      return matchesSearch && matchesStatus;
    });
  }, [eligibleLoans, searchTerm, statusFilter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const handleOpenReturnDialog = (loan) => {
    setSelectedLoan(loan);

    // Initialize return data dengan semua item yang dipinjam
    const returnedItems = [];

    if (loan.roomId) {
      returnedItems.push({
        id: loan.roomId,
        name: loan.roomName,
        type: "room",
        quantity: 1,
        returned: false,
        condition: "baik",
      });
    }

    loan.facilities.forEach((facility) => {
      returnedItems.push({
        id: facility.id,
        name: facility.name,
        type: "facility",
        quantity: facility.quantity,
        returned: false,
        condition: "baik",
      });
    });

    setReturnData({
      returnedItems,
      notes: "",
      condition: "baik",
    });
    setIsReturnDialogOpen(true);
  };

  const handleItemReturnToggle = (itemId, returned) => {
    setReturnData((prev) => ({
      ...prev,
      returnedItems: prev.returnedItems.map((item) =>
        item.id === itemId ? { ...item, returned } : item
      ),
    }));
  };

  const handleItemConditionChange = (itemId, condition) => {
    setReturnData((prev) => ({
      ...prev,
      returnedItems: prev.returnedItems.map((item) =>
        item.id === itemId ? { ...item, condition } : item
      ),
    }));
  };

  const handleReturnSubmit = () => {
    if (!selectedLoan) return;

    // Update status peminjaman menjadi selesai
    const updatedLoans = loans.map((loan) =>
      loan.id === selectedLoan.id
        ? { ...loan, status: "selesai", returnedAt: new Date().toISOString() }
        : loan
    );

    // Update stok aset berdasarkan item yang dikembalikan
    const updatedAssets = [...assets];

    returnData.returnedItems.forEach((returnedItem) => {
      if (returnedItem.returned) {
        const assetIndex = updatedAssets.findIndex(
          (asset) => asset.id === returnedItem.id
        );
        if (assetIndex !== -1) {
          // Tambah stok yang tersedia
          updatedAssets[assetIndex] = {
            ...updatedAssets[assetIndex],
            availableStock:
              updatedAssets[assetIndex].availableStock + returnedItem.quantity,
            // Update kondisi jika berbeda
            ...(returnedItem.condition !== "baik" && {
              condition: returnedItem.condition,
            }),
          };
        }
      }
    });

    setLoans(updatedLoans);
    setAssets(updatedAssets);
    setIsReturnDialogOpen(false);
    setSelectedLoan(null);
  };

  const getLoanStatus = (loan) => {
    const today = new Date().toISOString().split("T")[0];

    if (loan.status === "selesai") {
      return {
        type: "returned",
        label: "Sudah Dikembalikan",
        variant: "outline",
      };
    } else if (loan.endDate < today) {
      return { type: "overdue", label: "Terlambat", variant: "destructive" };
    } else {
      return { type: "active", label: "Sedang Dipinjam", variant: "default" };
    }
  };

  const allItemsReturned = returnData.returnedItems.every(
    (item) => item.returned
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>Pengembalian Aset</h1>
          <p className="text-muted-foreground mt-2">
            Kelola proses pengembalian ruangan dan fasilitas
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Search className="size-5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Cari peminjam, ruangan, atau fasilitas..."
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status pengembalian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Sedang Dipinjam</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
                <SelectItem value="returned">Sudah Dikembalikan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Detail Aset</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      Tidak ada data pengembalian ditemukan
                    </TableCell>
                  </TableRow>
                )}

                {filteredLoans.map((loan) => {
                  const status = getLoanStatus(loan);
                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          {loan.borrowerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <LoanAssetDetails loan={loan} />
                      </TableCell>
                      <TableCell>
                        <LoanDate value={loan.startDate} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          {new Date(loan.endDate).toLocaleDateString("id-ID")}
                          {status.type === "overdue" && (
                            <Clock className="size-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {loan.status === "disetujui" && canApprove && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReturnDialog(loan)}
                          >
                            <CheckCircle className="mr-1 size-4" />
                            Proses Pengembalian
                          </Button>
                        )}
                        {loan.status === "selesai" && (
                          <span className="text-sm text-muted-foreground">
                            Dikembalikan:{" "}
                            {new Date(loan.returnedAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Proses Pengembalian */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle>Proses Pengembalian Aset</DialogTitle>
            <DialogDescription>
              Verifikasi kondisi fisik aset yang dikembalikan oleh{" "}
              {selectedLoan?.borrowerName}
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-6">
              {/* Informasi Peminjaman */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detail Peminjaman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Peminjam:</span>
                      <p>{selectedLoan.borrowerName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Periode:</span>
                      <p>
                        {new Date(selectedLoan.startDate).toLocaleDateString(
                          "id-ID"
                        )}{" "}
                        -{" "}
                        {new Date(selectedLoan.endDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                  {selectedLoan.purpose && (
                    <div>
                      <span className="font-medium">Keperluan:</span>
                      <p className="text-muted-foreground">
                        {selectedLoan.purpose}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daftar Item yang Dipinjam */}
              <div className="space-y-4">
                <Label>Daftar Aset yang Dipinjam</Label>
                <div className="space-y-3">
                  {returnData.returnedItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={item.returned}
                              onCheckedChange={(checked) =>
                                handleItemReturnToggle(item.id, checked)
                              }
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  {item.type === "room"
                                    ? "Ruangan"
                                    : "Fasilitas"}
                                </span>
                                <span>Jumlah: {item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          {item.returned && (
                            <Select
                              value={item.condition}
                              onValueChange={(value) =>
                                handleItemConditionChange(item.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="baik">Baik</SelectItem>
                                <SelectItem value="rusak_ringan">
                                  Rusak Ringan
                                </SelectItem>
                                <SelectItem value="rusak_berat">
                                  Rusak Berat
                                </SelectItem>
                                <SelectItem value="hilang">Hilang</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {item.returned && item.condition !== "baik" && (
                          <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                            <AlertCircle className="size-4" />
                            <span>
                              {item.condition === "rusak_ringan" &&
                                "Butuh perbaikan ringan"}
                              {item.condition === "rusak_berat" &&
                                "Butuh perbaikan berat"}
                              {item.condition === "hilang" &&
                                "Item hilang, perlu tindakan lebih lanjut"}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label>Catatan Pengembalian</Label>
                <Input
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={returnData.notes}
                  onChange={(e) =>
                    setReturnData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsReturnDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleReturnSubmit}
                  disabled={!allItemsReturned}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Konfirmasi Pengembalian
                </Button>
              </div>

              {!allItemsReturned && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="size-4" />
                  <span>
                    Centang semua item yang sudah dikembalikan untuk melanjutkan
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoanAssetDetails({ loan }) {
  return (
    <div className="space-y-2">
      {loan.roomName && (
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <span className="font-medium">{loan.roomName}</span>
        </div>
      )}
      {loan.facilities.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="size-4" />
            <span>Fasilitas:</span>
          </div>
          <ul className="list-inside list-disc mt-1">
            {loan.facilities.map((facility, index) => (
              <li key={`${loan.id}-${facility.id}-${index}`}>
                {facility.name} ({facility.quantity}x)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LoanDate({ value }) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="size-4 text-muted-foreground" />
      {new Date(value).toLocaleDateString("id-ID")}
    </div>
  );
}
