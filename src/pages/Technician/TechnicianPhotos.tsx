// src/pages/Technician/TechnicianPhotos.tsx
import React, { useRef } from "react";
import { Camera, Trash2, ImagePlus } from "lucide-react";

interface TechnicianPhotosProps {
  photos: string[];
  onChangePhotos: (next: string[]) => void;
}

export const TechnicianPhotos: React.FC<TechnicianPhotosProps> = ({
  photos,
  onChangePhotos,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onChangePhotos([...photos, base64]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (idx: number) => {
    const next = photos.filter((_, i) => i !== idx);
    onChangePhotos(next);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg font-semibold tracking-wide">Job Evidence & Photos</h3>
        </div>
        <span className="text-xs font-medium bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">
          {photos.length} Captured
        </span>
      </div>

      {/* Upload/Camera Zone */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-700 hover:border-sky-500 hover:bg-slate-950/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition"
        >
          <ImagePlus className="w-8 h-8 text-slate-500" />
          <span className="text-sm font-medium text-slate-300">Add Photo or Take Snap</span>
          <span className="text-xs text-slate-500">Supports device camera natively</span>
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment" /* Seamless back-camera triggering on mobile/tablet */
          ref={fileInputRef}
          onChange={handleAddPhoto}
          className="hidden"
        />
      </div>

      {/* Grid Layout */}
      {photos.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500 italic bg-slate-950/30 rounded-lg border border-slate-850">
          No photos attached to this job record yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((p, i) => (
            <div key={i} className="group relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden aspect-square flex flex-col">
              <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center">
                <img 
                  src={p} 
                  alt={`Job snapshot ${i + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-2 bg-slate-950 border-t border-slate-900 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">IMG_{i + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="text-slate-400 hover:text-rose-400 transition p-1"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};