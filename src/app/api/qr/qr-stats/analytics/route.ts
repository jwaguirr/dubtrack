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
        // Fetch operating system breakdown
        const osData = await query(`
            SELECT os, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM qr_scans) AS percentage
            FROM qr_scans
            WHERE qr_uid IN (
                SELECT qr_uid
                FROM qr_codes
                WHERE created_by = $1
                AND canview = true
            )
            GROUP BY os
            ORDER BY percentage DESC
        `, [session.user.id]);

        // Fetch top locations (Cities)
        const locationData = await query(`
            SELECT city, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM qr_scans) AS percentage
            FROM qr_scans
            WHERE qr_uid IN (
                SELECT qr_uid
                FROM qr_codes
                WHERE created_by = $1
                AND canview = true
            )
            GROUP BY city
            ORDER BY percentage DESC
            LIMIT 6
        `, [session.user.id]);

        return NextResponse.json(
            { osBreakdown: osData, topCities: locationData },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching analytics: ", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
