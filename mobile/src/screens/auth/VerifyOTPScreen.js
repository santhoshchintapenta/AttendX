import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, AccessibilityInfo } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import OTPInput from '../../components/ui/OTPInput';
import AppButton from '../../components/ui/AppButton';
import VerificationOverlay from '../../components/ui/VerificationOverlay';
import { theme } from '../../theme/theme';
import api from '../../services/api';

const VerifyOTPScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [animationStatus, setAnimationStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const otpRef = useRef(null);
  const overlayRef = useRef(null);

  // Timer countdown for resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle successful OTP entry (six digits entered)
  const handleComplete = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    // Small pause before starting animation (150‑180ms)
    await new Promise(res => setTimeout(res, 150));

    // Show overlay with loading state before boxes finish converging
    setAnimationStatus('loading');
    AccessibilityInfo.announceForAccessibility('Verifying your code');

    // Start convergence animation (await its completion)
    if (otpRef.current?.startConverge) {
      await otpRef.current.startConverge();
    }

    // Record start time to enforce minimum loader visibility
    const loaderStart = Date.now();

    // Begin API request concurrently with loader already visible
    let apiResponse;
    let apiError = null;
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp: otp.join('') });
      apiResponse = response;
    } catch (err) {
      apiError = err;
    }

    // Ensure loader stays visible for at least 600ms (500‑700ms range)
    const elapsed = Date.now() - loaderStart;
    if (elapsed < 600) {
      await new Promise(res => setTimeout(res, 600 - elapsed));
    }

    if (apiResponse && apiResponse.data && apiResponse.data.success) {
      // SUCCESS FLOW
      setAnimationStatus('success');
      AccessibilityInfo.announceForAccessibility('Code verified successfully');
      // Keep success state visible for ~1000ms before navigation
      setTimeout(() => {
        navigation.navigate('ResetPassword', { resetToken: apiResponse.data.data.resetToken });
      }, 1000);
    } else {
      // FAILURE FLOW
      setErrorMsg(apiError?.response?.data?.message || apiResponse?.data?.message || 'Invalid verification code.');
      setAnimationStatus('error');
      AccessibilityInfo.announceForAccessibility('Incorrect verification code. Please try again.');
    }
  };

  // Callback after error animation finishes – rebuild OTP boxes
  const handleErrorOverlayEnd = async () => {
    // Reset overlay and rebuild boxes
    setAnimationStatus('idle');
    if (otpRef.current?.rebuild) {
      await otpRef.current.rebuild();
    }
    // Clear OTP values and enable inputs
    setOtp(Array(6).fill(''));
    // Focus first box
    setTimeout(() => {
      otpRef.current?.focusFirst?.();
    }, 50);
  };

  // Trigger verification when OTP array is full (six digits) and not already loading
  useEffect(() => {
    if (otp.join('').length === 6 && animationStatus === 'idle') {
      handleComplete();
    }
  }, [otp]);

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await api.post('/auth/forgot-password', { email });
      setTimer(60);
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || 'Unable to connect to the server. Please try again.';
      setErrorMsg(message);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content} pointerEvents={animationStatus === 'idle' ? 'auto' : 'none'}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>We sent a 6-digit verification code to</Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.form}>
          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
          <OTPInput
            ref={otpRef}
            length={6}
            value={otp}
            onChange={setOtp}
            error={!!errorMsg && otp.join('').length < 6}
            disabled={animationStatus !== 'idle'}
          />
          <AppButton
            title="Verify Code"
            onPress={handleComplete}
            loading={animationStatus !== 'idle'}
            style={styles.submitBtn}
            disabled={animationStatus !== 'idle'}
          />
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive a code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <VerificationOverlay
        ref={overlayRef}
        visible={animationStatus !== 'idle'}
        status={animationStatus}
        onAnimationEnd={animationStatus === 'error' ? handleErrorOverlayEnd : undefined}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: theme.spacing.xxl,
    position: 'relative',
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
    marginBottom: 4,
  },
  emailText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
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
    marginBottom: theme.spacing.xl,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  resendLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  resendLinkDisabled: {
    color: theme.colors.textMuted,
  },
});

export default VerifyOTPScreen;
