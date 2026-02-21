"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildMenuFromScanResult, saveMenu } from "@/lib/storage";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("Camera access denied. Please allow camera access or upload a photo instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  const capture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    stopCamera();

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.85)
    );

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", blob, "menu.jpg");
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Scan failed");
      }
      const scanResult = await res.json();
      const menu = buildMenuFromScanResult(scanResult);
      saveMenu(menu);
      router.push(`/results/${menu.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }, [stopCamera, router]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-12">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Scanning menu...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {!streaming ? (
        <button
          onClick={startCamera}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-colors"
        >
          Open Camera
        </button>
      ) : (
        <div className="relative w-full rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={capture}
              className="bg-white rounded-full w-16 h-16 border-4 border-orange-500 shadow-lg active:scale-95 transition-transform"
              aria-label="Take photo"
            />
            <button
              onClick={stopCamera}
              className="bg-gray-800 text-white rounded-full px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
