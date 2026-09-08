import React, { useContext, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../theme/theme';
import ScreenContainer from '../../components/ui/ScreenContainer';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import SectionHeader from '../../components/ui/SectionHeader';
import { AuthContext } from '../../context/AuthContext';
import { getHODStats } from '../../services/dashboardApi';

const HODDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: '0',
    totalFaculty: '0',
    todayClasses: '0',
    overallAttendance: '--'
  });

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          const data = await getHODStats();
          setStats(data);
        } catch (error) {
          console.error('Failed to load dashboard stats:', error);
        }
      };
      fetchStats();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      'Log out?',
      'Are you sure you want to log out of AttendX?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'HOD';

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Department HOD</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
          <Text style={styles.avatarText}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'HD'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statGrid}>
        <StatCard title="Total Students" value={stats.totalStudents.toString()} icon="users" />
        <StatCard title="Total Faculty" value={stats.totalFaculty.toString()} icon="user-check" />
        <StatCard title="Today's Classes" value={stats.todayClasses.toString()} icon="book-open" />
        <StatCard title="Overall Attendance" value={stats.overallAttendance.toString()} icon="pie-chart" accent="violet" />
      </View>

      <SectionHeader title="Today's Overview" />
      <EmptyState
        icon="clock"
        message="No activity yet"
        description="Activity will appear here once your department starts using AttendX."
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xxxl,
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
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
  },
});

export default HODDashboard;
