import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Dubtrack",
  description: "Made by jwaguirr",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}
