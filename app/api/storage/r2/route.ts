import { NextResponse } from "next/server";
import { uploadFileToR2, isR2Configured } from "@/lib/r2Storage";

export async function GET() {
  const configured = isR2Configured();
  return NextResponse.json({
    configured,
    status: configured ? "ready" : "unconfigured",
    message: configured 
      ? "Cloudflare R2 Object Storage aktif dan siap digunakan."
      : "Cloudflare R2 belum dikonfigurasi melalui ENV. File tersimpan aman di Supabase DB."
  });
}

export async function POST(req: Request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: "Cloudflare R2 belum dikonfigurasi. File tetap disimpan secara aman di Supabase PostgreSQL & Local Storage."
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `proposals/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    
    const fileUrl = await uploadFileToR2(fileName, buffer, file.type || "application/octet-stream");

    return NextResponse.json({
      success: true,
      configured: true,
      url: fileUrl,
      fileName: file.name,
      message: "File berhasil disinkronkan ke Cloudflare R2!"
    });
  } catch (error: any) {
    console.warn("R2 Upload warning:", error?.message);
    return NextResponse.json({
      success: false,
      error: error.message || "Gagal mengunggah ke Cloudflare R2."
    }, { status: 500 });
  }
}
