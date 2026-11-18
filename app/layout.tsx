import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono, Josefin_Sans } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { ModeProvider } from "@/components/providers/ModeContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
  ),
  title: {
    default: "Maminco — Sistema de gestión para restaurantes",
    template: "%s · Maminco",
  },
  description:
    "Maminco es el sistema integral para restaurantes: punto de venta, mesas y órdenes en tiempo real, pagos y caja, reportes y pronósticos de ventas con IA.",
  applicationName: "Maminco",
  keywords: [
    "POS",
    "restaurante",
    "punto de venta",
    "gestión de mesas",
    "órdenes",
    "caja",
    "reportes",
    "Bolivia",
  ],
  authors: [{ name: "Maminco" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#143f29" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1411" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${josefin.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <ToastProvider />
          <ModeProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
