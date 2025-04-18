// src/providers/ClientProviders.tsx
"use client";

import ReduxProvider from "./ReduxProvider";
import MuiThemeProvider from "./MuiThemeProvider";
import ToastProvider from "./ToastProvider";
import Header from "@/components/Header/Header";
import AuthInitializer from "./AuthProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
    
  return (
    <ReduxProvider>
      <AuthInitializer />
      <MuiThemeProvider>
        <ToastProvider>
          <Header />
          {children}
        </ToastProvider>
      </MuiThemeProvider>
    </ReduxProvider>
  );
}