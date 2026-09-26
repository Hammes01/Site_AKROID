import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://akroid.com.br'),
  title: {
    default: 'AKROID Energia Solar',
    template: '%s | AKROID Energia Solar',
  },
  description:
    'Energia solar fotovoltaica com engenharia própria: projeto, instalação e acompanhamento completo para residências, comércios e indústrias.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'AKROID Energia Solar',
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
