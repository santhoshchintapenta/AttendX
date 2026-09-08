import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { theme } from '../../theme/theme';
import api from '../../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOTP = async () => {
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        navigation.navigate('VerifyOTP', { email });
      } else {
        setErrorMsg(response.data.message || 'Failed to send verification code.');
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
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>Enter your registered email address and we'll send you a verification code.</Text>
        </View>

        <View style={styles.form}>
          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <AppInput
            label="Email Address"
            icon="mail"
            placeholder="user@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppButton
            title="Send Verification Code"
            onPress={handleSendOTP}
            loading={loading}
            style={styles.submitBtn}
          />

          <AppButton
            title="Back to Login"
            type="secondary"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
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
  submitBtn: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  backBtn: {
    marginTop: theme.spacing.s,
  },
});

export default ForgotPasswordScreen;
