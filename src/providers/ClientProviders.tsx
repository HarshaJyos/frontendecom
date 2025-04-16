// src/providers/ClientProviders.tsx
"use client";

import ReduxProvider from "./ReduxProvider";
import MuiThemeProvider from "./MuiThemeProvider";
import ToastProvider from "./ToastProvider";
import AuthProvider from '@/providers/AuthProvider';
import Header from "@/components/Header/Header";


export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <MuiThemeProvider>
        <ToastProvider>
          <AuthProvider>            <Header />
          {children}</AuthProvider>
        </ToastProvider>
      </MuiThemeProvider>
    </ReduxProvider>
  );
}
