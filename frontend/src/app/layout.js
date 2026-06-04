import { Inter, Outfit } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import ToastContainer from "@/components/ToastContainer";
import Script from "next/script";
import "./globals.css";

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "PlayGround | Discover & Book Sports Venues",
  description: "Find the best box cricket, turf, and courts near you. Book instantly and play with friends.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        {/* Google Places API — loaded after the page becomes interactive */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
        <ToastProvider>
          <AuthProvider>
            <ToastContainer />
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

