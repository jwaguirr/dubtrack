import { NextResponse, NextRequest } from 'next/server';
import { auth } from '~/app/auth';
import { query } from '~/lib/db';
import { cookies } from 'next/headers';


type FindQR = {
    qr_uid: string,
    embedded_link: string
}

type NewUserReturn = {
    create_new_user: string
}


function extractOS(userAgent : string) {
    if (!userAgent) return 'Unknown';
    
    const patterns = {
      'Windows': /Windows/i,
      'iOS': /(iPhone|iPad|iPod)/i,
      'macOS': /Mac OS X/i,
      'Android': /Android/i,
      'Linux': /Linux/i,
      'Unix': /Unix/i
    };
  
    for (const [os, pattern] of Object.entries(patterns)) {
      if (pattern.test(userAgent)) {
        return os;
      }
    }
  
    return 'Unknown';
  }

export async function GET(request: NextRequest, { params }: { params: { shortcode: string } }) {
    // Use ip-api

    try {
        const { shortcode } = await params;

        const shortCode = shortcode[0]

        if (shortcode.length !== 1) {
            return NextResponse.json({ error: "Duplicate or non-existent shortcode" }, { status: 400 });
        }
        if (!shortcode) {
            return NextResponse.json({ error: "Short code missing" }, { status: 400 });
        }



        const found_qr: FindQR[] = await query(
            "SELECT qr_uid, embedded_link FROM qr_codes WHERE short_code = $1",
            [shortCode]
        );

        if (!found_qr || found_qr.length === 0) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }
        const qr_uid = found_qr[0]?.qr_uid
        const embedded_link = found_qr[0]?.embedded_link
        // We want to check and see if the user has a cookie stored, if not, he is justified as a new user
        const cookie_name = "ANON_ID"
        const cookieStore = await cookies(); // Add await here
        const existingCookie = cookieStore.get(cookie_name);
        let user_anon_id = null
        if (!existingCookie) {
            const anon_id: NewUserReturn[] = await query("SELECT create_new_user($1);", [qr_uid])
            const new_anon_id = anon_id[0]?.create_new_user
            
            if (new_anon_id) { 
                cookieStore.set(cookie_name, new_anon_id.toString(), {
                    maxAge: 100 * 365 * 24 * 60 * 60,
                    httpOnly: true,
                    sameSite: 'strict'
                })
                user_anon_id = new_anon_id
            } else {
                console.error("Failed to generate new anonymous ID")
            }
        }
        else {
            // The cookie already exists
            user_anon_id = existingCookie.value
        }
        
        try {
            const anon_id = user_anon_id || "00000000-0000-0000-0000-000000000000"; // Safe default UUID
            const ip_address = request.headers.get("x-forwarded-for") ?? "0.0.0.0"; // Default IP
            const user_agent = request.headers.get("user-agent") ?? "Unknown";
            const referrer = request.headers.get("referer") ?? "None";
            const os = extractOS(user_agent)
            // Now we are going to query the ip lookup api and post these:
            const api_res = await fetch(`http://ip-api.com/json/${ip_address}`, {
                method: "GET"
            })
            let city = null
            let state = null
            let lat = null
            let lon = null
            const json = await api_res.json();
            if (json.status === "success") {
                city = json.city
                state = json.regionName
                lat = json.lat
                lon = json.lon
            }
            const result = await query(
                "SELECT scan_qr_code($1::UUID, $2::UUID, $3::INET, $4::TEXT, $5::TEXT, $6::TEXT, $7::TEXT, $8::DECIMAL, $9::DECIMAL, $10::TEXT)", 
                [anon_id, qr_uid, ip_address, user_agent, referrer, city, state, lat, lon, os]
            );
            if (embedded_link) {
                return NextResponse.redirect(embedded_link);
            }
            else {
                return new Response(JSON.stringify({ message: "Must input link!", result }), { status: 500 });
            }
        } catch (error) {
            console.error("Error scanning QR code:")
            throw error; 
        }        

    } catch (error) {
        console.error("Error fetching qrs: ", error);
        return NextResponse.json({
            error: "Failed to redirect you, sorry buddy",
            status: 500
        });
    }
}