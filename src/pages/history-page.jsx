import { useState, useMemo } from "react";
import { useAuth } from "../context/auth-context.jsx";
import { mockLoans, getAcademicYearOptions } from "../lib/mock-data.js";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Search, Calendar, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function HistoryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");

  const canViewAll = user?.role === "admin_buf" || user?.role === "staf_buf";

  const history = mockLoans.filter((loan) => {
    if (canViewAll) return true;
    return loan.borrowerId === user?.id;
  });

  const academicYearOptions = getAcademicYearOptions();

  const filteredHistory = useMemo(() => {
    return history.filter((loan) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        loan.borrowerName.toLowerCase().includes(searchTerm) ||
        (loan.roomName && loan.roomName.toLowerCase().includes(searchTerm)) ||
        (loan.facilities &&
          loan.facilities.some((f) =>
            f.name.toLowerCase().includes(searchTerm)
          ));

      const loanDate = new Date(loan.createdAt);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let matchesTime = true;
      if (timeFilter === "7days") matchesTime = daysDiff <= 7;
      if (timeFilter === "30days") matchesTime = daysDiff <= 30;
      if (timeFilter === "90days") matchesTime = daysDiff <= 90;

      let matchesAcademicYear = true;
      if (academicYearFilter !== "all") {
        matchesAcademicYear = loan.academicYear === academicYearFilter;
      }

      return matchesSearch && matchesTime && matchesAcademicYear;
    });
  }, [history, search, timeFilter, academicYearFilter]);

  const getStatusBadge = (status) => {
    const variants = {
      menunggu: { variant: "secondary", label: "Menunggu" },
      disetujui: { variant: "default", label: "Disetujui" },
      ditolak: { variant: "destructive", label: "Ditolak" },
      selesai: { variant: "outline", label: "Selesai" },
      menunggu_pengembalian: {
        variant: "secondary",
        label: "Menunggu Pengembalian",
      },
    };
    return (
      <Badge variant={variants[status]?.variant || "secondary"}>
        {variants[status]?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Riwayat Peminjaman</h1>
        <p className="text-muted-foreground mt-2">
          {canViewAll
            ? "Lihat riwayat semua peminjaman"
            : "Lihat riwayat peminjaman Anda"}
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
            <div className="flex gap-2">
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

              <Select
                value={academicYearFilter}
                onValueChange={setAcademicYearFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {academicYearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {canViewAll && <TableHead>Peminjam</TableHead>}
                  <TableHead>Aset</TableHead>
                  <TableHead>Tanggal & Waktu</TableHead>
                  <TableHead>Tahun Ajaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keperluan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canViewAll ? 6 : 5}
                      className="text-center text-muted-foreground"
                    >
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
                            <p className="font-medium">{loan.roomName}</p>
                          )}
                          {loan.facilities && loan.facilities.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <p>Fasilitas:</p>
                              <ul className="list-disc list-inside">
                                {loan.facilities.map((f, idx) => (
                                  <li key={idx}>
                                    {f.name} ({f.quantity}x)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>
                              {new Date(loan.startDate).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="size-3" />
                            <span>
                              {loan.startTime || "08:00"} -{" "}
                              {loan.endTime || "17:00"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{loan.academicYear || "2025/2026"}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{loan.purpose || "-"}</p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
