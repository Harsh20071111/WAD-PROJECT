import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-body-md text-on-surface-variant">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    const redirect =
      user.role === 'ADMIN' ? '/admin/dashboard' :
      user.role === 'RESIDENT' ? '/resident/dashboard' :
      '/staff/tasks';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
