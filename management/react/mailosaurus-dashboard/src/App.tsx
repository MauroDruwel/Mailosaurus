import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
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
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600 mb-6">
              You need administrator privileges to access this control panel.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              Sign in as Administrator
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
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
