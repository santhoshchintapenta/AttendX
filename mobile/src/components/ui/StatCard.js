import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import AppCard from './AppCard';

const StatCard = ({ title, value, icon = 'activity', accent = 'blue', style }) => {
  // accent='violet' kept for API compat but maps to a teal tint in new theme
  const iconBg = theme.colors.primaryLight;
  const iconColor = theme.colors.primary;

  return (
    <AppCard style={[styles.card, style]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.l,
    width: '48%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  textContainer: {
    width: '100%',
  },
  title: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    ...theme.typography.h2,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
});

export default StatCard;
