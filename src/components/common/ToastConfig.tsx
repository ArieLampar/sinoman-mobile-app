import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseToast, ErrorToast, InfoToast, ToastConfig as ToastConfigType } from 'react-native-toast-message';
import { useTheme } from 'react-native-paper';

export const createToastConfig = (): ToastConfigType => {
  return {
    success: (props) => (
      <BaseToast
        {...props}
        style={[styles.toast, { borderLeftColor: '#4CAF50' }]}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={3}
        renderLeadingIcon={() => (
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
          </View>
        )}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={[styles.toast, { borderLeftColor: '#F44336' }]}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={3}
        renderLeadingIcon={() => (
          <View style={styles.iconContainer}>
            <Icon name="alert-circle" size={24} color="#F44336" />
          </View>
        )}
      />
    ),
    info: (props) => (
      <InfoToast
        {...props}
        style={[styles.toast, { borderLeftColor: '#2196F3' }]}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={3}
        renderLeadingIcon={() => (
          <View style={styles.iconContainer}>
            <Icon name="information" size={24} color="#2196F3" />
          </View>
        )}
      />
    ),
    warning: (props) => (
      <BaseToast
        {...props}
        style={[styles.toast, { borderLeftColor: '#FF9800' }]}
        contentContainerStyle={styles.contentContainer}
        text1Style={styles.text1}
        text2Style={styles.text2}
        text2NumberOfLines={3}
        renderLeadingIcon={() => (
          <View style={styles.iconContainer}>
            <Icon name="alert" size={24} color="#FF9800" />
          </View>
        )}
      />
    ),
  };
};

const styles = StyleSheet.create({
  toast: {
    borderLeftWidth: 5,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    lineHeight: 20,
  },
});
