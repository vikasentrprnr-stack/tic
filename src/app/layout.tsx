import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tic. | Global & India Macro",
  description: "Production macroeconomic intelligence & correlation engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-['Poppins',sans-serif] antialiased selection:bg-rose-500 selection:text-white bg-[#fcfcfc] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}