import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, Avatar, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserProfile, MembershipTier } from '@types';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditPress?: () => void;
  onPhotoPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onEditPress, onPhotoPress }) => {
  const theme = useTheme();

  const getTierColor = (tier: MembershipTier): string => {
    switch (tier) {
      case MembershipTier.PLATINUM:
        return '#E5E4E2';
      case MembershipTier.GOLD:
        return '#FFD700';
      case MembershipTier.SILVER:
        return '#C0C0C0';
      case MembershipTier.BASIC:
      default:
        return theme.colors.surfaceVariant;
    }
  };

  const getTierLabel = (tier: MembershipTier): string => {
    switch (tier) {
      case MembershipTier.PLATINUM:
        return 'Platinum';
      case MembershipTier.GOLD:
        return 'Gold';
      case MembershipTier.SILVER:
        return 'Silver';
      case MembershipTier.BASIC:
      default:
        return 'Basic';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.content}>
        {/* Profile Photo */}
        <TouchableOpacity onPress={onPhotoPress} style={styles.avatarContainer}>
          {profile.profilePhotoUrl ? (
            <Image source={{ uri: profile.profilePhotoUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={80} label={profile.name.charAt(0).toUpperCase()} />
          )}
          <View style={[styles.cameraIcon, { backgroundColor: theme.colors.primary }]}>
            <Icon name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Profile Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="headlineSmall" style={[styles.name, { color: theme.colors.onSurface }]}>
              {profile.name}
            </Text>
            {onEditPress && (
              <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
                <Icon name="pencil" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <Text variant="bodyMedium" style={[styles.memberNumber, { color: theme.colors.onSurfaceVariant }]}>
            No. Anggota: {profile.memberNumber}
          </Text>

          {/* Membership Tier Badge */}
          <View style={styles.tierBadge}>
            <Badge
              style={[styles.badge, { backgroundColor: getTierColor(profile.membershipTier) }]}
              size={24}
            >
              <View style={styles.badgeContent}>
                <Icon name="crown" size={12} color={theme.colors.onSurface} />
                <Text
                  variant="labelSmall"
                  style={[styles.tierLabel, { color: theme.colors.onSurface, fontWeight: '600' }]}
                >
                  {getTierLabel(profile.membershipTier)}
                </Text>
              </View>
            </Badge>
          </View>

          {/* Member Since */}
          <View style={styles.memberSince}>
            <Icon name="calendar-check" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={[styles.memberSinceText, { color: theme.colors.onSurfaceVariant }]}>
              Anggota sejak {new Date(profile.memberSince).getFullYear()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    alignItems: 'center',
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontWeight: '700',
  },
  editButton: {
    padding: 4,
  },
  memberNumber: {
    fontWeight: '500',
  },
  tierBadge: {
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierLabel: {
    fontSize: 11,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  memberSinceText: {
    fontWeight: '500',
  },
});
