import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, timestamp } = body;

    if (!image) {
      return NextResponse.json({ error: "Foto wajib diambil" }, { status: 400 });
    }

    // TODO: Ambil ID Kasir / User dari Session/Auth Token
    // Contoh dummy insert ke DB:
    // await db.attendance.create({
    //   data: {
    //     userId: session.user.id,
    //     photoBase64: image,
    //     createdAt: new Date(timestamp),
    //   }
    // });

    return NextResponse.json({ success: true, message: "Absensi berhasil dicatat" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses absensi" }, { status: 500 });
  }
}