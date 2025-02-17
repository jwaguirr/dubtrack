import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/app/auth";
import { query } from "~/lib/db";

export async function GET(request: NextRequest) {
    // Verify active session
    const session = await auth();
    if (!session || !session.user.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        // Get total scans and unique scans for all QR codes owned by user
        const stats = await query(`
            SELECT 
                COUNT(*) AS total_scans,
                COUNT(DISTINCT qs.ip_address) AS total_unique_scans
            FROM qr_scans qs
            WHERE qs.qr_uid IN (
                SELECT qr_uid
                FROM qr_codes
                WHERE created_by = $1
                AND canview = true
            )`,
            [session.user.id]
        );

        return NextResponse.json(
            { stats: stats[0] },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching QR stats: ", error);
        return NextResponse.json(
            { error: "Failed to fetch QR stats" },
            { status: 500 }
        );
    }
}
