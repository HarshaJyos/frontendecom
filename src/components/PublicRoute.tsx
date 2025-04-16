// src/components/PublicRoute.tsx
'use client';

import { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  return <>{children}</>;
}