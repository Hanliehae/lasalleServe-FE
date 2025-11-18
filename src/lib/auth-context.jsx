import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Mock users for demonstration
const mockUsers = [
  { id: '1', name: 'Admin BUF', email: 'admin@buf.ac.id', password: 'admin123', role: 'admin_buf' },
  { id: '2', name: 'Staf BUF', email: 'staf@buf.ac.id', password: 'staf123', role: 'staf_buf' },
  { id: '3', name: 'Kepala BUF', email: 'kepala@buf.ac.id', password: 'kepala123', role: 'kepala_buf' },
  { id: '4', name: 'Mahasiswa Test', email: 'mahasiswa@student.ac.id', password: 'mhs123', role: 'mahasiswa', ktmUrl: 'https://example.com/ktm.jpg', department: 'Teknik Informatika' },
  { id: '5', name: 'Dosen Test', email: 'dosen@lecturer.ac.id', password: 'dosen123', role: 'dosen', department: 'Fakultas Teknik' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem('buf_user');
    const storedToken = localStorage.getItem('buf_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    // Mock login - in real app, call API
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('Email atau password salah');
    }

    const { password: _, ...userData } = foundUser;
    const mockToken = `mock_token_${userData.id}_${Date.now()}`;
    
    localStorage.setItem('buf_user', JSON.stringify(userData));
    localStorage.setItem('buf_token', mockToken);
    setUser(userData);
  };

  const register = async (data) => {
    // Mock register - in real app, call API
    const newUser = {
      id: `${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      ktmUrl: data.ktmUrl,
      department: data.department,
    };

    const mockToken = `mock_token_${newUser.id}_${Date.now()}`;
    
    localStorage.setItem('buf_user', JSON.stringify(newUser));
    localStorage.setItem('buf_token', mockToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('buf_user');
    localStorage.removeItem('buf_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

