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
  { icon: 'check-circle', label: 'My Attendance', desc: 'Track your attendance record' },
];

const StatChip = ({ label, value }) => (
  <View style={styles.chip}>
    <Text style={styles.chipValue}>{value}</Text>
    <Text style={styles.chipLabel}>{label}</Text>
  </View>
);

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodayLabel = () =>
    new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

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
            <Text style={styles.badgeText}>Student</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Attendance hero card ── */}
      <View style={styles.heroCard}>
        {/* Top row — date pill */}
        <View style={styles.heroPill}>
          <Feather name="calendar" size={11} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroPillText}>{getTodayLabel()}</Text>
        </View>

        {/* Big percentage */}
        <Text style={styles.heroLabel}>Overall Attendance</Text>
        <Text style={styles.heroValue}>--</Text>
        <Text style={styles.heroSub}>
          Attendance tracking begins once timetable is published
        </Text>

        {/* Stat chips */}
        <View style={styles.chipRow}>
          <StatChip label="Present" value="--" />
          <View style={styles.chipDivider} />
          <StatChip label="Absent" value="--" />
          <View style={styles.chipDivider} />
          <StatChip label="Total" value="--" />
        </View>
      </View>

      {/* ── Today's classes ── */}
      <SectionHeader title="Today's Classes" />
      <EmptyState
        icon="book-open"
        message="No classes today"
        description="Your timetable will appear here once schedule setup is complete."
      />

      {/* ── Coming soon ── */}
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

  // Hero card
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.card,
    paddingTop: 20,
    paddingBottom: 0,
    paddingHorizontal: 24,
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    marginBottom: 16,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 72,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 17,
  },
  chipRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  chipValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 10,
  },

  // Coming soon features
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

export default StudentDashboard;
