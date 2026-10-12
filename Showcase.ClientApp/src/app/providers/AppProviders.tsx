import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PorityToaster } from "@shared/components/index.ts";
import { AuthProvider } from "@shared/context/index.ts";
import { AppErrorBoundary } from "./AppErrorBoundary.tsx";
import { queryClient } from "./queryClient.ts";

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
            <PorityToaster />
          </AuthProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};
