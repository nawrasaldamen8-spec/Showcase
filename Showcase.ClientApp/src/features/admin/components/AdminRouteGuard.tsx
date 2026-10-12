import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { NotFoundView } from "@shared/components/NotFoundView.tsx";
import { RouteLoadingSkeleton } from "@shared/components/RouteLoadingSkeleton.tsx";
import { useAuth } from "@shared/context/index.ts";

export interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <NotFoundView />;
  }

  return <>{children}</>;
};

