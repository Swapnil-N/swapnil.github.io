import type { Metadata } from "next";
import localFont from 'next/font/local';
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getCurrentUserWithRole } from "@/lib/auth/permissions";
import "./globals.css";

const spaceGrotesk = localFont({
  src: './fonts/space-grotesk-latin-wght-normal.woff2',
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = localFont({
  src: './fonts/dm-sans-latin-wght-normal.woff2',
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://swapnil.dev"),
  title: "Swapnil Napuri",
  description:
    "Personal website — Experience maxer, adventurer, builder.",
  openGraph: {
    title: "Swapnil Napuri",
    description:
      "Personal website — Experience maxer, adventurer, builder.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swapnil Napuri",
    description:
      "Personal website — Experience maxer, adventurer, builder.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAuth = await getCurrentUserWithRole();
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-surface text-foreground antialiased">
        <AuthProvider initialAuth={initialAuth}>
          <Nav />
          <main className="pt-16 flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
