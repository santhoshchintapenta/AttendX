import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import ScreenContainer from '../../components/ui/ScreenContainer';
import SectionHeader from '../../components/ui/SectionHeader';
import EmptyState from '../../components/ui/EmptyState';
import { AuthContext } from '../../context/AuthContext';

const UPCOMING_FEATURES = [
  { icon: 'calendar', label: 'My Schedule', desc: 'View your class timetable' },
  { icon: 'check-circle', label: 'Mark Attendance', desc: 'Record student attendance' },
  { icon: 'bar-chart-2', label: 'Reports', desc: 'Attendance analytics & insights' },
];

const FacultyDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodayLabel = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const firstName = user?.name?.split(' ')[0] || 'Faculty';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'FA';

  const handleLogout = () => {
    Alert.alert(
      'Sign out?',
      'Are you sure you want to sign out of AttendX?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScreenContainer>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Faculty</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Date card ── */}
      <View style={styles.dateCard}>
        <View style={styles.dateIcon}>
          <Feather name="sun" size={18} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.dateValue}>{getTodayLabel()}</Text>
        </View>
      </View>

      {/* ── Today's classes ── */}
      <SectionHeader title="Today's Classes" />
      <EmptyState
        icon="calendar"
        message="No classes scheduled"
        description="Your timetable will appear here once schedule setup is complete."
      />

      {/* ── Upcoming features ── */}
      <SectionHeader title="Coming Soon" />
      <View style={styles.featureList}>
        {UPCOMING_FEATURES.map((f, i) => (
          <View
            key={f.label}
            style={[
              styles.featureRow,
              i < UPCOMING_FEATURES.length - 1 && styles.featureRowBorder,
            ]}
          >
            <View style={styles.featureIcon}>
              <Feather name={f.icon} size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>Soon</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.xl,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  name: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.m,
  },
  badge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Date card
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  // Upcoming features
  featureList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
    marginBottom: theme.spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureInfo: { flex: 1 },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  featurePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
});

export default FacultyDashboard;
