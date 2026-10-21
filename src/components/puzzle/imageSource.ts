import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform } from 'react-native';

/** A decoded image the game can lay a map over. Never stored: it lives only in the session. */
export interface SourceImage {
  uri: string;
  width: number;
  height: number;
}

/** What the map is drawn over: a real image, or (the tutorials) nothing but a size. */
export interface MapSurface {
  width: number;
  height: number;
  uri?: string;
}

/** Why an image could not be used; the screen turns each into a translated sentence. */
export type ImageLoadFailure = 'decode' | 'notImage';

export class ImageLoadError extends Error {
  constructor(readonly reason: ImageLoadFailure) {
    super(reason);
    this.name = 'ImageLoadError';
  }
}

/**
 * Reads the pixel size of any image the platform can decode. react-native's
 * `Image.getSize` goes through the browser's own decoder on web (so anything the
 * browser opens works: PNG, JPG, WebP, GIF, AVIF, SVG...) and through the native
 * one on phones.
 */
export function measureImage(uri: string): Promise<SourceImage> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        if (width > 0 && height > 0) resolve({ uri, width, height });
        else reject(new ImageLoadError('decode'));
      },
      () => reject(new ImageLoadError('decode'))
    );
  });
}

/** Releases a web object URL once the image is replaced; a no-op for anything else. */
export function releaseImage(image: SourceImage | null): void {
  if (Platform.OS === 'web' && image !== null && image.uri.startsWith('blob:')) {
    URL.revokeObjectURL(image.uri);
  }
}

/** web only: an image File (picked, dropped or pasted) becomes a measured image. */
export async function imageFromFile(file: File): Promise<SourceImage> {
  // Some browsers report an empty type for files they can still decode (SVG from disk, HEIC on Safari):
  // only a type that is present and not image/* is rejected up front, the rest is left to the decoder.
  if (file.type !== '' && !file.type.startsWith('image/')) throw new ImageLoadError('notImage');
  const uri = URL.createObjectURL(file);
  try {
    return await measureImage(uri);
  } catch (error) {
    URL.revokeObjectURL(uri);
    throw error;
  }
}

/** Opens the system file chooser (a file input on web). null when the player cancels. */
export async function pickImageFile(): Promise<SourceImage | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true, multiple: false });
  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  if (Platform.OS === 'web' && asset.file) return imageFromFile(asset.file);
  if (asset.mimeType && !asset.mimeType.startsWith('image/')) throw new ImageLoadError('notImage');
  return measureImage(asset.uri);
}

/** The photo gallery on a phone. The system picker needs no permission to read a chosen photo. null on cancel. */
export async function pickImageFromGallery(): Promise<SourceImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  if (asset.width > 0 && asset.height > 0) return { uri: asset.uri, width: asset.width, height: asset.height };
  return measureImage(asset.uri);
}
