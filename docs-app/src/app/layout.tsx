import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles.css";
import "./flow-pages.css";

export const metadata: Metadata = {
  title: "Auth Services Workspace",
  description: "OAuth 2.1 / OpenID Connectをコードから理解するための検証環境",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
