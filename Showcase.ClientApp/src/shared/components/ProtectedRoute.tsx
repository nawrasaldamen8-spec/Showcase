import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RouteLoadingSkeleton } from "./RouteLoadingSkeleton.tsx";
import { useAuth } from "../context/index.ts";

export interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.isBanned) {
    return <Navigate to="/banned" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

