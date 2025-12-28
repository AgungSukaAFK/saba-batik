"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Jika belum ada, gunakan div biasa atau install shadcn table
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  DollarSign,
  ShoppingBag,
  Truck,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner"; // Opsional

type Order = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
};

export default function AdminDashboard() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, count: 0 });

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    // Join tabel orders dengan profiles (user)
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id, 
        total_amount, 
        status, 
        created_at,
        profiles (full_name) 
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Gagal ambil data order");
    } else {
      // Mapping data agar lebih mudah dibaca
      const formatted = data.map((item: any) => ({
        id: item.id,
        total_amount: item.total_amount,
        status: item.status,
        created_at: item.created_at,
        user: {
          full_name: item.profiles?.full_name || "Unknown",
          email: "-", // Email ada di auth.users, agak tricky diambil di client join, kita pakai nama dulu
        },
      }));
      setOrders(formatted);

      // Hitung Stats Sederhana
      const totalRevenue = formatted.reduce(
        (acc: number, curr: any) => acc + curr.total_amount,
        0
      );
      setStats({ revenue: totalRevenue, count: formatted.length });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Status Order
  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Gagal update status");
    } else {
      alert("Status berhasil diperbarui!");
      fetchOrders(); // Refresh data
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
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-zinc-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-zinc-500">
              Pantau penjualan dan kelola pesanan masuk.
            </p>
          </div>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Omzet</CardTitle>
              <DollarSign className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatRupiah(stats.revenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pesanan
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Perlu Dikirim
              </CardTitle>
              <Truck className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              {/* Hitung order status 'paid' */}
              <div className="text-2xl font-bold text-amber-600">
                {orders.filter((o) => o.status === "paid").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- ORDERS TABLE --- */}
        <Card>
          <CardHeader>
            <CardTitle>Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                Belum ada pesanan masuk.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">ID Order</th>
                      <th className="px-4 py-3 font-medium">Pelanggan</th>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {order.user.full_name}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          {formatRupiah(order.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Select
                            defaultValue={order.status}
                            onValueChange={(val) => updateStatus(order.id, val)}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs ml-auto">
                              <SelectValue placeholder="Ubah Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid (Lunas)</SelectItem>
                              <SelectItem value="shipped">
                                Shipped (Dikirim)
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed (Selesai)
                              </SelectItem>
                              <SelectItem value="failed">
                                Failed (Batal)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
