// src/pages/Technician/TechnicianPhotos.tsx
import React from "react";

interface TechnicianPhotosProps {
  photos: string[];
  onChangePhotos: (next: string[]) => void;
}

export const TechnicianPhotos: React.FC<TechnicianPhotosProps> = ({
  photos,
  onChangePhotos,
}) => {
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
    <div className="tech-panel tech-panel--photos">
      <h3>Photos</h3>
      <input type="file" accept="image/*" onChange={handleAddPhoto} />
      <div className="tech-photos-grid">
        {photos.map((p, i) => (
          <div key={i} className="tech-photo">
            <img src={p} alt={`Job photo ${i + 1}`} />
            <button onClick={() => handleRemove(i)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};
