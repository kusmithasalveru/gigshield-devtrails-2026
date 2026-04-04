import { Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useState, useContext, useEffect } from 'react';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import PolicySelection from './pages/PolicySelection';
import ClaimStatus from './pages/ClaimStatus';
import PayoutHistory from './pages/PayoutHistory';
import DisputePortal from './pages/DisputePortal';
import Profile from './pages/Profile';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gigshield_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    localStorage.setItem('gigshield_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gigshield_user');
    localStorage.removeItem('gigshield_token');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('gigshield_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Onboarding />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/policy" element={<ProtectedRoute><PolicySelection /></ProtectedRoute>} />
        <Route path="/claims" element={<ProtectedRoute><ClaimStatus /></ProtectedRoute>} />
        <Route path="/payouts" element={<ProtectedRoute><PayoutHistory /></ProtectedRoute>} />
        <Route path="/dispute" element={<ProtectedRoute><DisputePortal /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </AuthContext.Provider>
  );
}
