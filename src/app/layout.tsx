import type { Metadata } from "next";
import "./globals.css";
import { Zain } from "@next/font/google";
import { Home, Plus, User } from 'lucide-react';
import Navbar from "@/components/common/navbar";
import { FloatingDock } from "@/components/ui/floating-dock";

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
    <html lang="en">
      <body className="font-sans antialiased">
        <Navbar />
        {children}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="pointer-events-auto rounded-full border bg-background/80 backdrop-blur shadow-lg px-3 py-2">
            <FloatingDock
              items={[
                {
                  title: 'Home',
                  icon: <Home className="h-5 w-5" />,
                  href: '/'
                },
                {
                  title: 'Upload',
                  icon: <Plus className="h-5 w-5" />,
                  href: '/upload'
                },
                {
                  title: 'Profile',
                  icon: <User className="h-5 w-5" />,
                  href: '/profile/me'
                }
              ]}
              desktopClassName="hidden md:flex"
              mobileClassName="md:hidden"
            />
          </div>
        </div>
      </body>
    </html>
  );
}
