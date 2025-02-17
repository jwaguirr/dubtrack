import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/app/auth";
import { query } from "~/lib/db";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    try {
    const { qr_uid } = await req.json();

    if (!qr_uid) {
      return NextResponse.json({ error: "QR UID is required" }, { status: 400 });
    }

    const result = await query(
      `SELECT 
          created_at, 
          embedded_link, 
          short_url, 
          short_code, 
          filepath 
      FROM qr_codes 
      WHERE qr_uid = $1 
      AND created_by = $2`,
      [qr_uid, session.user.id]
  );

    if (result.length === 0) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    return NextResponse.json({ qrDetails: result[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching QR details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
