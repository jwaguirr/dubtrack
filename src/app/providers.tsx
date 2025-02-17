"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { Roboto } from "next/font/google"; // ✅ Import Montserrat
import {HeroUIProvider} from "@heroui/react";

const montserrat = Roboto({
  subsets: ["latin"],
  weight: '400'
});

export default function Providers({ children }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <main className={montserrat.className}>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
        </main>
      </SessionProvider>

    </QueryClientProvider>
  );
}