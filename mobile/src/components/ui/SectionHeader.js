import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';

const SectionHeader = ({ title, actionLabel, onActionPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.m,
    marginTop: theme.spacing.l,
    paddingHorizontal: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h3,
  },
  action: {
    ...theme.typography.body,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});

export default SectionHeader;
