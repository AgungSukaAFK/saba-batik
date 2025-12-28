"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Efek glassmorphism saat di-scroll
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper untuk mengecek link aktif
  const isActive = (path: string) => pathname === path;

  if (!mounted) return null;

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Simulasi", href: "/simulasi" },
    { name: "Galeri Motif", href: "/gallery" },
    { name: "Tentang Kami", href: "/about" }, // Bisa di-uncomment nanti
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50 relative">
          <div className="w-9 h-9 bg-amber-600 rounded-tr-xl rounded-bl-xl flex items-center justify-center text-white font-bold text-lg group-hover:rotate-6 transition-transform shadow-lg shadow-amber-600/20">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Saba<span className="text-amber-600">Batik</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive(item.href)
                  ? "bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-500"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400 focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <Button
            variant="ghost"
            className="rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            Masuk
          </Button>

          <Button
            asChild
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shadow-amber-600/20 px-6"
          >
            <Link href="/simulasi">
              <Sparkles className="mr-2 h-4 w-4" />
              Mulai Desain
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden z-50">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="p-2 text-zinc-900 dark:text-zinc-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-15 bg-white dark:bg-black z-40 md:hidden flex flex-col p-6"
          >
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-lg font-medium py-4 border-b border-zinc-100 dark:border-zinc-900 ${
                    isActive(item.href)
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex gap-4 mt-8">
                <Button
                  className="w-full h-12 rounded-full bg-amber-600 text-lg"
                  asChild
                >
                  <Link
                    href="/simulasi"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mulai Simulasi
                  </Link>
                </Button>
              </div>

              <div className="mt-4 text-center">
                <Button variant="link" className="text-zinc-500">
                  Masuk sebagai Admin
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
