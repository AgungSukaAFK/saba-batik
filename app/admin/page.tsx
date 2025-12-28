"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  DollarSign,
  ShoppingBag,
  Truck,
  CheckCircle,
  FileText,
  MapPin,
  Phone,
  User,
  Tags,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

// --- TIPE DATA ---
type Material = { id: number; name: string; base_price: number };
type Motif = {
  id: number;
  name: string;
  price_modifier: number;
  image_url: string;
};

type OrderItem = {
  id: string;
  qty: number;
  price_at_purchase: number;
  material: { name: string } | null;
  motif: { name: string } | null;
  bottom_hex_code: string | null;
};

type Order = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    phone_number: string;
    address: string;
    email: string;
  } | null;
  order_items: OrderItem[];
};

export default function AdminDashboard() {
  const supabase = createClient();

  // State Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [motifs, setMotifs] = useState<Motif[]>([]);

  // State Loading & Stats
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    count: 0,
    pendingShipment: 0,
  });
  const [activeTab, setActiveTab] = useState("shipment");

  // State Input Harga Sementara
  const [editingPrice, setEditingPrice] = useState<{
    id: string | number;
    val: number;
  } | null>(null);

  // --- FETCH DATA (MANUAL JOIN) ---
  const fetchData = async () => {
    // Note: Kita set loading false biar UI ga kedip parah pas refresh harga
    // setLoading(true);

    try {
      const { data: rawOrders, error: errOrder } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: rawItems } = await supabase.from("order_items").select("*");
      const { data: rawProfiles } = await supabase.from("profiles").select("*");
      const { data: rawMaterials } = await supabase
        .from("materials")
        .select("*")
        .order("id");
      const { data: rawMotifs } = await supabase
        .from("motifs")
        .select("*")
        .order("id");

      if (errOrder) throw errOrder;

      setMaterials(rawMaterials || []);
      setMotifs(rawMotifs || []);

      const joinedOrders: Order[] = (rawOrders || []).map((order) => {
        const userProfile = rawProfiles?.find((p) => p.id === order.user_id);
        const orderItems = (rawItems || [])
          .filter((item) => item.order_id === order.id)
          .map((item) => {
            const mat = rawMaterials?.find((m) => m.id === item.material_id);
            const mot = rawMotifs?.find((m) => m.id === item.motif_id);
            return {
              ...item,
              material: mat ? { name: mat.name } : { name: "Unknown" },
              motif: mot ? { name: mot.name } : null,
            };
          });

        return {
          ...order,
          profiles: userProfile
            ? {
                full_name: userProfile.full_name || "Tanpa Nama",
                phone_number: userProfile.phone_number || "-",
                address: userProfile.address || "Alamat kosong",
                email: "user@batik.com",
              }
            : null,
          order_items: orderItems,
        };
      });

      setOrders(joinedOrders);

      const paidOrders = joinedOrders.filter(
        (o) => o.status !== "pending" && o.status !== "failed"
      );
      const revenue = paidOrders.reduce(
        (acc, curr) => acc + curr.total_amount,
        0
      );
      const pendingShipment = joinedOrders.filter(
        (o) => o.status === "paid"
      ).length;

      setStats({ revenue, count: joinedOrders.length, pendingShipment });
    } catch (e: any) {
      console.error(e);
      toast.error("Gagal mengambil data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // Loading awal saja
    fetchData();
  }, []);

  // --- ACTION HANDLERS ---
  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) toast.error("Gagal update status");
    else {
      toast.success(`Status diubah: ${newStatus.toUpperCase()}`);
      fetchData();
    }
  };

  const handleSavePrice = async (
    type: "material" | "motif",
    id: number,
    newPrice: number
  ) => {
    const table = type === "material" ? "materials" : "motifs";
    const column = type === "material" ? "base_price" : "price_modifier";

    const { error } = await supabase
      .from(table)
      .update({ [column]: newPrice })
      .eq("id", id);

    if (error) {
      toast.error("Database Error: " + error.message);
    } else {
      toast.success("Harga berhasil diperbarui!");
      setEditingPrice(null); // Reset mode edit
      fetchData(); // Refresh data dari DB
    }
  };

  // --- HELPERS ---
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  const getItemType = (hex: string | null) =>
    hex?.includes("Atasan")
      ? "Atasan"
      : hex?.includes("Bawahan")
      ? "Bawahan"
      : "Item";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  // --- SUB-COMPONENTS ---
  const OrderRow = ({ order }: { order: Order }) => (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-4 bg-white dark:bg-zinc-900 shadow-sm hover:border-amber-400 transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono">
              {order.id.slice(0, 8)}
            </Badge>
            <span className="text-xs text-zinc-500">
              {new Date(order.created_at).toLocaleString("id-ID")}
            </span>
          </div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" />{" "}
            {order.profiles?.full_name || "Tanpa Nama"}
          </h3>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-md border dark:border-zinc-800">
            <p className="flex items-start gap-2">
              <MapPin className="w-3 h-3 mt-1 shrink-0" />{" "}
              {order.profiles?.address || "Alamat kosong"}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3 h-3 shrink-0" />{" "}
              {order.profiles?.phone_number || "-"}
            </p>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2">
            Item Pesanan
          </h4>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-1 last:border-0"
              >
                <span>
                  <span className="font-semibold">
                    {getItemType(item.bottom_hex_code)}
                  </span>{" "}
                  <span className="text-zinc-500">
                    {" "}
                    - {item.material?.name} ({item.motif?.name || "Polos"})
                  </span>
                </span>
                <span className="font-mono text-zinc-500">x{item.qty}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center pt-2 border-t border-dashed">
            <span className="text-sm font-medium">Total Omzet</span>
            <span className="text-lg font-bold text-amber-600">
              {formatRupiah(order.total_amount)}
            </span>
          </div>
        </div>
        <div className="flex-none w-full lg:w-[200px] flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-400">
              Status Order
            </label>
            <Select
              defaultValue={order.status}
              onValueChange={(val) => updateStatus(order.id, val)}
            >
              <SelectTrigger
                className={`h-9 ${getStatusColor(
                  order.status
                )} border-0 ring-1 ring-black/5`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid (Siap Kirim)</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full justify-start"
          >
            <Link href={`/invoice/${order.id}`} target="_blank">
              <FileText className="w-4 h-4 mr-2 text-zinc-500" /> Cetak Invoice
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-6 pt-28 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="text-amber-600" /> Admin Dashboard
            </h1>
            <p className="text-zinc-500">
              Pusat kendali pesanan dan manajemen toko.
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <Loader2 className="w-3 h-3 mr-2" /> Refresh Data
          </Button>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Omzet</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-500">
                {formatRupiah(stats.revenue)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Perlu Dikirim
              </CardTitle>
              <Truck className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {stats.pendingShipment}
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pesanan
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-500">
                {stats.count}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- TABS --- */}
        <Tabs
          defaultValue="shipment"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 bg-white dark:bg-zinc-900 border dark:border-zinc-800 grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="shipment">
              Pengiriman ({stats.pendingShipment})
            </TabsTrigger>
            <TabsTrigger value="all">Semua Order</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
            <TabsTrigger value="prices" className="flex gap-2">
              <Tags className="w-3 h-3" /> Kelola Harga
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] pr-4">
            <TabsContent value="shipment" className="mt-0 space-y-4">
              {orders.filter((o) => o.status === "paid").length === 0 ? (
                <div className="text-center py-12 text-zinc-400 border-2 border-dashed rounded-xl">
                  Semua pesanan sudah dikirim!
                </div>
              ) : (
                orders
                  .filter((o) => o.status === "paid")
                  .map((order) => <OrderRow key={order.id} order={order} />)
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-0 space-y-4">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="mt-0 space-y-4">
              {orders
                .filter((o) =>
                  ["shipped", "completed", "failed"].includes(o.status)
                )
                .map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
            </TabsContent>

            {/* 4. TAB KELOLA HARGA (FIXED STATE) */}
            <TabsContent value="prices" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* DAFTAR HARGA BAHAN KAIN */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Harga Bahan Kain</CardTitle>
                    <CardDescription>
                      Harga dasar per baju sebelum motif.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {materials.map((mat) => (
                      // PENTING: Key disini menggunakan base_price untuk trigger re-render saat data berubah
                      <div
                        key={`mat-${mat.id}-${mat.base_price}`}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800"
                      >
                        <div className="font-medium">{mat.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="relative w-32">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                              Rp
                            </span>
                            <Input
                              type="number"
                              className="pl-8 h-8 text-right"
                              defaultValue={mat.base_price}
                              onChange={(e) =>
                                setEditingPrice({
                                  id: `mat-${mat.id}`,
                                  val: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          {/* Logic tombol save hanya muncul jika sedang diedit */}
                          {editingPrice?.id === `mat-${mat.id}` && (
                            <Button
                              size="icon"
                              className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                handleSavePrice(
                                  "material",
                                  mat.id,
                                  editingPrice.val
                                )
                              }
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* DAFTAR HARGA MOTIF */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Harga Motif Batik</CardTitle>
                    <CardDescription>
                      Biaya tambahan (add-on) untuk motif.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {motifs.map((mot) => (
                      // PENTING: Key disini menggunakan price_modifier untuk trigger re-render
                      <div
                        key={`mot-${mot.id}-${mot.price_modifier}`}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded overflow-hidden bg-white border">
                            <Image
                              src={mot.image_url}
                              alt={mot.name}
                              fill
                              className="object-cover dark:invert"
                            />
                          </div>
                          <span className="font-medium">{mot.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative w-32">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                              +Rp
                            </span>
                            <Input
                              type="number"
                              className="pl-8 h-8 text-right"
                              defaultValue={mot.price_modifier}
                              onChange={(e) =>
                                setEditingPrice({
                                  id: `mot-${mot.id}`,
                                  val: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          {editingPrice?.id === `mot-${mot.id}` && (
                            <Button
                              size="icon"
                              className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                handleSavePrice(
                                  "motif",
                                  mot.id,
                                  editingPrice.val
                                )
                              }
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </main>
    </div>
  );
}
