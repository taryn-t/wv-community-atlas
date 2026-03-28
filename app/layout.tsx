import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Navigation/Sidebar";
import {MapContextProvider} from "@/lib/context/MapContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WV Community Atlas",
  description: "A data visualization tool for exploring county-level data across West Virginia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MapContextProvider>
          <div className="content">
            <main >
              
              {children}
              <Sidebar />
            </main>
            
          </div>
        </MapContextProvider>
          
      
       
        
      </body>
    </html>
  );
}
