import type { Metadata } from "next";
import "./globals.css";
import { Zain } from "next/font/google";
import Navbar from "@/components/common/navbar";
import ConditionalFloatingDock from "@/components/common/conditional-floating-dock";
import ConditionalContent from "@/components/common/conditional-content";
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
      <head>
        <meta name="apple-mobile-web-app-title" content="BugPin" />
      </head>
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
              <ConditionalContent>
                {children}
              </ConditionalContent>
              <ConditionalFloatingDock />
            </AuthProvider>
          </AuthErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
