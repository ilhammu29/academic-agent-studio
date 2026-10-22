import { NextResponse } from "next/server";
import { uploadFileToR2 } from "@/lib/r2Storage";

export async function POST(req: Request) {
  try {
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
      url: fileUrl,
      fileName: file.name,
      message: "File berhasil diunggah ke Cloudflare R2!"
    });
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengunggah ke R2." }, { status: 500 });
  }
}
