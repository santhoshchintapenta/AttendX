import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppButton from '../../components/ui/AppButton';
import { theme } from '../../theme/theme';

const PasswordResetSuccessScreen = ({ navigation }) => {
  
  const handleReturn = () => {
    // Clear navigation stack and go to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="check" size={48} color={theme.colors.success} />
        </View>
        
        <Text style={styles.title}>Password updated!</Text>
        <Text style={styles.subtitle}>
          Your password has been successfully reset. You can now sign in with your new password.
        </Text>

        <AppButton 
          title="Back to Login" 
          onPress={handleReturn} 
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6F4EA', // soft success green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xxxl,
  },
  btn: {
    width: '100%',
  },
});

export default PasswordResetSuccessScreen;
