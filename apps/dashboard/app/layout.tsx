import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import DashboardShell from '@/components/layout/DashboardShell'
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Godrop OPS — Dashboard',
  description: 'Godrop internal operations and admin dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", plusJakartaSans.variable, jetBrainsMono.variable)}>
      <body>
        <Providers>
          <DashboardShell>{children}</DashboardShell>
        </Providers>
      </body>
    </html>
  )
}
