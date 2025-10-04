import React from 'react';
import { View, StyleSheet } from 'react-native';


export const ProfileSkeleton: React.FC = () => {
  return (
    <View>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatar} />

          {/* Name and Email */}
          <View style={styles.userInfo}>
            <View style={styles.nameText} />
            <View style={styles.emailText} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard} />
          <View style={styles.statCard} />
          <View style={styles.statCard} />
        </View>

        {/* Section Title */}
        <View style={styles.sectionTitle} />

        {/* Menu List */}
        <View style={styles.menuList}>
          <View style={styles.menuItem} />
          <View style={styles.menuItem} />
          <View style={styles.menuItem} />
          <View style={styles.menuItem} />
          <View style={styles.menuItem} />
          <View style={styles.menuItem} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  nameText: {
    width: 150,
    height: 24,
    marginBottom: 8,
  },
  emailText: {
    width: 200,
    height: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    height: 80,
    borderRadius: 8,
  },
  sectionTitle: {
    width: 120,
    height: 20,
    marginBottom: 16,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    height: 56,
    borderRadius: 8,
    marginBottom: 8,
  },
});
