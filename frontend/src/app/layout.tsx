import "./globals.css";

export const metadata = {
  title: "SmartChef AI",
  description: "AI Kitchen Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}