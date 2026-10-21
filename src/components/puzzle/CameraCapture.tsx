import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import type { SourceImage } from './imageSource';

interface CameraCaptureProps {
  onCaptured: (image: SourceImage) => void;
  onCancel: () => void;
}

/**
 * Web cam in the browser, phone camera on a device. The rear camera is the default
 * because the subject is a map or a plan, with a button to flip to the front one.
 * Browsers only hand out the camera on a secure page (https or localhost), so that
 * case gets its own explanation instead of a silent black box.
 */
export function CameraCapture({ onCaptured, onCancel }: CameraCaptureProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const camera = useRef<CameraView>(null);

  const insecure = Platform.OS === 'web' && typeof window !== 'undefined' && window.isSecureContext === false;

  const capture = async () => {
    if (!camera.current || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.92 });
      onCaptured({ uri: photo.uri, width: photo.width, height: photo.height });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const message = (text: string) => (
    <View style={[styles.box, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );

  const cancel = (
    <Pressable onPress={onCancel} accessibilityRole="button" style={[styles.button, styles.secondary, { borderColor: colors.border }]}>
      <Text style={[styles.buttonText, { color: colors.textPrimary }]}>{t('puzzle.camera.cancel')}</Text>
    </Pressable>
  );

  if (insecure) {
    return (
      <View>
        {message(t('puzzle.camera.insecure'))}
        {cancel}
      </View>
    );
  }

  if (permission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
        <Text style={[styles.message, { color: colors.textMuted }]}>{t('puzzle.camera.loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <View>
        {message(blocked ? t('puzzle.camera.denied') : t('puzzle.camera.needsPermission'))}
        <View style={styles.row}>
          {blocked ? null : (
            <Pressable
              onPress={() => void requestPermission()}
              accessibilityRole="button"
              style={[styles.button, { backgroundColor: colors.accentSolid }]}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>{t('puzzle.camera.allow')}</Text>
            </Pressable>
          )}
          {cancel}
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.preview}>
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing={facing}
          onCameraReady={() => setReady(true)}
          onMountError={() => setFailed(true)}
        />
        {!ready && !failed ? (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <ActivityIndicator color="#ffffff" />
            <Text style={styles.overlayText}>{t('puzzle.camera.loading')}</Text>
          </View>
        ) : null}
      </View>

      {failed ? <Text style={[styles.error, { color: colors.error }]}>{t('puzzle.camera.failed')}</Text> : null}

      <View style={styles.row}>
        <Pressable
          onPress={() => void capture()}
          disabled={!ready || busy}
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready || busy }}
          style={[styles.button, { backgroundColor: colors.accentSolid }, (!ready || busy) && styles.disabled]}
        >
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>{t('puzzle.camera.capture')}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setReady(false);
            setFacing((current) => (current === 'back' ? 'front' : 'back'));
          }}
          accessibilityRole="button"
          style={[styles.button, styles.secondary, { borderColor: colors.border }]}
        >
          <Text style={[styles.buttonText, { color: colors.textPrimary }]}>{t('puzzle.camera.flip')}</Text>
        </Pressable>
        {cancel}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000000' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  overlayText: { color: '#ffffff', fontSize: 12, marginTop: 8 },
  box: { borderRadius: 12, padding: 14, marginBottom: 12 },
  message: { fontSize: 13, lineHeight: 18 },
  error: { fontSize: 13, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  button: { minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  secondary: { borderWidth: 1 },
  buttonText: { fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.4 },
});
