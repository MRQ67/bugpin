import type { Metadata } from "next";
import "./globals.css";
import { Zain } from "next/font/google";
import Navbar from "@/components/common/navbar";
import DynamicFloatingDock from "@/components/common/dynamic-floating-dock";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthErrorBoundary } from "@/components/providers/auth-error-boundary";

const zain = Zain({
  subsets: ['latin'],
  weight: ['200', '300', '400', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "BugPin • Pin Your Pain",
  description: "A social platform for developers to share and discover coding errors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthErrorBoundary>
            <AuthProvider>
              <Navbar />
              <div className="pb-20">
                {children}
              </div>
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="pointer-events-auto rounded-full border bg-background/80 backdrop-blur shadow-lg px-3 py-2">
                  <DynamicFloatingDock />
                </div>
              </div>
            </AuthProvider>
          </AuthErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
