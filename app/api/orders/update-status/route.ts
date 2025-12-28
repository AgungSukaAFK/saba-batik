import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

// Inisialisasi Midtrans Core API
const apiClient = new Midtrans.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    const supabase = await createClient();

    // 1. Cek Status Transaksi ke Midtrans
    // FIX: Gunakan (apiClient as any) untuk bypass validasi TypeScript
    const transactionStatus = await (apiClient as any).transaction.status(
      orderId
    );

    // Mapping status Midtrans ke status Database kita
    let newStatus = "pending";
    const fraudStatus = transactionStatus.fraud_status;
    const midtransStatus = transactionStatus.transaction_status;

    if (midtransStatus == "capture") {
      if (fraudStatus == "challenge") {
        newStatus = "pending"; // Challenge = perlu review manual
      } else if (fraudStatus == "accept") {
        newStatus = "paid";
      }
    } else if (midtransStatus == "settlement") {
      newStatus = "paid";
    } else if (
      midtransStatus == "cancel" ||
      midtransStatus == "deny" ||
      midtransStatus == "expire"
    ) {
      newStatus = "failed";
    } else if (midtransStatus == "pending") {
      newStatus = "pending";
    }

    // 2. Update Database (Menggunakan Service Role/Server Client yang bypass RLS User)
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      newStatus,
      message: "Status berhasil diperbarui dari Midtrans",
    });
  } catch (error: any) {
    console.error("Update Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
