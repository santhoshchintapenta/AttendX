import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';

const MIN_DISPLAY_MS = 800;

const SplashScreen = ({ onReady }) => {
  const { loading } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const startTime = useRef(Date.now());
  const authDone = useRef(false);
  const animDone = useRef(false);

  // Fade + slide in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      animDone.current = true;
      maybeNavigate();
    });
  }, []);

  // Watch auth loading state
  useEffect(() => {
    if (!loading) {
      authDone.current = true;
      maybeNavigate();
    }
  }, [loading]);

  const maybeNavigate = () => {
    if (!authDone.current || !animDone.current) return;
    const elapsed = Date.now() - startTime.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    setTimeout(onReady, remaining);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner} edges={['top', 'bottom']}>
        {/* Logo + brand */}
        <Animated.View
          style={[
            styles.brandSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.wordmark}>AttendX</Text>
          <Text style={styles.tagline}>Your Attendance · Your Tomorrow</Text>
        </Animated.View>

        {/* Bottom — ANITS branding */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <View style={styles.divider} />
          <Text style={styles.institute}>ANITS</Text>
          <Text style={styles.instituteFull}>
            Anil Neerukonda Institute of Technology & Sciences
          </Text>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  brandSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  logo: {
    width: 52,
    height: 52,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  institute: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  instituteFull: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 18,
    borderRadius: 3,
  },
});

export default SplashScreen;
