import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShareGoods - Turn Your Extra Items into Lifesaving Help",
  description:
    "Connect with people in need by donating clothes, shoes, and essentials. Make a difference in your community, one donation at a time.",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  themeColor: '#4CAF50',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShareGoods',
  },
  formatDetection: {
    telephone: false,
  },
}

import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { SocketProvider } from "@/components/providers/socket-provider"
import { SyncProvider } from "@/components/providers/sync-provider"

import { Toaster as SonnerToaster } from "sonner"

export default async function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <SocketProvider>
            <SyncProvider>
              {children}
            </SyncProvider>
          </SocketProvider>
        </NextIntlClientProvider>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  )
}
