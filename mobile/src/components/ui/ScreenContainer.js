import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const ScreenContainer = ({ children, scrollable = true, style }) => {
  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable ? { 
    contentContainerStyle: [styles.scrollContent, style],
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: 'handled'
  } : { style: [styles.viewContent, style] };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Container {...containerProps}>
          {children}
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xxxl * 2,
  },
  viewContent: {
    flex: 1,
    padding: theme.spacing.l,
  },
});

export default ScreenContainer;
