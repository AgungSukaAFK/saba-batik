"use client"; // Pastikan ini client component

import { createClient } from "@/utils/supabase/client"; //
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ShoppingCart, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ... import ThemeToggle (sesuai kode lama Anda)

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Cek user saat mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listener realtime login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === "SIGNED_OUT") router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-serif font-bold text-amber-700 dark:text-amber-500"
        >
          Saba Batik
        </Link>

        {/* MENU TENGAH */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link href="/" className="hover:text-amber-600">
            Beranda
          </Link>
          <Link href="/gallery" className="hover:text-amber-600">
            Galeri Motif
          </Link>
          <Link href="/simulasi" className="hover:text-amber-600">
            Simulasi
          </Link>
          <Link href="/about" className="hover:text-amber-600">
            Tentang Kami
          </Link>
        </div>

        {/* MENU KANAN (AUTH) */}
        <div className="flex items-center gap-4">
          {/* Cart Icon (Dummy) */}
          <Button size="icon" variant="ghost">
            <ShoppingCart className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </Button>

          {user ? (
            // JIKA SUDAH LOGIN: TAMPILKAN DROPDOWN USER
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <UserCircle className="h-8 w-8 text-amber-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    Dashboard Saya
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/orders" className="cursor-pointer">
                    Riwayat Pesanan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // JIKA BELUM LOGIN
            <Button
              asChild
              size="sm"
              className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 rounded-full px-6"
            >
              <Link href="/login">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
