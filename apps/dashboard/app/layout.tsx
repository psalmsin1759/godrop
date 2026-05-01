import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import DashboardShell from '@/components/layout/DashboardShell'
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Godrop OPS — Dashboard',
  description: 'Godrop internal operations and admin dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body>
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  )
}
