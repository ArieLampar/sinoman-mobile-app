import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let isHapticsSupported = true;

/**
 * Check if haptics are supported on the current device
 */
export async function checkHapticsSupport(): Promise<boolean> {
  if (Platform.OS === 'web') {
    isHapticsSupported = false;
    return false;
  }
  isHapticsSupported = true;
  return true;
}

/**
 * Light impact haptic feedback
 * Used for button presses, toggles, and minor UI interactions
 */
export async function lightImpact(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail if haptics are not available
  }
}

/**
 * Medium impact haptic feedback
 * Used for important UI interactions
 */
export async function mediumImpact(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Silently fail if haptics are not available
  }
}

/**
 * Heavy impact haptic feedback
 * Used for critical UI interactions
 */
export async function heavyImpact(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Silently fail if haptics are not available
  }
}

/**
 * Success notification haptic feedback
 * Used for successful operations
 */
export async function successNotification(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Silently fail if haptics are not available
  }
}

/**
 * Error notification haptic feedback
 * Used for failed operations
 */
export async function errorNotification(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Silently fail if haptics are not available
  }
}

/**
 * Warning notification haptic feedback
 * Used for warning messages
 */
export async function warningNotification(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // Silently fail if haptics are not available
  }
}

/**
 * Selection haptic feedback
 * Used for picker/selection changes
 */
export async function selectionAsync(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Silently fail if haptics are not available
  }
}
