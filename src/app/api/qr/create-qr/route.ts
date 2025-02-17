import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/app/auth";
import { CreateQRCodeRequest } from "~/types/qr-type";
import { query } from "~/lib/db";
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';

interface PostQRResponse {
  short_code: string;
  qr_uid: string;
}

// API route to generate QR code and store in private/qrcodes/
export async function POST(request: NextRequest) { 
  // Ensure user is signed in
  const session = await auth();
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const uid = session.user.id;

  try {
    const body = (await request.json()) as CreateQRCodeRequest;
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Create QR in DB and get its UID
    const qr_id: PostQRResponse[] = await query(
      "WITH qr AS (SELECT create_qr_code($1, $2, $3) as result) SELECT (result).short_code, (result).qr_uid FROM qr",
      [uid, body.url, `${process.env.NEXTAUTH_URL}/findqr/`]
    );

    if (!qr_id[0]?.qr_uid || qr_id.length !== 1 || !qr_id[0]?.short_code) {
      return NextResponse.json({ error: "Error creating QR code" }, { status: 500 });
    }

    const qr_short_code = qr_id[0]?.short_code;
    const qr_uid = qr_id[0]?.qr_uid;
    const embedded_url = `${process.env.NEXTAUTH_URL}/findqr/${qr_short_code}`;

    // **🔒 Secure QR Code Storage Path**
    const filepath = path.join(
      process.cwd(), "private", "qrcodes",
      qr_uid.substring(0, 2), qr_uid.substring(2, 4),
      `${qr_uid}.png`
    );

    // **Ensure directories exist**
    const dirPath = path.dirname(filepath);
    await fs.mkdir(dirPath, { recursive: true });

    // **Generate QR Code and save to private folder**
    await QRCode.toFile(filepath, embedded_url, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" }
    });

    // **Generate Data URL for immediate preview**
    const qrCodeDataURL = await QRCode.toDataURL(embedded_url, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" }
    });

    return NextResponse.json({
      success: true,
      qr_code: qrCodeDataURL,
      short_uid: qr_short_code
    }, { status: 200 });

  } catch (error) {
    console.error("Failed to create QR code:", error);
    return NextResponse.json({ error: "Failed to create QR" }, { status: 500 });
  }
}
