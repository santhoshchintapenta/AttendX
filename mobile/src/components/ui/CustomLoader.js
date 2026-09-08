import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

/**
 * Simple rotating loader built with a View (no SVG).
 * Props:
 *   size: number (default 48)
 *   color: string (border color, default '#2563EB')
 *   strokeWidth: number (default 2)
 */
const CustomLoader = forwardRef(({ size = 48, color = '#2563EB', strokeWidth = 2 }, ref) => {
  const rotation = React.useRef(new Animated.Value(0)).current;

  // expose controls if needed
  useImperativeHandle(ref, () => ({
    start: () => {
      rotation.setValue(0);
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    },
    stop: () => {
      rotation.stopAnimation();
    },
  }));

  useEffect(() => {
    rotation.setValue(0);
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loaderStyle = {
    width: size,
    height: size,
    borderWidth: strokeWidth,
    borderColor: color,
    borderTopColor: 'transparent',
    borderRadius: size / 2,
    transform: [{ rotate: rotateInterpolate }],
  };

  return <Animated.View style={[styles.loader, loaderStyle]} />;
});

const styles = StyleSheet.create({
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomLoader;
