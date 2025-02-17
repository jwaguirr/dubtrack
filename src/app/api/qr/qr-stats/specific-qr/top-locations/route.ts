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

        const locationData = await query(`
            SELECT 
                qs.city, 
                qs.lat, 
                qs.lon,
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
            GROUP BY qs.city, qs.lat, qs.lon
            ORDER BY percentage DESC
            LIMIT 10
        `, [qr_uid, session.user.id]);
                
        return NextResponse.json({ topCities: locationData }, { status: 200 });

    } catch (error) {
        console.error("Error fetching top locations:", error);
        return NextResponse.json({ error: "Failed to fetch top locations" }, { status: 500 });
    }
}
