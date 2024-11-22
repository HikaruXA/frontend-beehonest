// RoleProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem("roleID");

  // Check if userRole matches the allowedRole; if not, redirect to the landing page or an unauthorized page
  if (userRole !== allowedRole) {
    return <Navigate to="/" />; // Redirect to home or an unauthorized page
  }

  return children;
};

export default RoleProtectedRoute;
