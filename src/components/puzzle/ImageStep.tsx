import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { Intro } from '../plan/parts';
import { CameraCapture } from './CameraCapture';
import {
  ImageLoadError,
  imageFromFile,
  pickImageFile,
  pickImageFromGallery,
  releaseImage,
} from './imageSource';
import type { SourceImage } from './imageSource';

interface ImageStepProps {
  image: SourceImage | null;
  onImage: (image: SourceImage) => void;
}

const IS_WEB = Platform.OS === 'web';

/** The first screen: bring a map in from a file, the gallery, the clipboard, a drop, or the camera. */
export function ImageStep({ image, onImage }: ImageStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<'decode' | 'notImage' | null>(null);
  const [dragging, setDragging] = useState(false);

  // The newest image replaces the previous one; the old web object URL is released at that point.
  const current = useRef(image);
  current.current = image;

  const accept = useCallback(
    (next: SourceImage) => {
      if (current.current !== null && current.current.uri !== next.uri) releaseImage(current.current);
      setFailure(null);
      onImage(next);
    },
    [onImage]
  );

  const run = useCallback(
    async (load: () => Promise<SourceImage | null>) => {
      setBusy(true);
      setFailure(null);
      try {
        const next = await load();
        if (next !== null) accept(next);
      } catch (error) {
        setFailure(error instanceof ImageLoadError ? error.reason : 'decode');
      } finally {
        setBusy(false);
      }
    },
    [accept]
  );

  // Web only: drag a file over the page, or paste a screenshot with Ctrl+V.
  useEffect(() => {
    if (!IS_WEB) return undefined;
    const imageFileOf = (data: DataTransfer | null): File | undefined => {
      if (!data) return undefined;
      const files = Array.from(data.files);
      return files.find((file) => file.type.startsWith('image/')) ?? files[0];
    };
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    };
    const onDragLeave = () => setDragging(false);
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      const file = imageFileOf(event.dataTransfer);
      if (file) void run(() => imageFromFile(file));
    };
    const onPaste = (event: ClipboardEvent) => {
      const file = imageFileOf(event.clipboardData);
      if (file) {
        event.preventDefault();
        void run(() => imageFromFile(file));
      }
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('paste', onPaste);
    };
  }, [run]);

  if (camera) {
    return (
      <View>
        <Intro>{t('puzzle.steps.image.intro')}</Intro>
        <CameraCapture
          onCancel={() => setCamera(false)}
          onCaptured={(photo) => {
            setCamera(false);
            accept(photo);
          }}
        />
      </View>
    );
  }

  const action = (label: string, onPress: () => void, primary = false) => (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityState={{ disabled: busy }}
      style={[
        styles.button,
        primary ? { backgroundColor: colors.accentSolid } : { borderWidth: 1, borderColor: colors.border },
        busy && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, { color: primary ? '#ffffff' : colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View>
      <Intro>{t('puzzle.steps.image.intro')}</Intro>

      <View
        style={[
          styles.zone,
          { borderColor: dragging ? colors.accent : colors.border, backgroundColor: dragging ? colors.accentSurface : colors.surfaceMuted },
        ]}
      >
        <View style={styles.actions}>
          {action(t('puzzle.image.file'), () => void run(pickImageFile), true)}
          {IS_WEB ? null : action(t('puzzle.image.gallery'), () => void run(pickImageFromGallery))}
          {action(t('puzzle.image.camera'), () => setCamera(true))}
        </View>
        {IS_WEB ? <Text style={[styles.hint, { color: colors.textMuted }]}>{t('puzzle.image.dropHint')}</Text> : null}
        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.hint, { color: colors.textMuted }]}>{t('puzzle.image.opening')}</Text>
          </View>
        ) : null}
      </View>

      {failure !== null ? (
        <View accessibilityRole="alert" style={[styles.error, { backgroundColor: colors.errorSurface }]}>
          <Text style={{ color: colors.error }}>{failure === 'notImage' ? t('puzzle.image.notImage') : t('puzzle.image.error')}</Text>
        </View>
      ) : null}

      <Text style={[styles.note, { color: colors.textMuted }]}>{t('puzzle.image.formats')}</Text>
      <Text style={[styles.note, { color: colors.textMuted }]}>{t('puzzle.image.privacy')}</Text>

      {image !== null ? (
        <View style={styles.previewBlock}>
          <View style={[styles.preview, { aspectRatio: image.width / image.height, borderColor: colors.borderMuted }]}>
            <Image source={{ uri: image.uri }} style={StyleSheet.absoluteFill} contentFit="contain" />
          </View>
          <Text style={[styles.size, { color: colors.textSecondary }]}>
            {t('puzzle.image.size', { w: image.width, h: image.height })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, padding: 14, alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  button: { minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  hint: { fontSize: 12, marginTop: 10, textAlign: 'center' },
  busy: { alignItems: 'center', marginTop: 8 },
  error: { borderRadius: 12, padding: 12, marginTop: 10 },
  note: { fontSize: 12, lineHeight: 16, marginTop: 8 },
  previewBlock: { marginTop: 14, alignItems: 'center' },
  preview: { width: '100%', maxHeight: 280, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  size: { fontSize: 12, marginTop: 6 },
});
