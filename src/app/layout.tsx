import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "취준로드 - 대기업 현직자 멘토와 1:1 채팅",
  description: "삼성, LG, 네이버, 카카오 등 대기업 현직자 멘토들과 실시간으로 취업 상담하세요. 취준생을 위한 멘토링 플랫폼",
  keywords: ["취준", "멘토링", "대기업 취업", "현직자 상담", "취업 정보", "취준로드"],
  openGraph: {
    title: "취준로드",
    description: "대기업 현직자 멘토와 1:1 실시간 취업 상담",
    type: "website",
  },
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
