/**
 * Image Validation Utilities
 * Validates and compresses images before upload to prevent OOM and bandwidth issues
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { logger } from './logger';

/**
 * Image validation configuration
 */
export const IMAGE_CONFIG = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  COMPRESS_QUALITY: 0.8,
  ALLOWED_FORMATS: ['jpeg', 'jpg', 'png', 'webp'] as const,
} as const;

/**
 * Image validation result
 */
export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  compressedUri?: string;
  originalSize?: number;
  compressedSize?: number;
  width?: number;
  height?: number;
}

/**
 * Validate image file
 * @param uri - Image URI
 * @returns Validation result
 */
export async function validateImage(uri: string): Promise<ImageValidationResult> {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      return {
        isValid: false,
        error: 'File does not exist',
      };
    }

    // Check file size
    if (fileInfo.size && fileInfo.size > IMAGE_CONFIG.MAX_SIZE_BYTES) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${IMAGE_CONFIG.MAX_SIZE_BYTES / 1024 / 1024}MB`,
        originalSize: fileInfo.size,
      };
    }

    // Check file format (by extension)
    const extension = uri.split('.').pop()?.toLowerCase();
    if (!extension || !IMAGE_CONFIG.ALLOWED_FORMATS.includes(extension as any)) {
      return {
        isValid: false,
        error: `Unsupported format. Allowed: ${IMAGE_CONFIG.ALLOWED_FORMATS.join(', ')}`,
      };
    }

    return {
      isValid: true,
      originalSize: fileInfo.size,
    };
  } catch (error: any) {
    logger.error('Image validation error:', error);
    return {
      isValid: false,
      error: 'Failed to validate image',
    };
  }
}

/**
 * Compress and resize image if needed
 * @param uri - Image URI
 * @param maxWidth - Maximum width (default from config)
 * @param maxHeight - Maximum height (default from config)
 * @param quality - Compression quality 0-1 (default from config)
 * @returns Compressed image result
 */
export async function compressImage(
  uri: string,
  maxWidth: number = IMAGE_CONFIG.MAX_WIDTH,
  maxHeight: number = IMAGE_CONFIG.MAX_HEIGHT,
  quality: number = IMAGE_CONFIG.COMPRESS_QUALITY
): Promise<ImageValidationResult> {
  try {
    // Validate first
    const validation = await validateImage(uri);
    if (!validation.isValid) {
      return validation;
    }

    // Get image dimensions
    const imageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    let actions: ImageManipulator.Action[] = [];

    // Resize if exceeds max dimensions
    // Calculate aspect ratio to maintain proportions
    if (imageInfo.width > maxWidth || imageInfo.height > maxHeight) {
      const aspectRatio = imageInfo.width / imageInfo.height;

      let newWidth = imageInfo.width;
      let newHeight = imageInfo.height;

      if (imageInfo.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = maxWidth / aspectRatio;
      }

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
      }

      actions.push({
        resize: {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        },
      });
    }

    // Compress image
    const compressed = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    // Get compressed file size
    const compressedFileInfo = await FileSystem.getInfoAsync(compressed.uri);
    const compressedSize = compressedFileInfo.exists ? compressedFileInfo.size : 0;

    // Log compression stats
    logger.info('Image compressed', {
      original: `${imageInfo.width}x${imageInfo.height} (${validation.originalSize} bytes)`,
      compressed: `${compressed.width}x${compressed.height} (${compressedSize} bytes)`,
      reduction: `${Math.round(((validation.originalSize! - compressedSize!) / validation.originalSize!) * 100)}%`,
    });

    return {
      isValid: true,
      compressedUri: compressed.uri,
      originalSize: validation.originalSize,
      compressedSize,
      width: compressed.width,
      height: compressed.height,
    };
  } catch (error: any) {
    logger.error('Image compression error:', error);
    return {
      isValid: false,
      error: 'Failed to compress image',
    };
  }
}

/**
 * Validate and prepare image for upload
 * Combines validation and compression
 * @param uri - Image URI
 * @returns Prepared image result with URI ready for upload
 */
export async function prepareImageForUpload(uri: string): Promise<ImageValidationResult> {
  try {
    // First validate
    const validation = await validateImage(uri);
    if (!validation.isValid) {
      return validation;
    }

    // Then compress if file is large or dimensions exceed limits
    if (validation.originalSize && validation.originalSize > 1024 * 1024) {
      // Compress if > 1MB
      return await compressImage(uri);
    }

    // File is small enough, just return original
    return {
      isValid: true,
      compressedUri: uri,
      originalSize: validation.originalSize,
      compressedSize: validation.originalSize,
    };
  } catch (error: any) {
    logger.error('Image preparation error:', error);
    return {
      isValid: false,
      error: 'Failed to prepare image for upload',
    };
  }
}

/**
 * Batch validate multiple images
 * @param uris - Array of image URIs
 * @returns Array of validation results
 */
export async function validateImages(uris: string[]): Promise<ImageValidationResult[]> {
  const results = await Promise.all(uris.map((uri) => validateImage(uri)));
  return results;
}

/**
 * Get human-readable file size
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
