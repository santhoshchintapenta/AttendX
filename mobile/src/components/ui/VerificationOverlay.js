import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Easing, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CustomLoader from './CustomLoader';

/**
 * VerificationOverlay component using React Native Animated API.
 * Props:
 *   visible: boolean – whether overlay is shown
 *   status: 'loading' | 'success' | 'error'
 *   onAnimationEnd: () => void – called after error animation completes
 */
const VerificationOverlay = forwardRef(({ visible, status, onAnimationEnd }, ref) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.5)).current;
  const rotate = React.useRef(new Animated.Value(-20)).current; // degrees
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    reset: () => {
      opacity.setValue(0);
      scale.setValue(0.5);
      rotate.setValue(-20);
      shakeAnim.setValue(0);
    },
  }));

  useEffect(() => {
    if (visible) {
      // fade in overlay background
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // central box appear
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      if (status === 'error') {
        // shake sequence
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 100, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => {
          if (onAnimationEnd) onAnimationEnd();
        });
      }
    } else {
      // hide overlay
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, status]);

  const overlayStyle = {
    opacity: opacity,
    backgroundColor: 'rgba(248,250,253,0.55)', // light subtle backdrop
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: visible ? 'auto' : 'none',
  };

  const boxAnimatedStyle = {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor:
      status === 'success' ? '#ECFDF3' : status === 'error' ? '#FEF3F2' : '#F8FBFF',
    borderWidth: 1,
    borderColor:
      status === 'success' ? '#ABEFC6' : status === 'error' ? '#FECDCA' : '#DCE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      { scale },
      { rotate: rotate.interpolate({ inputRange: [-20, 0, 20], outputRange: ['-20deg', '0deg', '20deg'] }) },
      { translateX: shakeAnim },
    ],
  };

  const getMessage = () => {
    if (status === 'loading') return { title: 'Verifying your code', subtitle: '' };
    if (status === 'success') return { title: 'Verified successfully', subtitle: 'You may now reset your password.' };
    if (status === 'error') return { title: 'Incorrect code', subtitle: '' };
    return { title: '', subtitle: '' };
  };

  const { title, subtitle } = getMessage();

  return (
    <Animated.View style={overlayStyle} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={boxAnimatedStyle}>
        {status === 'loading' && <CustomLoader />}
        {status === 'success' && <Feather name="check" size={32} color="#12B76A" />}
        {status === 'error' && <Feather name="x-circle" size={32} color="#F04438" />}
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#162033',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default VerificationOverlay;
