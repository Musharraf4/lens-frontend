import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/providers/ClientProviders";
import localFont from 'next/font/local'

const font = localFont({
  src: [
    {
      path: '../fonts/SF-Pro-Display-Thin.otf',
      weight: '300',
    },
    {
      path: '../fonts/SF-Pro-Display-Regular.otf',
      weight: '400',
    },
    {
      path: '../fonts/SF-Pro-Display-Medium.otf',
      weight: '500',
    },
    {
      path: '../fonts/SF-Pro-Display-Semibold.otf',
      weight: '600',
    },
    {
      path: '../fonts/SF-Pro-Display-Bold.otf',
      weight: '700',
    },
  ],
})

export const metadata: Metadata = {
  title: "LENZ",
  description: "Your modern web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className}`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
