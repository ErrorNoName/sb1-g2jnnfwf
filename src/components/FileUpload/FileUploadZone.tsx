import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // en bytes
}

export default function FileUploadZone({ 
  onFileSelect, 
  accept = "image/*,video/*",
  maxSize = 10 * 1024 * 1024 // 10MB par défaut
}: FileUploadZoneProps) {
  const validateFile = (file: File): string | null => {
    if (!file) return "Aucun fichier sélectionné";
    if (file.size > maxSize) return "Le fichier est trop volumineux";
    if (!file.type.match(/^(image|video)\//)) return "Format de fichier non supporté";
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors"
    >
      <input
        type="file"
        id="proof"
        name="proof"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <label
        htmlFor="proof"
        className="flex flex-col items-center gap-2 cursor-pointer"
      >
        <Upload className="h-8 w-8 text-gray-400" />
        <div className="text-sm text-gray-400">
          <span className="text-indigo-500">Cliquez pour choisir</span> ou glissez une image/vidéo ici
        </div>
        <div className="text-xs text-gray-500">
          PNG, JPG, GIF ou MP4 (max {Math.round(maxSize / 1024 / 1024)}MB)
        </div>
      </label>
    </div>
  );
}