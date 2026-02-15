import CameraCapture from "@/components/CameraCapture";
import PhotoUpload from "@/components/PhotoUpload";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Scan a Menu
        </h1>
        <p className="text-gray-500">
          Point your camera at a restaurant menu or upload a photo
        </p>
      </div>

      <CameraCapture />

      <div className="flex items-center gap-4 w-full">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-sm text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <PhotoUpload />
    </div>
  );
}
