import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import TablePage from './pages/TablePage';
import AuditPage from './pages/AuditPage';
import Layout    from './components/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1.1rem',color:'var(--text2)'}}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index           element={<Dashboard />} />
            <Route path="routes"     element={<TablePage table="routes" />} />
            <Route path="vehicles"   element={<TablePage table="vehicles" />} />
            <Route path="schedules"  element={<TablePage table="schedules" />} />
            <Route path="passengers" element={<TablePage table="passengers" />} />
            <Route path="bookings"   element={<TablePage table="bookings" />} />
            <Route path="staff"      element={<TablePage table="staff" />} />
            <Route path="audit"      element={<AuditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
