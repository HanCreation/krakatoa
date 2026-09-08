import type { Metadata } from "next";
import Atlas from "../components/Atlas";
import "./globals.css";
export const metadata: Metadata = {
  title: "Krakatau — A living earth",
  description:
    "Explore the volcano that remade the Sunda Strait. An interactive 3D field guide to Krakatau.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Atlas />
        {children}
      </body>
    </html>
  );
}
