import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "../components/theme/theme-provider";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
// import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Toaster } from "sonner";
import { Providers } from "../components/providers";
import { cn } from "@/lib/utils";
// import { fontSans } from "../lib/fonts";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EduStation - Your Campus Companion",
  description:
    "A platform for students to buy, sell, and borrow textbooks, stationary, and find accommodation within their college community.",
  keywords: [
    "college",
    "textbooks",
    "stationary",
    "accommodation",
    "student",
    "campus",
    "marketplace",
  ],
  authors: [{ name: "EduStation Team" }],
  creator: "EduStation",
  publisher: "EduStation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased pt-16"
          // fontSans.variable
        )}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className={inter.className}>
              <Navbar />
              <ToastContainer />
              <div className="min-h-screen">{children}</div>
              <Footer />
            </div>
            <Toaster position="top-center" richColors />
            {/* <ThemeSwitcher /> */}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
