import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme/theme';

const HOD_EXTRA = [
  { icon: 'layers', label: 'Academics', screen: 'Academics', param: 'Academic Structure' },
  { icon: 'bar-chart-2', label: 'Reports', screen: 'ComingSoon', param: 'Reports' },
];

const FACULTY_EXTRA = [
  { icon: 'bar-chart-2', label: 'Reports', screen: 'ComingSoon', param: 'Reports' },
];

const COMMON = [
  { icon: 'settings', label: 'Settings', screen: 'ComingSoon', param: 'Settings' },
  { icon: 'info', label: 'About AttendX', screen: 'ComingSoon', param: 'About' },
];

const MoreScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const extras =
    user?.role === 'HOD' ? HOD_EXTRA :
    user?.role === 'Faculty' ? FACULTY_EXTRA : [];

  const handleLogout = () => {
    Alert.alert('Sign out?', 'Are you sure you want to sign out of AttendX?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, destructive }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, destructive && styles.menuIconRed]}>
        <Feather name={icon} size={18} color={destructive ? theme.colors.error : theme.colors.primary} />
      </View>
      <Text style={[styles.menuLabel, destructive && styles.menuLabelRed]}>{label}</Text>
      {!destructive && <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role}</Text>
            </View>
          </View>
        </View>

        {/* Role-specific extras */}
        {extras.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FEATURES</Text>
            <View style={styles.card}>
              {extras.map((item, i) => (
                <View key={item.label}>
                  <MenuItem
                    icon={item.icon}
                    label={item.label}
                    onPress={() => navigation.navigate(item.screen, { feature: item.param })}
                  />
                  {i < extras.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Common */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={styles.card}>
            {COMMON.map((item, i) => (
              <View key={item.label}>
                <MenuItem
                  icon={item.icon}
                  label={item.label}
                  onPress={() => navigation.navigate(item.screen, { feature: item.param })}
                />
                {i < COMMON.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuItem icon="log-out" label="Sign Out" onPress={handleLogout} destructive />
          </View>
        </View>

        <Text style={styles.version}>AttendX v1.0.0 · ANITS</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: 20,
    marginBottom: 24,
    ...theme.shadows.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  profileInfo: { flex: 1 },
  profileName: { ...theme.typography.h3, marginBottom: 6 },
  roleBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  roleBadgeText: { fontSize: 12, fontWeight: '600', color: theme.colors.primary },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    ...theme.shadows.subtle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconRed: { backgroundColor: theme.colors.errorLight },
  menuLabel: { ...theme.typography.body, flex: 1, fontWeight: '500' },
  menuLabelRed: { color: theme.colors.error },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: 66 },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 16,
  },
});

export default MoreScreen;
