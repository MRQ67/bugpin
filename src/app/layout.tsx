import type { Metadata } from "next";
import "./globals.css";
import { Zain } from "@next/font/google";
import Navbar from "@/components/common/navbar";

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
      </body>
    </html>
  );
}
