"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AbsenPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      setCameraError("Akses kamera ditolak atau kamera tidak ditemukan.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Capture frame dari video ke canvas
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(dataUrl);
        stopCamera(); // Matikan kamera setelah foto diambil
      }
    }
  };

  // Reset/Foto Ulang
  const resetPhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Kirim data ke database & lanjut ke Kasir
  const handleSubmit = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/absen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        // Redirection ke halaman kasir setelah simpan berhasil
        router.push("/kasir");
      } else {
        alert("Gagal menyimpan absensi. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting absen:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-zinc-200/80 shadow-md p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#212121]">Absensi Masuk Kasir</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ambil foto wajah langsung untuk verifikasi sebelum membuka mesin kasir.
          </p>
        </div>

        {/* Hidden Canvas untuk Snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewport Kamera / Hasil Foto */}
        <div className="relative w-full aspect-4/3 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-200">
          {cameraError ? (
            <p className="text-xs text-red-400 text-center px-4">{cameraError}</p>
          ) : capturedImage ? (
            /* Tampilan Preview Hasil Foto */
            <img src={capturedImage} alt="Absen Preview" className="w-full h-full object-cover" />
          ) : (
            /* Tampilan Video Live Feed */
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100" // Flip horizontal untuk efek cermin
            />
          )}
        </div>

        {/* Tombol Kontrol Absen */}
        <div className="space-y-2.5">
          {!capturedImage ? (
            <button
              type="button"
              onClick={takePhoto}
              disabled={!!cameraError}
              className="w-full py-3 bg-[#E52424] hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              Ambil Foto
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={resetPhoto}
                disabled={isLoading}
                className="py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                Foto Ulang
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Menyimpan..." : "Kirim & Lanjut"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}