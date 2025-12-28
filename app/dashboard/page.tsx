"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, MapPin, Phone, User, Package } from "lucide-react";
import { toast } from "sonner"; // Pastikan install sonner: npm install sonner

// Tipe data profil
type Profile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Fetch Data User & Profile
  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    getProfile();
  }, [router, supabase]);

  // Handle Update Profile
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    if (!profile) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get("fullname") as string,
      phone_number: formData.get("phone") as string,
      address: formData.get("address") as string,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      alert("Gagal update profil: " + error.message);
    } else {
      alert("Profil berhasil diperbarui!");
      setProfile({ ...profile, ...updates });
    }
    setUpdating(false);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-12">
        <h1 className="text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-2">
          Dashboard Saya
        </h1>
        <p className="text-zinc-500 mb-8">
          Kelola informasi akun dan pantau pesanan Anda.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KOLOM KIRI: SUMMARY & AVATAR */}
          <div className="space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-zinc-100 dark:border-zinc-800">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-amber-100 text-amber-700">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {profile?.full_name || "Pengguna Baru"}
                </h2>
                <p className="text-sm text-zinc-500 mb-4">Member sejak 2024</p>

                {!profile?.phone_number || !profile?.address ? (
                  <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-md w-full">
                    ⚠️ Profil belum lengkap. Harap isi Nomor HP & Alamat untuk
                    pengiriman.
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-600 text-xs px-3 py-2 rounded-md w-full flex items-center justify-center gap-2">
                    ✅ Akun Terverifikasi
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Navigasi Dashboard (Opsional kalau mau dipisah page) */}
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <a href="#profile">
                  <User className="w-4 h-4 mr-2" /> Edit Profil
                </a>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href="#orders">
                  <Package className="w-4 h-4 mr-2" /> Riwayat Pesanan
                </a>
              </Button>
            </div>
          </div>

          {/* KOLOM KANAN: FORM DATA DIRI */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Edit Profil */}
            <Card id="profile" className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Informasi Pengiriman</CardTitle>
                <CardDescription>
                  Data ini akan digunakan otomatis saat Anda checkout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Lengkap</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                          name="fullname"
                          defaultValue={profile?.full_name || ""}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nomor Telepon / WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                          name="phone"
                          type="tel"
                          defaultValue={profile?.phone_number || ""}
                          className="pl-9"
                          required
                          placeholder="Contoh: 08123456789"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Alamat Lengkap</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Textarea
                        name="address"
                        defaultValue={profile?.address || ""}
                        className="pl-9 min-h-[100px]"
                        placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Placeholder Riwayat Pesanan */}
            <Card
              id="orders"
              className="border-zinc-200 dark:border-zinc-800 opacity-60"
            >
              <CardHeader>
                <CardTitle>Riwayat Pesanan</CardTitle>
                <CardDescription>
                  Anda belum memiliki pesanan aktif.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-40 flex items-center justify-center border-t border-dashed">
                <p className="text-zinc-500 text-sm">
                  Pesanan Anda akan muncul di sini setelah checkout.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
