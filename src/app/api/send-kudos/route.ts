import { NextRequest, NextResponse } from "next/server";
import { query } from "~/lib/db";

export async function POST(request: NextRequest) {
    try {
        const x = await query(`UPDATE admin_info SET kudos = kudos + 1`)
        return NextResponse.json(
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
