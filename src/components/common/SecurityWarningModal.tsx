/**
 * Security Warning Modal
 * Displays warning when device is jailbroken/rooted or compromised
 */

import React from 'react';
import { View, Modal, StyleSheet, Platform } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DeviceSecurityStatus } from '@types';
import { getSecurityWarningMessage, getSecurityWarningTitle } from '@services/security';

interface SecurityWarningModalProps {
  visible: boolean;
  securityStatus: DeviceSecurityStatus;
  onContinue: () => void;
  onExit: () => void;
}

export const SecurityWarningModal: React.FC<SecurityWarningModalProps> = ({
  visible,
  securityStatus,
  onContinue,
  onExit,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  const title = getSecurityWarningTitle(securityStatus);
  const message = getSecurityWarningMessage(securityStatus);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onExit}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <Icon
              name="shield-alert"
              size={64}
              color={theme.colors.error}
            />
          </View>

          {/* Title */}
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.error }]}
          >
            {title}
          </Text>

          {/* Message */}
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>

          {/* Warning List */}
          {securityStatus.warnings.length > 0 && (
            <View style={styles.warningList}>
              {securityStatus.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Icon name="alert-circle" size={16} color={theme.colors.error} />
                  <Text variant="bodySmall" style={styles.warningText}>
                    {warning}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Information */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.errorContainer }]}>
            <Icon name="information" size={20} color={theme.colors.onErrorContainer} />
            <Text
              variant="bodySmall"
              style={[styles.infoText, { color: theme.colors.onErrorContainer }]}
            >
              Menggunakan aplikasi pada perangkat yang dimodifikasi dapat membahayakan
              keamanan data pribadi dan keuangan Anda.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onExit}
              style={styles.button}
              textColor={theme.colors.error}
            >
              Keluar Aplikasi
            </Button>
            <Button
              mode="contained"
              onPress={onContinue}
              style={styles.button}
              buttonColor={theme.colors.error}
            >
              Lanjutkan (Risiko Sendiri)
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningList: {
    marginBottom: 16,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    marginLeft: 8,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
