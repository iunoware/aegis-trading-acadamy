import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aegis Trading Academy",
  description: "Best trading academy in the South",
  icons: "/images/logo.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <AuthModal />
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "min-w-xs w-fit flex p-3 select-none gap-3 justify-start items-center rounded-lg shadow-lg",
                title: "line-clamp-3",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
