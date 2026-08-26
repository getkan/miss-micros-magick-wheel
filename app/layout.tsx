import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miss Micro's Magick Wheel",
  description: "A magick wheel for the Miss Micro's Bookclub to select their next book",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased relative">
      <body className="bg-background text-offwhite flex min-h-screen w-screen flex-col items-center justify-center gap-4 p-4">{children}</body>
    </html>
  );
}
