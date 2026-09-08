import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import AppCard from './AppCard';

const ActionCard = ({ title, description, icon, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
      <AppCard style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name={icon} size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  textContainer: {
    flex: 1,
    paddingRight: theme.spacing.m,
  },
  title: {
    ...theme.typography.title,
    marginBottom: 2,
  },
  description: {
    ...theme.typography.caption,
  },
});

export default ActionCard;
