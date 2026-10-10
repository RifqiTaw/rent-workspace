import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { WorkspaceStoreHydrator } from "@/features/workspace/components/workspace-store-hydrator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Workspace Builder | monis.rent",
    template: "%s | monis.rent",
  },
  description:
    "Design your ideal workspace and rent desks, chairs, and accessories in a few clicks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <WorkspaceStoreHydrator />
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
