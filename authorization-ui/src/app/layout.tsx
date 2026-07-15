import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeRegistry } from "./ThemeRegistry";

export const metadata: Metadata = {
  title: { default: "Authorization Server", template: "%s | Authorization Server" },
  description: "OAuth 2.1 / OpenID Connect Authorization Server",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
