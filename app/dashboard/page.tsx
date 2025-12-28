"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  MapPin,
  Phone,
  User,
  Package,
  ShoppingBag,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  XCircle,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

// --- TYPES ---
type Profile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
};

type OrderItem = {
  id: string;
  price_at_purchase: number;
  qty: number;
  material: { name: string } | null;
  motif: { name: string } | null;
  bottom_hex_code: string | null;
};

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  snap_token: string | null;
  order_items: OrderItem[];
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false); // New State

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Orders
      fetchOrders(user.id);
    };
    getData();
  }, [router, supabase]);

  const fetchOrders = async (userId: string) => {
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select(
        `
        id, created_at, total_amount, status, snap_token,
        order_items (
          id, price_at_purchase, qty, bottom_hex_code,
          material:materials(name), motif:motifs(name)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) toast.error("Gagal memuat order");
    else {
      const transformedOrders = (ordersData || []).map((order: any) => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          material: item.material?.[0] || null,
          motif: item.motif?.[0] || null,
        })),
      }));
      setOrders(transformedOrders);
    }
    setLoading(false);
  };

  // --- ACTIONS ---

  // 1. UPDATE PROFILE
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
    if (error) toast.error(error.message);
    else {
      toast.success("Profil tersimpan!");
      setProfile({ ...profile, ...updates });
    }
    setUpdating(false);
  };

  // 2. PAY NOW (Resume)
  const handlePay = (snapToken: string) => {
    if (!snapToken) {
      toast.error(
        "Token pembayaran belum tersedia. Coba refresh atau buat order baru."
      );
      return;
    }

    setProcessingPayment(true);

    // Pastikan Snap sudah load
    if (typeof window.snap === "undefined") {
      toast.error(
        "Sistem pembayaran sedang memuat, silakan tunggu sebentar..."
      );
      setProcessingPayment(false);
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: () => {
        toast.success("Pembayaran Berhasil!");
        window.location.reload();
      },
      onPending: () => {
        toast.info("Menunggu pembayaran...");
        window.location.reload();
      },
      onError: () => toast.error("Pembayaran Gagal"),
      onClose: () => {
        toast("Jendela pembayaran ditutup");
        setProcessingPayment(false);
      },
    });
  };

  // 3. CHECK STATUS
  const handleCheckStatus = async (orderId: string) => {
    setCheckingStatus(orderId);
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (data.newStatus === "paid") toast.success("LUNAS!");
        else toast.info(`Status: ${data.newStatus.toUpperCase()}`);

        // Refresh
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) fetchOrders(user.id);
      } else {
        toast.error("Gagal cek status");
      }
    } catch {
      toast.error("Koneksi error");
    } finally {
      setCheckingStatus(null);
    }
  };

  // 4. CANCEL
  const handleCancel = async (orderId: string) => {
    if (!confirm("Batalkan pesanan ini?")) return;

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.success("Pesanan Dibatalkan");
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) fetchOrders(user.id);
      } else {
        toast.error("Gagal membatalkan");
      }
    } catch {
      toast.error("Koneksi error");
    }
  };

  // UI HELPERS
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };
  const getItemType = (hex: string | null) =>
    hex?.includes("Atasan")
      ? "Atasan"
      : hex?.includes("Bawahan")
      ? "Bawahan"
      : "Item";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* SCRIPT MIDTRANS FIX STRATEGY */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_URL}
        strategy="afterInteractive"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => {
          console.log("Midtrans Script Loaded");
        }}
      />

      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-12">
        <h1 className="text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-8">
          Dashboard Saya
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROFILE SUMMARY */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-8 flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-amber-100 text-amber-700">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {profile?.full_name || "User"}
                </h2>
                {!profile?.phone_number || !profile?.address ? (
                  <div className="mt-4 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-100 w-full text-left flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                    <span>Lengkapi Alamat & HP untuk pengiriman.</span>
                  </div>
                ) : (
                  <div className="mt-4 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg border border-green-100 w-full flex justify-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" /> Akun Siap
                  </div>
                )}
              </CardContent>
            </Card>

            <nav className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start h-12" asChild>
                <a href="#orders">
                  <ShoppingBag className="w-4 h-4 mr-3" /> Pesanan
                </a>
              </Button>
              <Button variant="ghost" className="justify-start h-12" asChild>
                <a href="#profile">
                  <User className="w-4 h-4 mr-3" /> Profil
                </a>
              </Button>
            </nav>
          </div>

          {/* CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* ORDER LIST */}
            <div id="orders" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" /> Riwayat Pesanan
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => profile && fetchOrders(profile.id)}
                >
                  <RefreshCw className="w-3 h-3 mr-2" /> Refresh
                </Button>
              </div>

              {orders.length === 0 ? (
                <Card className="border-dashed bg-transparent shadow-none">
                  <CardContent className="h-40 flex flex-col items-center justify-center text-zinc-500">
                    <p>Belum ada pesanan.</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push("/simulasi")}
                    >
                      Buat Pesanan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card
                    key={order.id}
                    className="overflow-hidden hover:border-amber-400 transition-colors"
                  >
                    <CardHeader className="bg-zinc-50/50 py-3 px-4 flex flex-row justify-between items-center border-b">
                      <div className="flex gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                        <span className="font-mono">
                          #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(order.status)}
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <div>
                            <p className="font-bold">
                              {getItemType(item.bottom_hex_code)} -{" "}
                              {item.material?.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {item.motif?.name || "Polos"} (x{item.qty})
                            </p>
                          </div>
                          <span className="font-mono">
                            {formatRupiah(item.price_at_purchase)}
                          </span>
                        </div>
                      ))}

                      <div className="border-t pt-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <span className="text-xs text-zinc-500 block">
                            Total
                          </span>
                          <span className="text-lg font-bold text-amber-600">
                            {formatRupiah(order.total_amount)}
                          </span>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {order.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(order.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                              >
                                <XCircle className="w-4 h-4 sm:mr-2" />{" "}
                                <span className="hidden sm:inline">Batal</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCheckStatus(order.id)}
                                disabled={checkingStatus === order.id}
                                className="flex-1"
                              >
                                {checkingStatus === order.id ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                  <RefreshCw className="w-4 h-4 sm:mr-2" />
                                )}{" "}
                                <span className="hidden sm:inline">Cek</span>
                              </Button>

                              {/* TOMBOL BAYAR (Hanya jika token ada) */}
                              {order.snap_token ? (
                                <Button
                                  size="sm"
                                  className="bg-amber-600 hover:bg-amber-700 flex-1 text-white"
                                  onClick={() => handlePay(order.snap_token!)}
                                  disabled={processingPayment}
                                >
                                  <CreditCard className="w-4 h-4 sm:mr-2" />{" "}
                                  Bayar
                                </Button>
                              ) : (
                                // Jika pending tapi token hilang (kasus order lama/error)
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled
                                  className="text-xs text-zinc-400"
                                >
                                  Token Hilang
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* EDIT PROFILE */}
            <div id="profile">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-amber-600" /> Data Pengiriman
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input
                          name="fullname"
                          defaultValue={profile?.full_name || ""}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>No HP/WA</Label>
                        <Input
                          name="phone"
                          defaultValue={profile?.phone_number || ""}
                          required
                          placeholder="08..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Alamat</Label>
                      <Textarea
                        name="address"
                        defaultValue={profile?.address || ""}
                        required
                        placeholder="Alamat lengkap..."
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}{" "}
                      Simpan
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}
