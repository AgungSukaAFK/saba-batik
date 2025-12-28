import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    const supabase = await createClient();

    // 1. Cek User
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Update Status jadi 'failed'
    const { error } = await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId)
      .eq("user_id", user.id); // Pastikan milik user sendiri

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      message: "Pesanan dibatalkan",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
