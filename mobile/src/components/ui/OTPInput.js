import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { theme } from '../../theme/theme';

/**
 * OTPInput component using React Native Animated API.
 * Props:
 *   length: number of OTP boxes (default 6)
 *   value: array of strings (each digit)
 *   onChange: (newArray) => void
 *   error: boolean – show error styling
 *   disabled: boolean – disable inputs
 */
const OTPInput = forwardRef(({
  length = 6,
  value = [],
  onChange,
  error = false,
  disabled = false,
}, ref) => {
  const inputsRef = useRef([]);

  // Animated values for each box
  const translateX = useRef(Array.from({ length }, () => new Animated.Value(0))).current;
  const scale = useRef(Array.from({ length }, () => new Animated.Value(1))).current;
  const opacity = useRef(Array.from({ length }, () => new Animated.Value(1))).current;

  const [containerWidth, setContainerWidth] = useState(0);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      inputsRef.current[0]?.focus();
    },
    startConverge: () => {
      return new Promise(resolve => {
        const boxWidth = 56; // matches styles.box width
        const gap = 10;
        const totalWidth = length * boxWidth + (length - 1) * gap;
        const centerX = containerWidth / 2;
        const animations = [];
        for (let i = 0; i < length; i++) {
          const boxCenter = i * (boxWidth + gap) + boxWidth / 2;
          const distance = centerX - boxCenter;
          animations.push(
            Animated.timing(translateX[i], {
              toValue: distance,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            })
          );
          animations.push(
            Animated.timing(scale[i], {
              toValue: 0.85,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            })
          );
          animations.push(
            Animated.timing(opacity[i], {
              toValue: 0,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            })
          );
        }
        Animated.parallel(animations).start(() => resolve());
      });
    },
    rebuild: () => {
      const animations = [];
      for (let i = 0; i < length; i++) {
        animations.push(
          Animated.timing(translateX[i], {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        );
        animations.push(
          Animated.timing(scale[i], {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        );
        animations.push(
          Animated.timing(opacity[i], {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        );
      }
      Animated.parallel(animations).start();
    },
    resetValue: () => {
      onChange(Array(length).fill(''));
    },
  }));

  const handleChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) {
      const newVals = [...value];
      newVals[index] = '';
      onChange(newVals);
      return;
    }
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, length).split('');
      const newVals = new Array(length).fill('');
      chars.forEach((c, i) => {
        newVals[i] = c;
      });
      onChange(newVals);
      const nextIdx = Math.min(chars.length, length - 1);
      inputsRef.current[nextIdx]?.focus();
      return;
    }
    const newVals = [...value];
    newVals[index] = cleaned;
    onChange(newVals);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && value[index] === '' && index > 0) {
      const prevIdx = index - 1;
      inputsRef.current[prevIdx]?.focus();
      const newVals = [...value];
      newVals[prevIdx] = '';
      onChange(newVals);
    }
  };

  const onContainerLayout = e => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container} onLayout={onContainerLayout} pointerEvents={disabled ? 'none' : 'auto'}>
      {Array.from({ length }).map((_, i) => {
        const animatedStyle = {
          transform: [{ translateX: translateX[i] }, { scale: scale[i] }],
          opacity: opacity[i],
        };
        const boxStyle = [
          styles.box,
          value[i] !== '' && styles.filledBox,
          error && styles.errorBox,
        ];
        return (
          <Animated.View key={i} style={animatedStyle}>
            <TextInput
              ref={ref => (inputsRef.current[i] = ref)}
              style={boxStyle}
              value={value[i]}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!disabled}
              selectTextOnFocus={!disabled}
              textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
            />
          </Animated.View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.m,
    gap: 10,
  },
  box: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAF0',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#162033',
    ...Platform.select({
      ios: {
        shadowColor: '#162033',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  filledBox: {
    backgroundColor: '#F8FBFF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  errorBox: {
    backgroundColor: '#FFF7F7',
    borderColor: '#F04438',
  },
});

export default OTPInput;
