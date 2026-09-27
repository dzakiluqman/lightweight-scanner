import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  G,
  Line,
} from 'react-native-svg';

/**
 * Minimalist SVG Logo Component
 * Combines a sleek document sheet contour, folded corner,
 * dynamic glowing scanner laser beam, and camera aperture / lens.
 */
export default function Logo({ size = 64, showGlow = true, style }) {
  const gradientId = 'tealCyanGradient';
  const beamGradientId = 'laserBeamGradient';
  const bgGradientId = 'sheetBgGradient';

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
      >
        <Defs>
          {/* Main Primary Gradient: Teal to Electric Cyan */}
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0EA5E9" stopOpacity="1" />
            <Stop offset="50%" stopColor="#14B8A6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
          </LinearGradient>

          {/* Scanner Beam Laser Gradient */}
          <LinearGradient id={beamGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.1" />
            <Stop offset="25%" stopColor="#14B8A6" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#38BDF8" stopOpacity="1" />
            <Stop offset="75%" stopColor="#14B8A6" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.1" />
          </LinearGradient>

          {/* Document Sheet Subtle Dark Navy Fill */}
          <LinearGradient id={bgGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#0F172A" stopOpacity="0.98" />
          </LinearGradient>
        </Defs>

        {/* Ambient Glow */}
        {showGlow && (
          <Circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="url(#tealCyanGradient)"
            strokeWidth="4"
            opacity="0.25"
          />
        )}

        {/* Document Sheet Body with Folded Top-Right Corner */}
        <Path
          d="M 28 16 
             L 60 16 
             L 76 32 
             L 76 82 
             C 76 85, 74 87, 71 87 
             L 29 87 
             C 26 87, 24 85, 24 82 
             L 24 20 
             C 24 17, 26 16, 28 16 Z"
          fill="url(#sheetBgGradient)"
          stroke="url(#tealCyanGradient)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Folded Corner Triangle */}
        <Path
          d="M 60 16 
             L 60 30 
             C 60 32, 62 32, 64 32 
             L 76 32 Z"
          fill="#0F172A"
          stroke="url(#tealCyanGradient)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Document Text Lines (Simulated Minimal Document Lines) */}
        <Line x1="32" y1="30" x2="48" y2="30" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="32" y1="38" x2="68" y2="38" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        <Line x1="32" y1="46" x2="44" y2="46" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

        {/* Scanner Target Box / Camera Lens Housing */}
        <G>
          {/* Outer Lens Circle */}
          <Circle
            cx="50"
            cy="60"
            r="17"
            fill="#0F172A"
            stroke="url(#tealCyanGradient)"
            strokeWidth="2"
          />

          {/* Inner Camera Lens / Shutter Glass */}
          <Circle
            cx="50"
            cy="60"
            r="11"
            fill="#1E293B"
            stroke="#0EA5E9"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Lens Center Reflection Point */}
          <Circle
            cx="50"
            cy="60"
            r="4.5"
            fill="#14B8A6"
          />

          <Circle
            cx="48"
            cy="58"
            r="1.8"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </G>

        {/* Dynamic Horizontal Scanning Laser Beam */}
        <Line
          x1="18"
          y1="60"
          x2="82"
          y2="60"
          stroke="url(#laserBeamGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Corner Scan Brackets (Crosshair feel) */}
        <Path d="M 33 55 L 33 52 L 36 52" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M 64 52 L 67 52 L 67 55" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M 33 65 L 33 68 L 36 68" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M 64 68 L 67 68 L 67 65" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
