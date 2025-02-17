import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/app/auth";
import { query } from "~/lib/db";
import { corsHeaders } from "~/app/middleware";


export async function GET(request: NextRequest) {
    // Verify active session
    const session = await auth();
    if (!session || !session.user.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Get QR UID from URL params
    const searchParams = request.nextUrl.searchParams;
    const qrUid = searchParams.get('qr_uid');

    if (!qrUid) {
        return NextResponse.json(
            { error: 'QR UID is required' },
            { status: 400 }
        );
    }

    try {
        // First verify the user owns this QR code
        const ownershipCheck = await query(
            "SELECT created_by FROM qr_codes WHERE qr_uid = $1 AND created_by = $2",
            [qrUid, session.user.id]
        );

        if (ownershipCheck.length === 0) {
            return NextResponse.json(
                { error: 'Not authorized to view this QR code stats' },
                { status: 403 }
            );
        }

        // Get stats from aggregates table
        const stats = await query(
            "SELECT total_scans, last_scanned_at, total_unique_scans FROM qr_scan_aggregates WHERE qr_uid = $1",
            [qrUid]
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
