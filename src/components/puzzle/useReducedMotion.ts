import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * true when the system asks for reduced motion (iOS/Android accessibility setting, or
 * `prefers-reduced-motion` in the browser). The game's effects respect it even when the
 * student left them switched on in Settings: motion that makes people ill is not a preference.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduced(enabled);
      })
      .catch(() => {
        // not readable here: keep the animations, which are short and one-off
      });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
