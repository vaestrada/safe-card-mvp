import { NextRequest } from "next/server";
import QRCode from "qrcode";

/**
 * QR endpoint: /api/qr/<advocate-code>
 * Returns the referral QR as an SVG pointing at /r/<code>.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const base = new URL(request.url).origin;
  const target = `${base}/r/${encodeURIComponent(code)}?source=qr`;

  const svg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#1c1a17", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
