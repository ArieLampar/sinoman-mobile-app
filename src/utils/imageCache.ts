import { Image, ImageContentFit, ImageCachePolicy, ImagePriority } from 'expo-image';

/**
 * Image preset configurations for consistent caching behavior
 */
export const ImagePresets = {
  /**
   * High priority images (hero images, product featured images)
   */
  highPriority: {
    cachePolicy: 'memory-disk' as ImageCachePolicy,
    priority: 'high' as ImagePriority,
    transition: 200,
  },

  /**
   * Profile images (avatars, user photos)
   */
  profile: {
    cachePolicy: 'memory-disk' as ImageCachePolicy,
    priority: 'normal' as ImagePriority,
    transition: 150,
  },

  /**
   * Thumbnail images (grid views, list items)
   */
  thumbnail: {
    cachePolicy: 'memory-disk' as ImageCachePolicy,
    priority: 'normal' as ImagePriority,
    transition: 100,
  },

  /**
   * Background images (banners, promotional content)
   */
  background: {
    cachePolicy: 'memory-disk' as ImageCachePolicy,
    priority: 'low' as ImagePriority,
    transition: 300,
  },
};

/**
 * Blurhash presets for placeholder images
 * Generated using https://blurha.sh/
 */
export const BlurhashPresets = {
  product: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  profile: 'L6PZfSjF.AyE_3t7t7R**0o#DgR4',
  banner: 'L5H2EC=PM+yV0g-mq.wG9c010J}I',
  default: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
};

/**
 * Clears both memory and disk cache for all images
 * Useful for settings/cache management
 */
export async function clearImageCache(): Promise<void> {
  try {
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
  } catch (error) {
    console.error('Failed to clear image cache:', error);
    throw error;
  }
}

/**
 * Preloads images into cache for faster rendering
 * @param imageUris Array of image URIs to preload
 */
export async function preloadImages(imageUris: string[]): Promise<void> {
  try {
    const promises = imageUris.map(uri =>
      Image.prefetch(uri, { cachePolicy: 'memory-disk' })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to preload images:', error);
  }
}

/**
 * Gets the recommended content fit based on image aspect ratio
 * @param aspectRatio Image width/height ratio
 */
export function getContentFit(aspectRatio: number): ImageContentFit {
  if (aspectRatio > 1.5) return 'cover';
  if (aspectRatio < 0.75) return 'contain';
  return 'cover';
}
