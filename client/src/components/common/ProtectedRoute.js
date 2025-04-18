import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    // Not logged in, redirect to login page
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
