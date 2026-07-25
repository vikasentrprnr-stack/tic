"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Moon, Sun, Menu, X, Globe, Cpu, TableProperties } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Overview", path: "/", icon: Globe },
    { name: "ML Engine", path: "/ml-engine", icon: Cpu },
    { name: "Indicators", path: "/indicators", icon: TableProperties },
  ];

  return (
    <header className="w-full border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl font-['Poppins',sans-serif]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6 relative z-50">
        
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white flex-shrink-0">
          Tic<span className="text-blue-600">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-100 dark:bg-[#121212] p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${pathname === link.path ? "bg-blue-600 text-white shadow-md" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"}`}>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-48 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticker or country..." className="w-full bg-neutral-100 dark:bg-[#121212] text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-blue-500 transition-all" />
          </form>
          {mounted && (
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="p-2.5 rounded-xl bg-neutral-100 dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center gap-2">
          {mounted && (
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#121212] text-neutral-600 dark:text-neutral-300 active:scale-95 transition-transform">
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl bg-blue-600 text-white active:scale-95 transition-transform">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="sm:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-neutral-200 dark:border-neutral-800 px-4 py-6 shadow-2xl"
          >
            <form onSubmit={handleSearch} className="relative w-full mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticker or country..." className="w-full bg-neutral-100 dark:bg-[#121212] text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400 pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-blue-500" />
            </form>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.name} href={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${pathname === link.path ? "bg-blue-600 text-white shadow-md" : "bg-neutral-50 dark:bg-[#121212] text-neutral-700 dark:text-neutral-300"}`}>
                    <Icon className="w-4 h-4" /> {link.name}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}