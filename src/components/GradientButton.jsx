import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../context/ThemeContext';
import { Radius, Spacing, Shadows, Typography } from '../constants/theme';

/**
 * Vibrant Multi-layered Gradient CTA Button
 * Electric Cyan (#06B6D4) to Royal Indigo (#6366F1) with rounded-2xl geometry.
 */
export default function GradientButton({
  onPress,
  title,
  icon: Icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
  gradientColors,
  size = 'md', // 'sm' | 'md' | 'lg'
  children,
  ...props
}) {
  const { colors } = useAppTheme();

  const finalColors = gradientColors || colors.primaryGradient;

  const height = size === 'sm' ? 38 : size === 'lg' ? 52 : 46;
  const paddingHorizontal = size === 'sm' ? Spacing.sm : Spacing.md;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 15 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.buttonWrapper,
        Shadows.glowCyan,
        disabled && styles.disabledWrapper,
        style,
      ]}
      {...props}
    >
      <LinearGradient
        colors={finalColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            height,
            paddingHorizontal,
            borderRadius: Radius.lg,
          },
        ]}
      >
        {loading ? (
          <View style={styles.contentRow}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text
              style={[
                styles.text,
                { fontSize, fontFamily: Typography.fontFamily },
                textStyle,
              ]}
            >
              Memproses...
            </Text>
          </View>
        ) : children ? (
          children
        ) : (
          <View style={styles.contentRow}>
            {Icon && <View style={styles.iconBox}>{Icon}</View>}
            {title && (
              <Text
                style={[
                  styles.text,
                  { fontSize, fontFamily: Typography.fontFamily },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  disabledWrapper: {
    opacity: 0.5,
  },
});
