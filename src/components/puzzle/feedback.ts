import * as Haptics from 'expo-haptics';

/**
 * Vibration feedback. The Expo SDK 57 docs say nothing about what the calls do where
 * vibration is not available (a browser without the Vibration API, an iPhone in Low
 * Power Mode...), so every call is wrapped: feedback is a nicety and must never be able
 * to break placing a piece.
 */
function safely(run: () => Promise<void>): void {
  try {
    run().catch(() => {
      // nothing to do: no vibration available
    });
  } catch {
    // same
  }
}

/** A piece snapped into place. */
export function placeFeedback(enabled: boolean): void {
  if (enabled) safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** The whole area is covered. */
export function successFeedback(enabled: boolean): void {
  if (enabled) safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
