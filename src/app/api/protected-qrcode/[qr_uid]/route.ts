import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { auth } from "~/app/auth";

export async function GET(req: NextRequest, { params }: { params: { qr_uid: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user.id) {
    return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
    );
    }
    const { qr_uid } = await params;
    if (!qr_uid) return NextResponse.json({ error: "QR UID is required" }, { status: 400 });

    // Construct file path based on QR UID (following /da/f4 structure)
    const filePath = path.join(process.cwd(), "private/qrcodes", qr_uid.substring(0, 2), qr_uid.substring(2, 4), `${qr_uid}.png`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Serve the image file securely
    const imageBuffer = fs.readFileSync(filePath);
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error("Error serving QR code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
