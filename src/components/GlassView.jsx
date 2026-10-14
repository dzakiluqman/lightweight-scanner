import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../context/ThemeContext';
import { Radius } from '../constants/theme';

/**
 * Liquid Glass Container Component
 * Combines frosted translucent backdrop with crisp 1px border and rounded-2xl geometry.
 */
export default function GlassView({
  children,
  style,
  intensity = 35,
  borderRadius = Radius.lg,
  variant = 'card', // 'card' | 'surface' | 'pill' | 'button' | 'orb'
  ...props
}) {
  const { colors, isDark } = useAppTheme();

  // Variant color mapping
  let bgColor = colors.glassCardBg;
  let borderColor = colors.glassCardBorder;

  if (variant === 'button') {
    bgColor = colors.glassBg;
    borderColor = colors.glassBorder;
  } else if (variant === 'pill') {
    bgColor = colors.glassPillBg;
    borderColor = colors.glassPillBorder;
  } else if (variant === 'orb') {
    bgColor = colors.glassOrbBg;
    borderColor = colors.glassOrbBorder;
  } else if (variant === 'surface') {
    bgColor = colors.glassBg;
    borderColor = colors.glassBorder;
  }

  const containerStyle = [
    styles.base,
    {
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderRadius: borderRadius,
    },
    style,
  ];

  // BlurView is available on iOS and supported Android versions
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <View style={[containerStyle, styles.overflowHidden]} {...props}>
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    position: 'relative',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
});
