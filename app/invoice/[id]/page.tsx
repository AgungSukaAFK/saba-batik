"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type OrderItem = {
  id: string;
  price_at_purchase: number;
  qty: number;
  bottom_hex_code: string | null;
  material: { name: string } | null;
  motif: { name: string } | null;
};

type OrderDetail = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
  snap_token: string | null;
  order_items: OrderItem[];
  profiles: {
    full_name: string;
    email: string;
    address: string;
    phone_number: string;
  } | null;
};

export default function InvoicePage() {
  const { id } = useParams();
  const supabase = createClient();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            material:materials(name),
            motif:motifs(name)
          ),
          profiles (full_name, address, phone_number)
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Invoice tidak ditemukan");
        router.push("/dashboard");
        return;
      }

      if (data.user_id !== user.id) {
        alert("Anda tidak memiliki akses ke invoice ini.");
        router.push("/dashboard");
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchInvoice();
  }, [id, router, supabase]);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const getItemType = (hex: string | null) =>
    hex?.includes("Atasan")
      ? "Atasan"
      : hex?.includes("Bawahan")
      ? "Bawahan"
      : "Item";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  if (!order) return null;

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8 font-sans text-zinc-900 print:bg-white print:p-0">
      {/* HEADER ACTIONS (Hidden saat Print) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Link>
        </Button>
        <Button
          onClick={() => window.print()}
          className="bg-zinc-900 text-white hover:bg-black"
        >
          <Printer className="w-4 h-4 mr-2" /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* INVOICE PAPER */}
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-xl print:shadow-none rounded-xl print:rounded-none">
        {/* HEADER INVOICE */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">
              INVOICE
            </h1>
            <p className="text-sm text-zinc-500 font-mono">
              #{order.id.toUpperCase()}
            </p>
            <div className="mt-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  order.status === "paid"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                }`}
              >
                {order.status === "paid"
                  ? "LUNAS (PAID)"
                  : order.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold font-serif text-amber-600">
              Saba Batik
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Jl. Batik Nusantara No. 69
            </p>
            <p className="text-sm text-zinc-500">Cipocok, Indonesia</p>
            <p className="text-sm text-zinc-500">info@sababatik.com</p>
          </div>
        </div>

        {/* INFO PENGIRIMAN */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">
              Ditagihkan Kepada
            </h3>
            <p className="font-bold text-lg">
              {order.profiles?.full_name || "Pelanggan"}
            </p>
            <p className="text-sm text-zinc-600 mt-1 whitespace-pre-wrap">
              {order.profiles?.address || "Alamat tidak tersedia"}
            </p>
            <p className="text-sm text-zinc-600 mt-1">
              {order.profiles?.phone_number}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">
              Detail Pesanan
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-sm text-zinc-500">Tanggal Order:</span>
                <span className="text-sm font-medium">
                  {formatDate(order.created_at)}
                </span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4">
                <span className="text-sm text-zinc-500">Metode Bayar:</span>
                <span className="text-sm font-medium">Midtrans Gateway</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL ITEM */}
        <div className="mb-10">
          <table className="w-full text-left">
            <thead className="border-b-2 border-zinc-100">
              <tr>
                <th className="py-3 text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  Deskripsi Item
                </th>
                <th className="py-3 text-xs font-bold uppercase text-zinc-400 tracking-wider text-right">
                  Harga Satuan
                </th>
                <th className="py-3 text-xs font-bold uppercase text-zinc-400 tracking-wider text-right">
                  Qty
                </th>
                <th className="py-3 text-xs font-bold uppercase text-zinc-400 tracking-wider text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="font-bold text-sm text-zinc-800">
                      {getItemType(item.bottom_hex_code)} -{" "}
                      {item.material?.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Motif: {item.motif?.name || "Tanpa Motif"}
                    </p>
                  </td>
                  <td className="py-4 text-right text-sm text-zinc-600 font-mono">
                    {formatRupiah(item.price_at_purchase)}
                  </td>
                  <td className="py-4 text-right text-sm text-zinc-600 font-mono">
                    {item.qty}
                  </td>
                  <td className="py-4 text-right text-sm font-bold text-zinc-800 font-mono">
                    {formatRupiah(item.price_at_purchase * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="border-t-2 border-zinc-100 pt-6 flex justify-end">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-mono">
                {formatRupiah(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Pajak (PPN)</span>
              <span className="font-mono">Rp 0</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-zinc-900 border-t border-zinc-100 pt-3">
              <span>Total Tagihan</span>
              <span className="font-mono text-amber-600">
                {formatRupiah(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 pt-8 border-t border-dashed border-zinc-200 text-center text-xs text-zinc-400">
          <p>Terima kasih telah berbelanja di Saba Batik.</p>
          <p>Dokumen ini adalah bukti transaksi yang sah.</p>
        </div>
      </div>
    </div>
  );
}
