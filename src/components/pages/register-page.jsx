import { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AlertCircle, Upload } from "lucide-react";

export function RegisterPage({ onNavigateToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "mahasiswa",
    department: "",
  });
  const [ktmFile, setKtmFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.role === "mahasiswa" && !ktmFile) {
      setError("Mahasiswa wajib upload KTM");
      return;
    }

    setLoading(true);
    try {
      const ktmUrl = ktmFile
        ? `https://cloudinary.com/mock/${ktmFile.name}`
        : undefined;
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ktmUrl,
        department: formData.department,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar Akun BUF</CardTitle>
          <CardDescription>
            Buat akun baru untuk mengakses sistem peminjaman BUF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* fields... */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={onNavigateToLogin}
              >
                Kembali
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Memproses..." : "Daftar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
