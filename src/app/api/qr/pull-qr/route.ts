import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/app/auth";
import { query } from "~/lib/db";
import { QR } from "~/types/qr-type";

export async function GET() {
    // Making sure the session is still active
    const session = await auth();
    console.log(session, process.env.NEXTAUTH_URL)
    if (!session || !session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      try {
          const uid = session.user.id
          const qrs = await query("SELECT * FROM qr_codes WHERE created_by = $1 AND canview = TRUE ORDER BY created_at DESC", [uid])
          return NextResponse.json(
              { qrCodes: qrs as QR[] },
              { status: 200 }
          )
      } catch (error) {
        console.error("Error fetching qrs: ", error)
        return NextResponse.json({
            error: "Failed to fetch QR Codes",
            status: 500
        })
      }

}