import { logger } from './logger';

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const SUPPORTED_VIDEO_TYPES = ['video/mp4'] as const;

export type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number];
export type SupportedVideoType = typeof SUPPORTED_VIDEO_TYPES[number];

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && !!contentType && SUPPORTED_IMAGE_TYPES.includes(contentType as SupportedImageType);
  } catch (error) {
    logger.error('Image validation failed:', { url, error });
    return false;
  }
}