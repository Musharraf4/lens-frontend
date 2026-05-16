'use client';

import React from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps): React.ReactElement {
  return <>{children}</>;
}