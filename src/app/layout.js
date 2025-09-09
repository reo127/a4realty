import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navber from "./components/Navber";
import ChatBot from "./components/ChatBot";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "A4Realty - Premium Property Solutions",
  description: "Discover premium properties, new projects, and verified listings with A4Realty. Your trusted partner for buying, selling, and renting properties.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/finalLogo.jpeg" type="image/jpeg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <Navber/>
        {children}
        <Analytics />
        <ChatBot/>
      </body>
    </html>
  );
}
