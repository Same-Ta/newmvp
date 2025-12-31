import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "멘토-멘티 채팅",
  description: "멘토와 멘티를 위한 채팅 어플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
