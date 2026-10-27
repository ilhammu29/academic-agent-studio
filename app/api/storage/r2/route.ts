import { NextResponse } from "next/server";

// Uploads remain disabled until authenticated, user-scoped storage is configured.
export async function GET() {
  return NextResponse.json({ configured: false, status: "disabled", message: "Penyimpanan cloud belum tersedia." });
}

export async function POST() {
  return NextResponse.json({ success: false, error: "Unggah cloud belum tersedia. Simpan atau ekspor dokumen di perangkat Anda." }, { status: 503 });
}
