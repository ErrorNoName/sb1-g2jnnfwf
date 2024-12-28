import React from 'react';
import { X } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const url = URL.createObjectURL(file);

  return (
    <div className="relative">
      {isImage && (
        <img
          src={url}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      )}
      {isVideo && (
        <video
          src={url}
          className="w-full h-48 object-cover rounded-lg"
          controls
          onLoadedData={() => URL.revokeObjectURL(url)}
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}