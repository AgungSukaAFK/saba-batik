"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; //
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // Toggle Login/Register

  // 1. Login dengan Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`, // Kita buat route ini nanti
      },
    });

    if (error) {
      alert("Gagal login Google: " + error.message);
      setLoading(false);
    }
  };

  // 2. Login/Register Email Manual (Opsional jika Google bermasalah)
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string; // Ambil no telp saat register

    if (isRegister) {
      // REGISTER
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Metadata tambahan disimpan di tabel auth.users lalu di-trigger ke profiles
            phone_number: phone,
            full_name: formData.get("fullname"),
          },
        },
      });
      if (error) alert("Register Gagal: " + error.message);
      else alert("Cek email Anda untuk verifikasi!");
    } else {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert("Login Gagal: " + error.message);
      else router.push("/"); // Redirect ke home/dashboard
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
        </Link>

        <h1 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white mb-2">
          {isRegister ? "Buat Akun Baru" : "Selamat Datang Kembali"}
        </h1>
        <p className="text-zinc-500 mb-6 text-sm">
          {isRegister
            ? "Bergabunglah untuk mulai mendesain batik impianmu."
            : "Masuk untuk melihat riwayat pesanan dan desain."}
        </p>

        {/* --- TOMBOL GOOGLE --- */}
        <Button
          variant="outline"
          className="w-full h-12 text-base font-medium mb-6 relative"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Chrome className="mr-2 w-5 h-5 text-red-500" />
          )}
          Masuk dengan Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-700"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">
              Atau email
            </span>
          </div>
        </div>

        {/* --- FORM EMAIL --- */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input name="fullname" required placeholder="Joko Widodo" />
              </div>
              {/* INPUT WAJIB NOMOR TELEPON */}
              <div className="space-y-2">
                <Label>Nomor Telepon (Wajib)</Label>
                <Input name="phone" type="tel" required placeholder="0812..." />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              name="password"
              type="password"
              required
              placeholder="******"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isRegister ? (
              "Daftar Sekarang"
            ) : (
              "Masuk"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-amber-600 font-bold hover:underline"
          >
            {isRegister ? "Login disini" : "Daftar disini"}
          </button>
        </p>
      </div>
    </div>
  );
}
