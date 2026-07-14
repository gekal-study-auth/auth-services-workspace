import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Auth Services Workspace",
    template: "%s | Auth Services Workspace",
  },
  description: "OAuth 2.1 / OpenID Connect learning workspace",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
