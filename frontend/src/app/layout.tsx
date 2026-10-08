import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-family" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading-family",
  weight: ["400", "600", "700", "800"],
});

export const metadata = {
  title: "SmartChef AI",
  description: "AI-Powered Culinary Intelligence — Vision, Agents & Vector Memory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, playfair.variable)}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
