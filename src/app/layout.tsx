import "./globals.css";

import { Inter } from "next/font/google";

import { TRPCProvider } from "@/lib/trpc/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veltrix Status",
  generator: "Prodfind CMS (Next.js)",
  description: "Veltrix Status",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.className} mx-auto max-w-4xl w-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
