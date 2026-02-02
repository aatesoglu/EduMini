import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const InstructorRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    if (!user || user.role !== 'instructor') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default InstructorRoute;
