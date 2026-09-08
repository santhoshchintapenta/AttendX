import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    // Input validation
    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await login(email, password);
      if (!result?.success) {
        setErrorMsg(result?.message || 'Login failed.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to connect to the server. Please try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative Premium Ambient Background */}
      <View style={[styles.ambientShape, styles.ambientBlue]} pointerEvents="none" />
      <View style={[styles.ambientShape, styles.ambientViolet]} pointerEvents="none" />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome to AttendX</Text>
            <Text style={styles.subtitleText}>Your academic workspace, all in one place.</Text>
          </View>

          <View style={styles.authCard}>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
            
            <AppInput 
              label="Email Address"
              icon="mail"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AppInput 
              label="Password"
              icon="lock"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
            />

            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton 
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading}
              style={styles.loginBtn}
            />
          </View>

          <View style={styles.trustIndicator}>
            <Feather name="shield" size={14} color="#98A2B3" style={styles.trustIcon} />
            <Text style={styles.trustText}>Secure Academic Access</Text>
          </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  ambientShape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
  },
  ambientBlue: {
    width: 300,
    height: 300,
    backgroundColor: '#EEF4FF',
    top: -100,
    right: -100,
  },
  ambientViolet: {
    width: 250,
    height: 250,
    backgroundColor: '#F3EEFF',
    top: 200,
    left: -125,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#162033',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#667085',
    textAlign: 'center',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#162033',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.03,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  errorText: {
    fontSize: 13,
    color: '#F04438',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  loginBtn: {
    marginTop: 8,
  },
  trustIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  trustIcon: {
    marginRight: 6,
  },
  trustText: {
    fontSize: 13,
    color: '#98A2B3',
    fontWeight: '500',
  },
});

export default LoginScreen;
