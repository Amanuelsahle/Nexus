import React from 'react';
"use client";

import { ThemeProvider } from '@/context/theme-context';
import { ThemeToggle } from './theme-toggle';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex items-center justify-end p-2 bg-background">
        <ThemeToggle />
      </div>
      {children}
    </ThemeProvider>
  );
}
