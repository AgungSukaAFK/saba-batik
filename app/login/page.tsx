"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Chrome,
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

// Wajib dibungkus Suspense agar build aman (karena pakai useSearchParams)
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-amber-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil URL tujuan dari parameter ?next=... (Default ke /dashboard)
  const nextUrl = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. LOGIN GOOGLE
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const origin = location.origin; // ex: http://localhost:3000

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirect ke route callback kita + bawa info nextUrl
        redirectTo: `${origin}/auth/callback?next=${nextUrl}`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  // 2. LOGIN / REGISTER EMAIL
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullname") as string;
    const phone = formData.get("phone") as string;

    try {
      if (isRegister) {
        // --- REGISTER ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone_number: phone, // Simpan no hp ke metadata user
            },
          },
        });
        if (error) throw error;

        alert("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
        setIsRegister(false); // Balik ke mode login
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Login sukses -> Redirect ke halaman tujuan (Simulasi/Dashboard)
        router.push(nextUrl);
        router.refresh(); // Refresh agar navbar update
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 p-8 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-amber-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-3 h-3 mr-1 transition-transform group-hover:-translate-x-1" />{" "}
          Kembali ke Beranda
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-2">
            {isRegister ? "Buat Akun Baru" : "Selamat Datang"}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isRegister
              ? "Lengkapi data diri untuk mulai berkarya."
              : "Masuk untuk melanjutkan desain batik Anda."}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center">
            <span className="font-bold mr-1">Error:</span> {errorMsg}
          </div>
        )}

        {/* --- TOMBOL GOOGLE --- */}
        <Button
          variant="outline"
          className="w-full h-12 text-sm font-medium mb-6 relative hover:bg-zinc-50 dark:hover:bg-zinc-800"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <Chrome className="mr-2 w-4 h-4 text-red-500" />
          )}
          {isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-700"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">
              Atau manual
            </span>
          </div>
        </div>

        {/* --- FORM EMAIL --- */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama Lengkap</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      name="fullname"
                      required
                      placeholder="Nama Anda"
                      className="pl-9 bg-zinc-50/50 dark:bg-black/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nomor WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                      name="phone"
                      type="tel"
                      required
                      placeholder="0812..."
                      className="pl-9 bg-zinc-50/50 dark:bg-black/50"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  className="pl-9 bg-zinc-50/50 dark:bg-black/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs">Password</Label>
                {!isRegister && (
                  <Link
                    href="#"
                    className="text-[10px] text-amber-600 hover:underline"
                  >
                    Lupa password?
                  </Link>
                )}
              </div>
              <Input
                name="password"
                type="password"
                required
                placeholder="••••••"
                minLength={6}
                className="bg-zinc-50/50 dark:bg-black/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-lg shadow-amber-900/20 mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : isRegister ? (
              "Buat Akun"
            ) : (
              "Masuk Sekarang"
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500">
          {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-amber-600 font-bold hover:underline transition-all"
          >
            {isRegister ? "Login disini" : "Daftar sekarang"}
          </button>
        </p>
      </Card>
    </div>
  );
}
