import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';

/**
 * Handcrafted Precision Vector Logo
 * Minimalist document silhouette with Electric Cyan to Royal Indigo laser aperture geometry.
 * Free of artificial AI blur slop.
 */
export default function Logo({ size = 32, style }) {
  const { colors, isDark } = useAppTheme();

  const sheetFill = isDark ? 'rgba(30, 41, 59, 0.90)' : '#FFFFFF';
  const cornerFill = isDark ? 'rgba(51, 65, 85, 0.90)' : '#E2E8F0';

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
      >
        <Defs>
          <LinearGradient id="logoLaserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#06B6D4" />
            <Stop offset="100%" stopColor="#6366F1" />
          </LinearGradient>
          <LinearGradient id="logoBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Document Body with Folded Top-Right Corner */}
        <Path
          d="M 9 6 
             L 24 6 
             L 31 13 
             L 31 34 
             C 31 35.1 30.1 36 29 36 
             L 11 36 
             C 9.9 36 9 35.1 9 34 
             Z"
          fill={sheetFill}
          stroke={colors.border}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Folded Corner Triangle */}
        <Path
          d="M 24 6 
             L 24 13 
             L 31 13 
             Z"
          fill={cornerFill}
          stroke={colors.border}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Minimal Document Content Lines */}
        <Line x1="14" y1="14" x2="20" y2="14" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="14" y1="18" x2="26" y2="18" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="14" y1="22" x2="23" y2="22" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />

        {/* Precision Scanner Reticle & Laser Beam with Gradient */}
        <G>
          {/* Laser Line */}
          <Line
            x1="11"
            y1="27"
            x2="29"
            y2="27"
            stroke="url(#logoLaserGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Scanner Viewfinder Corner Brackets */}
          <Path
            d="M 12 24 L 12 23 L 14 23"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M 28 24 L 28 23 L 26 23"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M 12 30 L 12 31 L 14 31"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M 28 30 L 28 31 L 26 31"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

