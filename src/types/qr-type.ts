import { DateTime } from "next-auth/providers/kakao"

export interface CreateQRCodeRequest {
    url: string
}

export type QR = {
    qr_uid: string,
    created_by: string,
    created_at: DateTime,
    embedded_link: string,
    short_url: string,
    filepath: string,
    short_code: string
}

export type QRResponse = {
    qrCodes : QR[]
}