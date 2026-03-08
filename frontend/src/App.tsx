import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import AIChatbot from './components/common/AIChatbot';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssue from './pages/ReportIssue';
import ProfilePage from './pages/ProfilePage';
import MunicipalityDashboard from './pages/MunicipalityDashboard';
import ContractorDashboard from './pages/ContractorDashboard';

const App = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return '/';
    switch (user.role) {
      case 'citizen':
        return '/citizen';
      case 'municipality':
        return '/municipality';
      case 'contractor':
        return '/contractor';
      default:
        return '/';
    }
  };

  return (
    <>
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Landing />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Citizen Routes */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/report"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Municipality Routes */}
      <Route
        path="/municipality"
        element={
          <ProtectedRoute allowedRoles={['municipality']}>
            <MunicipalityDashboard />
          </ProtectedRoute>
        }
      />

      {/* Contractor Routes */}
      <Route
        path="/contractor"
        element={
          <ProtectedRoute allowedRoles={['contractor']}>
            <ContractorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-dark-bg">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">403</h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-6">You don't have permission to access this page.</p>
              <a href={getDefaultRoute()} className="text-primary-600 dark:text-dark-accent-blue hover:text-primary-700 dark:hover:text-dark-accent-blue/80 font-medium">
                Go to Dashboard
              </a>
            </div>
          </div>
        }
      />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-dark-bg">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">404</h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-6">Page not found.</p>
              <a href="/" className="text-primary-600 dark:text-dark-accent-blue hover:text-primary-700 dark:hover:text-dark-accent-blue/80 font-medium">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>

    {/* AI Chatbot - Available to all authenticated users */}
    {isAuthenticated && <AIChatbot />}
  </>
);
};

export default App;
