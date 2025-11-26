import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ element, roles }) {
    const { user } = useAuth();

    if (!user) {
        // No está logueado, redirige a login
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(user.rol)) {
        // Está logueado pero no tiene el rol, redirige a "No Autorizado" o al inicio
        // Por ahora, lo redirigimos al inicio.
        return <Navigate to="/" />;
    }

    // Está logueado y tiene el rol (o no se especificaron roles)
    return element;
}

export default ProtectedRoute;