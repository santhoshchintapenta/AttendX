import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { theme } from '../../theme/theme';
import api from '../../services/api';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { resetToken } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in both fields.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/reset-password', { resetToken, newPassword, confirmPassword });
      if (response.data.success) {
        navigation.navigate('PasswordResetSuccess');
      } else {
        setErrorMsg(response.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to connect to the server. Please try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create new password</Text>
          <Text style={styles.subtitle}>Choose a strong password to secure your AttendX account.</Text>
        </View>

        <View style={styles.form}>
          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <AppInput
            label="New Password"
            icon="lock"
            placeholder="At least 8 characters"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword={true}
          />

          <AppInput
            label="Confirm New Password"
            icon="lock"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword={true}
          />

          <View style={styles.helper}>
            <Text style={[styles.helperText, newPassword.length >= 8 && styles.helperSuccess]}>
              ✓ At least 8 characters
            </Text>
            <Text style={[styles.helperText, newPassword === confirmPassword && newPassword.length > 0 && styles.helperSuccess]}>
              ✓ Passwords match
            </Text>
          </View>

          <AppButton
            title="Reset Password"
            onPress={handleReset}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xxxl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
  },
  helper: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.s,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  helperSuccess: {
    color: theme.colors.success,
  },
  submitBtn: {
    marginTop: theme.spacing.m,
  },
});

export default ResetPasswordScreen;
