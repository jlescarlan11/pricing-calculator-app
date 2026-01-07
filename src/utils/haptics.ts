/**
 * Triggers a short haptic feedback vibration if supported by the device.
 * @param duration - The duration of the vibration in milliseconds. Defaults to 50ms.
 */
export const triggerHapticFeedback = (duration: number = 50): void => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      // Silently fail if vibration is blocked or fails
      console.warn('Haptic feedback failed:', error);
    }
  }
};
