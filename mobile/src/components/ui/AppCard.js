import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

const AppCard = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.xl,
    ...theme.shadows.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.l,
  },
});

export default AppCard;
