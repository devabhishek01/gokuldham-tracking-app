import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "ResqTrack | Animal Rescue CRM",
  description: "Centralized Management System for Animal Rescue & Ambulance Operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f6f8] text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
