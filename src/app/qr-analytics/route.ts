import { NextRequest, NextResponse } from "next/server";
import { query } from "~/lib/db";
import { auth } from "../auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  
  // Hardcode the domain
  const baseUrl = 'https://dubtrack.xyz';
  
  if (!session || !session.user?.id) {
    return NextResponse.redirect(new URL("/auth/sign-in", baseUrl));
  }

  try {
    const latestQr = await query(`
      SELECT qr_uid 
      FROM qr_codes 
      WHERE canview = true 
      AND created_by = $1
      ORDER BY created_at DESC 
      LIMIT 1
    `, [session.user.id]);
      console.log(latestQr)
    if (latestQr.length === 0) {
      return NextResponse.redirect(new URL("/qr-analytics/-1", baseUrl));
    }

    const latestQrId = latestQr[0].qr_uid;
    return NextResponse.redirect(new URL(`/qr-analytics/${latestQrId}`, baseUrl));
  } catch (error) {
    console.error("Error fetching latest QR:", error);
    return NextResponse.json({ error: "Failed to fetch latest QR" }, { status: 500 });
  }
}