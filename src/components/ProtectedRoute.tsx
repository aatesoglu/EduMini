import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  isInstructor?: boolean;
}

const ProtectedRoute = ({ children, isAdmin, isInstructor }: ProtectedRouteProps) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Yükleniyor...</div>; // Or a proper spinner component
  }

  if (!user) {
    // Redirect to login but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (isInstructor && user.role !== 'instructor' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
