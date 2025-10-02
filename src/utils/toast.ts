import Toast from 'react-native-toast-message';
import { successNotification, errorNotification, warningNotification } from './haptics';

interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
  onPress?: () => void;
  withHaptic?: boolean;
}

/**
 * Show a success toast notification
 */
export function showSuccessToast(options: ToastOptions): void {
  const { title = 'Berhasil', message, duration = 3000, onPress, withHaptic = true } = options;

  if (withHaptic) successNotification();

  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: duration,
    onPress,
  });
}

/**
 * Show an error toast notification
 */
export function showErrorToast(options: ToastOptions): void {
  const { title = 'Gagal', message, duration = 5000, onPress, withHaptic = true } = options;

  if (withHaptic) errorNotification();

  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    onPress,
  });
}

/**
 * Show an info toast notification
 */
export function showInfoToast(options: ToastOptions): void {
  const { title = 'Informasi', message, duration = 4000, onPress, withHaptic = false } = options;

  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: duration,
    onPress,
  });
}

/**
 * Show a warning toast notification
 */
export function showWarningToast(options: ToastOptions): void {
  const { title = 'Peringatan', message, duration = 4000, onPress, withHaptic = true } = options;

  if (withHaptic) warningNotification();

  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    onPress,
  });
}

/**
 * Simple success toast (shorthand)
 */
export function toastSuccess(message: string): void {
  showSuccessToast({ message });
}

/**
 * Simple error toast (shorthand)
 */
export function toastError(message: string): void {
  showErrorToast({ message });
}

/**
 * Simple info toast (shorthand)
 */
export function toastInfo(message: string): void {
  showInfoToast({ message });
}

/**
 * Simple warning toast (shorthand)
 */
export function toastWarning(message: string): void {
  showWarningToast({ message });
}

/**
 * Hide all toasts
 */
export function hideToast(): void {
  Toast.hide();
}
