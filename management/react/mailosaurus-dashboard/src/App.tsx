import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import AliasesPage from './pages/AliasesPage';
import SystemStatusPage from './pages/SystemStatusPage';
import SSLPage from './pages/SSLPage';
import SystemBackupPage from './pages/SystemBackupPage';
import CustomDNSPage from './pages/CustomDNSPage';
import ExternalDNSPage from './pages/ExternalDNSPage';
import WebPage from './pages/WebPage';
import MFAPage from './pages/MFAPage';
import MailGuidePage from './pages/MailGuidePage';
import MuninPage from './pages/MuninPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/aliases" element={
            <ProtectedRoute>
              <AliasesPage />
            </ProtectedRoute>
          } />
          <Route path="/mail-guide" element={
            <ProtectedRoute>
              <MailGuidePage />
            </ProtectedRoute>
          } />
          <Route path="/system-status" element={
            <ProtectedRoute>
              <SystemStatusPage />
            </ProtectedRoute>
          } />
          <Route path="/ssl" element={
            <ProtectedRoute>
              <SSLPage />
            </ProtectedRoute>
          } />
          <Route path="/web" element={
            <ProtectedRoute>
              <WebPage />
            </ProtectedRoute>
          } />
          <Route path="/custom-dns" element={
            <ProtectedRoute>
              <CustomDNSPage />
            </ProtectedRoute>
          } />
          <Route path="/external-dns" element={
            <ProtectedRoute>
              <ExternalDNSPage />
            </ProtectedRoute>
          } />
          <Route path="/system-backup" element={
            <ProtectedRoute>
              <SystemBackupPage />
            </ProtectedRoute>
          } />
          <Route path="/mfa" element={
            <ProtectedRoute>
              <MFAPage />
            </ProtectedRoute>
          } />
          <Route path="/munin" element={
            <ProtectedRoute>
              <MuninPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
