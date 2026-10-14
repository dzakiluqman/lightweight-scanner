import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Rect,
  Path,
} from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Zap,
  ZapOff,
  Crop,
  Layers,
  Camera,
} from './Icons';
import { Spacing, Radius, Shadows, Typography } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Unified Camera & Scanner View Component
 * Matches the global Liquid Glass & Vibrant Gradient theme:
 * - Camera Utility Bar (Flash, Auto-crop toggle, Multi-page batch mode)
 * - Live Edge-Detection Overlay with cyan-to-indigo gradient highlight paths
 * - Floating Liquid Glass Orb Shutter Button with glowing gradient ring
 */
export default function CameraScannerOverlay({
  visible,
  onClose,
  onCapture,
  initialBatchMode = false,
}) {


  // Utility states
  const [flashMode, setFlashMode] = useState('auto'); // 'off' | 'auto' | 'on'
  const [autoCrop, setAutoCrop] = useState(true);
  const [isBatchMode, setIsBatchMode] = useState(initialBatchMode);
  const [isScanning, setIsScanning] = useState(false);

  // Animated laser scan sweep
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const scanLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      );
      scanLoop.start();
      return () => scanLoop.stop();
    }
  }, [visible, scanAnim]);

  const toggleFlash = () => {
    if (flashMode === 'auto') setFlashMode('on');
    else if (flashMode === 'on') setFlashMode('off');
    else setFlashMode('auto');
  };

  const handleTriggerCapture = async () => {
    setIsScanning(true);
    try {
      await onCapture({
        flashMode,
        autoCrop,
        isBatchMode,
      });
    } finally {
      setIsScanning(false);
    }
  };

  if (!visible) return null;

  // Viewfinder dimensions
  const frameWidth = Math.min(SCREEN_WIDTH - 48, 340);
  const frameHeight = Math.round(frameWidth * 1.38); // Standard A4 ratio ~1:1.41

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, frameHeight - 10],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Ambient Dark Camera Viewport Backdrop */}
        <View style={styles.cameraViewportBackground}>
          {/* Subtle Viewfinder Grid Texture */}
          <View style={styles.gridOverlay} />
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* ================= 1. CAMERA UTILITY BAR ================= */}
          <View style={styles.utilityBarWrapper}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.utilityGlassButton}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Tutup Pemindai"
            >
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
              <ArrowLeft color="#FFFFFF" size={18} strokeWidth={2.2} />
            </TouchableOpacity>

            {/* Frosted Glass Utility Pill */}
            <View style={styles.utilityPillBar}>
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

              {/* Flash Mode Toggle */}
              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  flashMode !== 'off' && styles.utilityItemActive,
                ]}
                onPress={toggleFlash}
                activeOpacity={0.7}
              >
                {flashMode === 'off' ? (
                  <ZapOff color="#94A3B8" size={17} />
                ) : (
                  <Zap color="#06B6D4" size={17} strokeWidth={2.5} />
                )}
                <Text
                  style={[
                    styles.utilityLabel,
                    { color: flashMode !== 'off' ? '#06B6D4' : '#94A3B8' },
                  ]}
                >
                  {flashMode === 'auto' ? 'Auto' : flashMode === 'on' ? 'Nyala' : 'Mati'}
                </Text>
              </TouchableOpacity>

              <View style={styles.utilityDivider} />

              {/* Auto-Crop Toggle */}
              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  autoCrop && styles.utilityItemActive,
                ]}
                onPress={() => setAutoCrop(!autoCrop)}
                activeOpacity={0.7}
              >
                <Crop color={autoCrop ? '#06B6D4' : '#94A3B8'} size={17} strokeWidth={2.2} />
                <Text
                  style={[
                    styles.utilityLabel,
                    { color: autoCrop ? '#06B6D4' : '#94A3B8' },
                  ]}
                >
                  {autoCrop ? 'Potong Otomatis' : 'Manual'}
                </Text>
              </TouchableOpacity>

              <View style={styles.utilityDivider} />

              {/* Multi-Page Batch Mode Toggle */}
              <TouchableOpacity
                style={[
                  styles.utilityItem,
                  isBatchMode && styles.utilityItemActive,
                ]}
                onPress={() => setIsBatchMode(!isBatchMode)}
                activeOpacity={0.7}
              >
                <Layers color={isBatchMode ? '#06B6D4' : '#94A3B8'} size={17} strokeWidth={2.2} />
                <Text
                  style={[
                    styles.utilityLabel,
                    { color: isBatchMode ? '#06B6D4' : '#94A3B8' },
                  ]}
                >
                  {isBatchMode ? 'Batch' : 'Tunggal'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 2. LIVE EDGE-DETECTION OVERLAY ================= */}
          <View style={styles.viewfinderContainer}>
            {/* Document Detection Status Pill */}
            <View style={styles.statusPill}>
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Dokumen Terdeteksi • Siap Pindai</Text>
            </View>

            {/* Precision Edge-Detection Framing Box */}
            <View
              style={[
                styles.frameBox,
                { width: frameWidth, height: frameHeight },
              ]}
            >
              {/* Cyan-to-Indigo Gradient Highlight Path SVG */}
              <Svg width={frameWidth} height={frameHeight} style={StyleSheet.absoluteFill}>
                <Defs>
                  <SvgGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
                    <Stop offset="50%" stopColor="#38BDF8" stopOpacity="0.9" />
                    <Stop offset="100%" stopColor="#6366F1" stopOpacity="1" />
                  </SvgGradient>
                  <SvgGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#06B6D4" stopOpacity="0.1" />
                    <Stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
                    <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
                  </SvgGradient>
                </Defs>

                {/* Dashed Detected Boundary Contour */}
                <Rect
                  x="4"
                  y="4"
                  width={frameWidth - 8}
                  height={frameHeight - 8}
                  rx="14"
                  fill="rgba(6, 182, 212, 0.04)"
                  stroke="url(#edgeGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="6, 5"
                />

                {/* Top-Left Precision Reticle Corner */}
                <Path
                  d="M 4 28 L 4 14 C 4 8.5 8.5 4 14 4 L 28 4"
                  stroke="#06B6D4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Top-Right Precision Reticle Corner */}
                <Path
                  d={`M ${frameWidth - 28} 4 L ${frameWidth - 14} 4 C ${frameWidth - 8.5} 4 ${frameWidth - 4} 8.5 ${frameWidth - 4} 14 L ${frameWidth - 4} 28`}
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Bottom-Left Precision Reticle Corner */}
                <Path
                  d={`M 4 ${frameHeight - 28} L 4 ${frameHeight - 14} C 4 ${frameHeight - 8.5} 8.5 ${frameHeight - 4} 14 ${frameHeight - 4} L 28 ${frameHeight - 4}`}
                  stroke="#6366F1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Bottom-Right Precision Reticle Corner */}
                <Path
                  d={`M ${frameWidth - 28} ${frameHeight - 4} L ${frameWidth - 14} ${frameHeight - 4} C ${frameWidth - 8.5} ${frameHeight - 4} ${frameWidth - 4} ${frameHeight - 8.5} ${frameWidth - 4} ${frameHeight - 14} L ${frameWidth - 4} ${frameHeight - 28}`}
                  stroke="#818CF8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>

              {/* Animated Cyan-to-Indigo Laser Scan Line */}
              <Animated.View
                style={[
                  styles.laserBeamContainer,
                  {
                    width: frameWidth - 16,
                    transform: [{ translateY }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['rgba(6, 182, 212, 0)', '#06B6D4', '#6366F1', 'rgba(99, 102, 241, 0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.laserBeam}
                />
              </Animated.View>
            </View>

            {/* Instruction Microcopy */}
            <Text style={styles.instructionText}>
              Posisikan dokumen dalam bingkai untuk deteksi otomatis
            </Text>
          </View>

          {/* ================= 3. CONTROLS OVERLAY ================= */}
          <View style={styles.controlsBottomArea}>
            <View style={styles.controlsRow}>
              {/* Left Action / Batch Indicator */}
              <View style={styles.sideControlBox}>
                <View style={styles.badgeIndicatorPill}>
                  <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                  <Text style={styles.badgeIndicatorText}>
                    {isBatchMode ? 'Mode Batch' : 'Mode 1 Hal'}
                  </Text>
                </View>
              </View>

              {/* Center Shutter Button: Floating Liquid Glass Orb with Glowing Gradient Ring */}
              <TouchableOpacity
                onPress={handleTriggerCapture}
                disabled={isScanning}
                activeOpacity={0.78}
                style={[styles.shutterButtonOuter, Shadows.glowCyan]}
                accessibilityLabel="Ambil Foto Dokumen"
              >
                {/* Glowing Multi-layered Gradient Ring Accent */}
                <LinearGradient
                  colors={['#06B6D4', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shutterGradientRing}
                >
                  {/* Floating Liquid Glass Orb Core */}
                  <View style={styles.shutterGlassOrb}>
                    <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={styles.shutterInnerDot} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Right Action / Auto-focus hint */}
              <View style={styles.sideControlBox}>
                <TouchableOpacity
                  style={styles.directScanButton}
                  onPress={handleTriggerCapture}
                  activeOpacity={0.7}
                >
                  <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                  <Camera color="#06B6D4" size={17} />
                  <Text style={styles.directScanText}>Pindai</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D17',
  },
  cameraViewportBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#090F1D',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  /* 1. Camera Utility Bar */
  utilityBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    zIndex: 10,
  },
  utilityGlassButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  utilityPillBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 42,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    paddingHorizontal: Spacing.xs,
  },
  utilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  utilityItemActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.14)',
  },
  utilityLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    fontFamily: Typography.fontFamily,
  },
  utilityDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  /* 2. Live Edge-Detection Overlay */
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
    letterSpacing: -0.1,
    fontFamily: Typography.fontFamily,
  },
  frameBox: {
    borderRadius: Radius.lg,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  laserBeamContainer: {
    position: 'absolute',
    top: 0,
    left: 8,
    height: 2,
  },
  laserBeam: {
    width: '100%',
    height: 2,
    borderRadius: 1,
  },
  instructionText: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginTop: Spacing.md,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
  /* 3. Controls Overlay */
  controlsBottomArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideControlBox: {
    width: 80,
    alignItems: 'center',
  },
  badgeIndicatorPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  badgeIndicatorText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
    fontFamily: Typography.fontFamily,
  },
  directScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  directScanText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#06B6D4',
    fontFamily: Typography.fontFamily,
  },
  shutterButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterGradientRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterGlassOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInnerDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
});
