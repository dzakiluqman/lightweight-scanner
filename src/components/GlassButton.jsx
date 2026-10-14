import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../constants/theme';

/**
 * Liquid Glass Button Component
 * Translucent frosted glass button with 1px border and smooth active feedback.
 */
export default function GlassButton({
  onPress,
  title,
  icon: Icon,
  disabled = false,
  style,
  textStyle,
  size = 'md', // 'sm' | 'md' | 'lg'
  children,
  active = false,
  activeBorderColor,
  activeBgColor,
  ...props
}) {
  const { colors, isDark } = useAppTheme();

  const height = size === 'sm' ? 36 : size === 'lg' ? 50 : 44;
  const paddingHorizontal = size === 'sm' ? Spacing.sm : Spacing.md;
  const fontSize = size === 'sm' ? 12.5 : size === 'lg' ? 14.5 : 13.5;

  const resolvedBg = active
    ? activeBgColor || (isDark ? 'rgba(6, 182, 212, 0.20)' : 'rgba(6, 182, 212, 0.15)')
    : colors.glassBg;

  const resolvedBorder = active
    ? activeBorderColor || colors.accent
    : colors.glassBorder;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.72}
      style={[
        styles.wrapper,
        {
          height,
          paddingHorizontal,
          backgroundColor: resolvedBg,
          borderColor: resolvedBorder,
          borderRadius: Radius.lg,
        },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      {children ? (
        children
      ) : (
        <View style={styles.contentRow}>
          {Icon && <View style={styles.iconBox}>{Icon}</View>}
          {title && (
            <Text
              style={[
                styles.text,
                {
                  fontSize,
                  color: active ? colors.accent : colors.textPrimary,
                  fontFamily: Typography.fontFamily,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  disabled: {
    opacity: 0.45,
  },
});
