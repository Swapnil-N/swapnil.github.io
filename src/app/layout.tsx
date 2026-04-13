import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://swapnil.dev"),
  title: "Swapnil Nandeshwar",
  description:
    "Personal website — Forward Deployed Engineer, traveler, builder.",
  openGraph: {
    title: "Swapnil Nandeshwar",
    description:
      "Personal website — Forward Deployed Engineer, traveler, builder.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swapnil Nandeshwar",
    description:
      "Personal website — Forward Deployed Engineer, traveler, builder.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-surface text-foreground font-body antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Nav />
          <main className="pt-16 flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
