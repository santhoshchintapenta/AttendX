import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';

const AppButton = ({ title, onPress, type = 'primary', loading = false, style, textStyle }) => {
  const isPrimary = type === 'primary';
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      <Pressable 
        style={[
          styles.button, 
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          loading && styles.disabledButton
        ]} 
        onPress={onPress}
        disabled={loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? '#FFF' : '#2563EB'} />
        ) : (
          <Text style={[
            styles.text, 
            isPrimary ? styles.primaryText : styles.secondaryText,
            textStyle
          ]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: '#EEF4FF',
  },
  disabledButton: {
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#2563EB',
  },
});

export default AppButton;
