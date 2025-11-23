import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  USER: "buf_user",
  TOKEN: "buf_token",
};

const mockUsers = [
  {
    id: "1",
    name: "Admin BUF",
    email: "admin@buf.ac.id",
    password: "admin123",
    role: "admin_buf",
  },
  {
    id: "2",
    name: "Staf BUF",
    email: "staf@buf.ac.id",
    password: "staf123",
    role: "staf_buf",
  },
  {
    id: "3",
    name: "Kepala BUF",
    email: "kepala@buf.ac.id",
    password: "kepala123",
    role: "kepala_buf",
  },
  {
    id: "4",
    name: "Mahasiswa Test",
    email: "mahasiswa@student.ac.id",
    password: "mhs123",
    role: "mahasiswa",
    ktmUrl: "https://example.com/ktm.jpg",
    department: "Teknik Informatika",
  },
  {
    id: "5",
    name: "Dosen Test",
    email: "dosen@lecturer.ac.id",
    password: "dosen123",
    role: "dosen",
    department: "Fakultas Teknik",
  },
];

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const persistSession = (userData, accessToken) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    setUser(userData);
    setToken(accessToken);
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
    setToken(null);
  };

  const login = async (email, password) => {
    const matchedUser = mockUsers.find(
      (mockUser) => mockUser.email === email && mockUser.password === password
    );

    if (!matchedUser) {
      throw new Error("Email atau password salah");
    }

    // Simulasi token backend
    const accessToken = `mock_token_${matchedUser.id}_${Date.now()}`;
    const safeUserData = { ...matchedUser };
    delete safeUserData.password;

    persistSession(safeUserData, accessToken);
  };

  // Di dalam auth-context.jsx, tambahkan fungsi register
  const register = async (userData) => {
    // Simulasi delay network
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Validasi email unik
    const existingUser = mockUsers.find(
      (user) => user.email === userData.email
    );
    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }

    // Buat user baru
    const newUser = {
      id: String(mockUsers.length + 1),
      name: userData.name,
      email: userData.email,
      password: userData.password, // Dalam real app, ini harus di-hash
      role: userData.role,
      department: userData.department,
      studentId: userData.studentId,
      phone: userData.phone,
      ktmUrl: userData.ktmUrl,
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Auto login setelah register
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
