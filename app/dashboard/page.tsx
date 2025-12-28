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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [processingPayment, setProcessingPayment] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      fetchOrders(user.id);
    };

    getData();
  }, [router, supabase]);

  const fetchOrders = async (userId: string) => {
    const { data: ordersData, error: ordersError } = await supabase
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

    if (ordersError) {
      toast.error("Gagal memuat riwayat pesanan");
    } else {
      const transformedOrders = (ordersData || []).map((order: any) => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          material: Array.isArray(item.material)
            ? item.material[0] || null
            : item.material,
          motif: Array.isArray(item.motif) ? item.motif[0] || null : item.motif,
        })),
      }));
      setOrders(transformedOrders);
    }
    setLoading(false);
  };

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
      toast.error("Gagal update profil: " + error.message);
    } else {
      toast.success("Profil berhasil diperbarui!");
      setProfile({ ...profile, ...updates });
    }
    setUpdating(false);
  };

  const handlePay = (snapToken: string) => {
    if (!snapToken) return toast.error("Token pembayaran hilang");
    setProcessingPayment(true);

    if (typeof window.snap === "undefined") {
      toast.error("Sistem pembayaran sedang memuat...");
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
        toast("Pembayaran ditunda");
        setProcessingPayment(false);
      },
    });
  };

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

  const handleCancel = async (orderId: string) => {
    if (!confirm("Batalkan pesanan ini?")) return;
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
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

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "pending") return o.status === "pending";
    if (activeTab === "history")
      return ["paid", "shipped", "completed", "failed"].includes(o.status);
    return true;
  });

  const OrderList = ({ data }: { data: Order[] }) => {
    if (data.length === 0)
      return (
        <div className="h-40 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <ShoppingBag className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Tidak ada pesanan di kategori ini.</p>
        </div>
      );

    return (
      <div className="space-y-4 pr-3">
        {data.map((order) => (
          <Card
            key={order.id}
            className="border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-amber-400 transition-colors shadow-sm"
          >
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 py-3 px-4 flex flex-row justify-between items-center border-b dark:border-zinc-800">
              <div className="flex gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{" "}
                  {new Date(order.created_at).toLocaleDateString("id-ID")}
                </span>
                <span className="font-mono bg-white dark:bg-black px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800">
                  #{order.id.slice(0, 8)}
                </span>
              </div>
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">
                        {getItemType(item.bottom_hex_code)} -{" "}
                        {item.material?.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.motif?.name || "Polos"} (x{item.qty})
                      </p>
                    </div>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      {formatRupiah(item.price_at_purchase)}
                    </span>
                  </div>
                ))}

                <div className="border-t dark:border-zinc-800 pt-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <span className="text-xs text-zinc-500 block">Total</span>
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
                          className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none h-8 text-xs"
                        >
                          <XCircle className="w-3 h-3 sm:mr-1" /> Batal
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckStatus(order.id)}
                          disabled={checkingStatus === order.id}
                          className="flex-1 sm:flex-none h-8 text-xs"
                        >
                          {checkingStatus === order.id ? (
                            <Loader2 className="animate-spin w-3 h-3" />
                          ) : (
                            <RefreshCw className="w-3 h-3 sm:mr-1" />
                          )}{" "}
                          Cek
                        </Button>

                        {order.snap_token ? (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-none text-white h-8 text-xs"
                            onClick={() => handlePay(order.snap_token!)}
                            disabled={processingPayment}
                          >
                            <CreditCard className="w-3 h-3 sm:mr-1" /> Bayar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            className="text-xs text-zinc-400 h-8"
                          >
                            Token Expired
                          </Button>
                        )}
                      </>
                    )}
                    {["paid", "shipped"].includes(order.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-8 text-xs hover:bg-zinc-100"
                      >
                        <a href={`/invoice/${order.id}`} target="_blank">
                          Invoice
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_URL}
        strategy="afterInteractive"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />

      <Navbar />

      <main className="container mx-auto px-4 lg:px-6 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* --- KOLOM KIRI: PROFILE & MENU (Sticky) --- */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardContent className="pt-8 flex flex-col items-center text-center pb-6">
                <Avatar className="w-24 h-24 mb-4 border-4 border-white dark:border-zinc-800 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-amber-100 text-amber-700">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {profile?.full_name || "User"}
                </h2>
                <p className="text-xs text-zinc-500 mb-4">
                  {profile?.id.slice(0, 8)}...
                </p>

                {!profile?.phone_number || !profile?.address ? (
                  <div className="mt-2 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-100 w-full text-left flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />{" "}
                    <span>Lengkapi data pengiriman.</span>
                  </div>
                ) : (
                  <div className="mt-2 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg border border-green-100 w-full flex justify-center gap-2 items-center font-medium">
                    <CheckCircleIcon className="w-4 h-4" /> Akun Terverifikasi
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="hidden lg:block space-y-1">
              <Button
                variant="ghost"
                className="justify-start w-full text-zinc-600"
                onClick={() =>
                  document
                    .getElementById("profile")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <User className="w-4 h-4 mr-3" /> Edit Data Diri
              </Button>
              <Button
                variant="ghost"
                className="justify-start w-full text-zinc-600"
                onClick={() =>
                  document
                    .getElementById("orders")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <ShoppingBag className="w-4 h-4 mr-3" /> Riwayat Pesanan
              </Button>
            </div>
          </div>

          {/* --- KOLOM KANAN: UTAMA --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. SECTION RIWAYAT PESANAN (TABS + SCROLL) */}
            <div id="orders" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2 font-serif text-zinc-900 dark:text-white">
                  <Package className="w-6 h-6 text-amber-600" /> Riwayat Pesanan
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => profile && fetchOrders(profile.id)}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-2" /> Refresh Data
                </Button>
              </div>

              <Tabs
                defaultValue="all"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3 mb-4 bg-zinc-100 dark:bg-zinc-900/50">
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="pending">Menunggu Bayar</TabsTrigger>
                  <TabsTrigger value="history">Selesai / Batal</TabsTrigger>
                </TabsList>

                {/* SCROLL AREA UNTUK MENGATASI LIST KEPANJANGAN */}
                <ScrollArea className="h-[600px] pr-4 rounded-lg border border-transparent">
                  <TabsContent value="all" className="mt-0">
                    <OrderList data={orders} />
                  </TabsContent>
                  <TabsContent value="pending" className="mt-0">
                    <OrderList data={filteredOrders} />
                  </TabsContent>
                  <TabsContent value="history" className="mt-0">
                    <OrderList data={filteredOrders} />
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>

            {/* 2. SECTION EDIT PROFILE */}
            <div id="profile" className="pt-8 border-t dark:border-zinc-800">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 font-serif text-zinc-900 dark:text-white">
                <MapPin className="w-6 h-6 text-amber-600" /> Alamat Pengiriman
              </h3>
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label>Nama Penerima</Label>
                        <Input
                          name="fullname"
                          defaultValue={profile?.full_name || ""}
                          className="bg-zinc-50 dark:bg-zinc-900"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>No. WhatsApp Aktif</Label>
                        <Input
                          name="phone"
                          defaultValue={profile?.phone_number || ""}
                          className="bg-zinc-50 dark:bg-zinc-900"
                          required
                          placeholder="08..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Alamat Lengkap</Label>
                      <Textarea
                        name="address"
                        defaultValue={profile?.address || ""}
                        className="bg-zinc-50 dark:bg-zinc-900 min-h-[100px]"
                        placeholder="Nama Jalan, No. Rumah, RT/RW, Kecamatan, Kota, Kode Pos"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-zinc-900 text-white hover:bg-zinc-800 w-full sm:w-auto"
                        disabled={updating}
                      >
                        {updating ? (
                          <Loader2 className="animate-spin mr-2" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}{" "}
                        Simpan Perubahan
                      </Button>
                    </div>
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
