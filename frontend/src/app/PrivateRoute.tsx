import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  children: React.ReactElement; // Changed to ReactElement to ensure single child
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  isAuthenticated, 
  children, 
  redirectTo = '/login' 
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Return the single React element directly
  return children;
};

export default PrivateRoute;