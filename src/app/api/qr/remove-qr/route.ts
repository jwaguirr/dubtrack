import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { auth } from "~/app/auth";
import { query } from "~/lib/db";
import fs from "fs/promises";


type RemoveQRRequest = {
    qr_uid: string
}

async function deleteFileAndCleanup(qr_uid: string) {
    try {
        const baseDir = path.join(process.cwd(), "private", "qrcodes");
        const filePath = path.join(baseDir, qr_uid.substring(0, 2), qr_uid.substring(2, 4), `${qr_uid}.png`);
        const subDir1 = path.dirname(filePath); // e.g., "public/qrcodes/01/12"
        const subDir2 = path.dirname(subDir1); // e.g., "public/qrcodes/01"

        // Delete the file
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);

        // Recursively remove empty directories
        await removeEmptyDirs([subDir1, subDir2]);
        return true
    } catch (error: any) {
        if (error.code === "ENOENT") {
            console.warn("File not found, skipping delete:", qr_uid);
        } else {
            console.error("Error deleting file:", error);
        }
        return false
    }
}

// Helper function to remove directories if they are empty
async function removeEmptyDirs(directories: string[]) {
    for (const dir of directories) {
        try {
            const files = await fs.readdir(dir);
            if (files.length === 0) {
                await fs.rmdir(dir);
                console.log(`Deleted empty directory: ${dir}`);
            } else {
                break; 
            }
        } catch (error: any) {
            if (error.code !== "ENOENT") {
                console.error(`Error removing directory ${dir}:`, error);
            }
        }
    }
}



export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
    }
    try {
        const body = (await request.json()) as RemoveQRRequest
        if (!body.qr_uid) {
            return NextResponse.json(
              { error: "UID is required!" },
              { status: 400 }
            )
        }
        const qr_uid = body.qr_uid
        query(`UPDATE qr_codes 
                SET canview = false 
                WHERE qr_uid = $1 
                AND created_by = $2`, 
        [qr_uid, session.user.id])
        // May need to handle some other deletions in other tables. Will do testing later when add functionality for analytics on scan

        const isSuccess = await deleteFileAndCleanup(qr_uid)
        if (isSuccess) {
            return NextResponse.json({
                error: "Successfully removed QR Code",
                status: 200
            })
        }
        else {
            return NextResponse.json({
                error: "Failed to remove QR Code",
                status: 500
            })
        }
    } catch (error) {
        console.error("Error removing qr: ", error)
        return NextResponse.json({
            error: "Failed to remove QR Code",
            status: 500
        })
    }

}