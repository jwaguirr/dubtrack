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
        const qr_uid = searchParams.get("qr_uid");

        if (!qr_uid) {
            return NextResponse.json({ error: "QR UID is required" }, { status: 400 });
        }

        const osData = await query(`
            SELECT 
                COALESCE(qs.os, 'Unknown') AS os, 
                COUNT(*) * 100.0 / (
                    SELECT COUNT(*) 
                    FROM qr_scans qs2
                    JOIN qr_codes qc2 ON qs2.qr_uid = qc2.qr_uid
                    WHERE qs2.qr_uid = $1 
                    AND qc2.created_by = $2
                ) AS percentage
            FROM qr_scans qs
            JOIN qr_codes qc ON qs.qr_uid = qc.qr_uid
            WHERE qs.qr_uid = $1 
            AND qc.created_by = $2
            GROUP BY qs.os
            ORDER BY percentage DESC
        `, [qr_uid, session.user.id]);

        return NextResponse.json({ osBreakdown: osData }, { status: 200 });

    } catch (error) {
        console.error("Error fetching OS breakdown:", error);
        return NextResponse.json({ error: "Failed to fetch OS breakdown" }, { status: 500 });
    }
}
