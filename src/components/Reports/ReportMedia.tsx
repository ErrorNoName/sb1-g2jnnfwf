import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

interface ReportMediaProps {
  url: string;
  className?: string;
}

export default function ReportMedia({ url, className = '' }: ReportMediaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getSignedUrl() {
      try {
        // Extraire le chemin du fichier de l'URL
        const filePath = url.split('/').slice(-2).join('/');
        
        const { data, error: signedUrlError } = await supabase.storage
          .from('reports')
          .createSignedUrl(filePath, 3600); // URL valide pendant 1 heure

        if (signedUrlError) throw signedUrlError;
        
        setSignedUrl(data.signedUrl);
        setError(null);
      } catch (err) {
        logger.error('Erreur lors de la récupération de l\'URL signée:', err);
        setError('Impossible de charger le média');
        setIsLoading(false);
      }
    }

    getSignedUrl();
  }, [url]);

  const handleError = () => {
    setError('Impossible de charger le média');
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isVideo = /\.(mp4)$/i.test(url);

  return (
    <div className={`aspect-video rounded-lg overflow-hidden bg-gray-900 relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
          <ImageOff size={24} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {signedUrl && !error && (
        <>
          {isImage && (
            <img 
              src={signedUrl}
              alt="Preuve du rapport"
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onError={handleError}
              onLoad={handleLoad}
            />
          )}
          
          {isVideo && (
            <video 
              src={signedUrl}
              controls 
              className={`w-full h-full transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onError={handleError}
              onLoadedData={handleLoad}
            />
          )}
        </>
      )}
    </div>
  );
}