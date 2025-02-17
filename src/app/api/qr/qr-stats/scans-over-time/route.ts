import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/app/auth";
import { query } from "~/lib/db";

export async function GET(request: NextRequest) {
    // Verify active session
    const session = await auth();
    if (!session || !session.user.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Fetch scan trends over time
        const scanData = await query(`
            SELECT 
                TO_CHAR(scanned_at, 'YYYY-MM-DD') AS scan_date, 
                COUNT(*) AS total_scans
            FROM qr_scans
            WHERE qr_uid IN (
                SELECT qr_uid
                FROM qr_codes
                WHERE created_by = $1
                AND canview = true
            )
            GROUP BY scan_date
            ORDER BY scan_date ASC
        `, [session.user.id]);

        return NextResponse.json(
            { scanTrends: scanData },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching scan trends: ", error);
        return NextResponse.json(
            { error: "Failed to fetch scan trends" },
            { status: 500 }
        );
    }
}
