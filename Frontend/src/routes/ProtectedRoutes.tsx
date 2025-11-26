import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode; // Use React.ReactNode instead of JSX.Element
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('accessToken'); // Check for accessToken

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>; // Wrap children in React Fragment
};

export default ProtectedRoute;