import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";

export const metadata: Metadata = {
  title: "Grozo - 10 minutes grocery delivery App",
  description: "10 minutes grocery delivery App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-[200vh] bg-linear-to-b from-green-50 to-white">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
