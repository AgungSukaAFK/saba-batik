"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Cek user & role saat mount
  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Cek Role di tabel profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile && profile.role === "admin") {
          setIsAdmin(true);
        }
      }
    };

    getUserData();

    // Listener realtime
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }

      if (_event === "SIGNED_OUT") router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // --- REVISI LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Reset state lokal agar UI langsung update
    setUser(null);
    setIsAdmin(false);

    // Redirect ke Landing Page
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
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
          <Link href="/" className="hover:text-amber-600 transition-colors">
            Beranda
          </Link>
          <Link
            href="/gallery"
            className="hover:text-amber-600 transition-colors"
          >
            Galeri Motif
          </Link>
          <Link
            href="/simulasi"
            className="hover:text-amber-600 transition-colors"
          >
            Simulasi
          </Link>
          <Link
            href="/about"
            className="hover:text-amber-600 transition-colors"
          >
            Tentang Kami
          </Link>
        </div>

        {/* MENU KANAN */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer relative p-0.5 h-9 w-9 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:ring-2 hover:ring-amber-500 transition-all ">
                  {user.user_metadata.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <Image
                      width={100}
                      height={100}
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="h-full w-full rounded-full"
                    />
                  ) : (
                    <UserCircle className="h-full w-full text-zinc-400" />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* --- MENU KHUSUS ADMIN --- */}
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      asChild
                      className="bg-amber-50 dark:bg-amber-900/20 focus:bg-amber-100 dark:focus:bg-amber-900/40"
                    >
                      <Link
                        href="/admin"
                        className="cursor-pointer font-bold text-amber-700 dark:text-amber-500 flex items-center"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {/* ------------------------- */}

                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    Dashboard User
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard#orders" className="cursor-pointer">
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
            <Button
              asChild
              size="sm"
              className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 rounded-full px-6 ml-2"
            >
              <Link href="/login">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
