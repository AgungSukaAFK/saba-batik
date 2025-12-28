import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(request: Request) {
  try {
    const { id, total, user } = await request.json();
    const supabase = await createClient();

    const parameter = {
      transaction_details: {
        order_id: id,
        gross_amount: total,
      },
      customer_details: {
        first_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
      callbacks: {
        finish: `${request.headers.get("origin")}/dashboard`,
      },
    };

    const token = await snap.createTransaction(parameter);

    const { error } = await supabase
      .from("orders")
      .update({ snap_token: token.token })
      .eq("id", id);

    if (error) {
      console.error("Gagal simpan token:", error);
    }

    return NextResponse.json({ token: token.token });
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
