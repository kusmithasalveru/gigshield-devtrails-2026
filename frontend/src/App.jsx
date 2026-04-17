import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createContext, useState, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import PolicySelection from './pages/PolicySelection';
import ClaimStatus from './pages/ClaimStatus';
import PayoutHistory from './pages/PayoutHistory';
import DisputePortal from './pages/DisputePortal';
import Profile from './pages/Profile';
import FraudDetection from './pages/FraudDetection';
import AdminDashboard from './pages/AdminDashboard';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return (
    <Layout>
      <PageTransition>{children}</PageTransition>
    </Layout>
  );
}

export default function App() {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gigshield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [toasts, setToasts] = useState([]);

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

  const addToast = (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, addToast }}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <PageTransition><Onboarding /></PageTransition>}
          />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/policy" element={<ProtectedRoute><PolicySelection /></ProtectedRoute>} />
          <Route path="/claims" element={<ProtectedRoute><ClaimStatus /></ProtectedRoute>} />
          <Route path="/payouts" element={<ProtectedRoute><PayoutHistory /></ProtectedRoute>} />
          <Route path="/fraud" element={<ProtectedRoute><FraudDetection /></ProtectedRoute>} />
          <Route path="/dispute" element={<ProtectedRoute><DisputePortal /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>

      <div className="fixed right-4 top-4 z-[60] space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.92 }}
              className={`rounded-2xl border px-4 py-3 backdrop-blur-md shadow-lg ${
                toast.type === 'success'
                  ? 'border-emerald-300/60 bg-emerald-500/85 text-white'
                  : toast.type === 'error'
                    ? 'border-red-300/60 bg-red-500/85 text-white'
                    : 'border-indigo-300/60 bg-indigo-500/85 text-white'
              }`}
            >
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}
