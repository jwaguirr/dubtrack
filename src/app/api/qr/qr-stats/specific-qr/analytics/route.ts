import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/app/auth";
import { query } from "~/lib/db";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        let qr_uid = searchParams.get("qr_uid");

        // If no qr_uid is provided, get the most recent one
        if (!qr_uid) {
            const latestQr = await query(`
                SELECT qr_uid 
                FROM qr_codes 
                WHERE created_by = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `, [session.user.id]);

            if (latestQr.length === 0) {
                return NextResponse.json({ error: "No QR codes found" }, { status: 404 });
            }

            qr_uid = latestQr[0].qr_uid;
        }

        // Fetch overall analytics for the specific QR code
        const analyticsData = await query(`
            SELECT 
                COUNT(*) AS total_scans,
                COUNT(DISTINCT ip_address) AS unique_scans,
                MIN(scanned_at) AS active_since,
                qc.created_at
            FROM qr_scans qs
            JOIN qr_codes qc ON qs.qr_uid = qc.qr_uid 
            WHERE qs.qr_uid = $1 
            AND qc.created_by = $2
            GROUP BY qc.created_at
        `, [qr_uid, session.user.id]);

        return NextResponse.json({ analytics: analyticsData[0], qr_uid }, { status: 200 });

    } catch (error) {
        console.error("Error fetching QR analytics:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
