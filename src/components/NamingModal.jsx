import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FileText, Check, X, ShieldAlert } from './Icons';
import { generateDefaultFilename, sanitizeFilename } from '../services/pdfService';
import { useAppTheme } from '../context/ThemeContext';
import { Spacing, Radius, Typography, Shadows } from '../constants/theme';
import GradientButton from './GradientButton';
import GlassButton from './GlassButton';

function NamingModalContent({
  visible,
  pageCount,
  isLoading,
  onClose,
  onConfirm,
}) {
  const { colors, isDark } = useAppTheme();
  const [fileName, setFileName] = useState(() => generateDefaultFilename());
  const [hasIllegalCharNotice, setHasIllegalCharNotice] = useState(false);

  const handleInputChange = (text) => {
    const illegalCharsRegex = /[/\\:*?"<>|]/g;
    if (illegalCharsRegex.test(text)) {
      setHasIllegalCharNotice(true);
      const clean = text.replace(illegalCharsRegex, '');
      setFileName(clean);
      setTimeout(() => setHasIllegalCharNotice(false), 2500);
    } else {
      setFileName(text);
      setHasIllegalCharNotice(false);
    }
  };

  const handleExport = () => {
    const finalCleanName = sanitizeFilename(fileName);
    onConfirm(finalCleanName);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={isLoading ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {/* Liquid Glass Overlay Blur */}
          <BlurView
            intensity={isDark ? 45 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.backdropDim,
              { backgroundColor: isDark ? 'rgba(7, 13, 23, 0.65)' : 'rgba(15, 23, 42, 0.35)' },
            ]}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            {/* Liquid Glass Bottom-Sheet Container */}
            <View
              style={[
                styles.bottomSheetCard,
                {
                  backgroundColor: colors.glassCardBg,
                  borderColor: colors.glassBorder,
                },
                Shadows.glass,
              ]}
            >
              {/* Card Blur Texture */}
              <BlurView
                intensity={isDark ? 35 : 55}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />

              {/* Sheet Drag Indicator Handle */}
              <View style={styles.dragHandleWrapper}>
                <View
                  style={[
                    styles.dragHandle,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.20)' },
                  ]}
                />
              </View>

              {/* Header Row: Document Vector Icon + Human Indonesian Copy */}
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.12)',
                      borderColor: 'rgba(6, 182, 212, 0.30)',
                    },
                  ]}
                >
                  <FileText color={colors.accent} size={22} strokeWidth={2} />
                </View>
                <View style={styles.headerTextCol}>
                  <Text
                    style={[
                      styles.title,
                      { color: colors.textPrimary, fontFamily: Typography.fontFamily },
                    ]}
                  >
                    Beri Nama Dokumen
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: colors.textSecondary, fontFamily: Typography.fontFamily },
                    ]}
                  >
                    {pageCount} halaman siap dikompilasi ke PDF
                  </Text>
                </View>
              </View>

              {/* High-Contrast Input Group */}
              <View style={styles.inputSection}>
                <View style={styles.inputLabelRow}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textSecondary, fontFamily: Typography.fontFamily },
                    ]}
                  >
                    Nama Berkas
                  </Text>
                  <View
                    style={[
                      styles.extensionPill,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
                        borderColor: colors.glassBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.extensionText,
                        { color: colors.accent, fontFamily: Typography.fontFamily },
                      ]}
                    >
                      .pdf
                    </Text>
                  </View>
                </View>

                {/* Glassmorphic Input Field */}
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.glassInputBg,
                      borderColor: colors.borderHighlight,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: colors.textPrimary,
                        fontFamily: Typography.fontFamily,
                      },
                    ]}
                    value={fileName}
                    onChangeText={handleInputChange}
                    placeholder="Nama dokumen..."
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectTextOnFocus
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleExport}
                  />
                  {fileName.length > 0 && !isLoading && (
                    <TouchableOpacity
                      onPress={() => setFileName('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.6}
                      style={styles.clearBtn}
                    >
                      <X color={colors.textMuted} size={16} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Live Sanitization feedback */}
                {hasIllegalCharNotice ? (
                  <View style={styles.noticeRow}>
                    <ShieldAlert color="#F59E0B" size={14} />
                    <Text style={styles.noticeText}>
                      {'Karakter tidak valid (/ \\ : * ? " < > |) otomatis dihapus.'}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.helperText, { color: colors.textMuted }]}>
                    Format otomatis: Scan_YYYYMMDD_HHMMSS
                  </Text>
                )}
              </View>

              {/* Action Pairings: Ghost Glass Button (Batal) + Solid Vibrant Gradient Button (Simpan & Ekspor) */}
              <View style={styles.buttonRow}>
                {/* Ghost Glass Button for Batal */}
                <GlassButton
                  title="Batal"
                  onPress={onClose}
                  disabled={isLoading}
                  style={styles.cancelButton}
                  textStyle={styles.cancelText}
                />

                {/* Solid Vibrant Gradient Button for Simpan & Ekspor */}
                <GradientButton
                  title="Simpan & Ekspor"
                  icon={<Check color="#FFFFFF" size={17} strokeWidth={2.5} />}
                  onPress={handleExport}
                  disabled={!fileName.trim() || isLoading}
                  loading={isLoading}
                  style={styles.exportButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/**
 * Handcrafted Liquid Glass Bottom-Sheet File Naming & Export Dialog
 */
export default function NamingModal({
  visible,
  pageCount = 1,
  isLoading = false,
  onClose,
  onConfirm,
}) {
  if (!visible) return null;

  return (
    <NamingModalContent
      visible={visible}
      pageCount={pageCount}
      isLoading={isLoading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    width: '100%',
    maxWidth: 480,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl + 12 : Spacing.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  extensionPill: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  extensionText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  helperText: {
    fontSize: 11.5,
    marginTop: Spacing.xs,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 6,
  },
  noticeText: {
    fontSize: 11.5,
    color: '#F59E0B',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: Radius.lg,
  },
  cancelText: {
    fontWeight: '600',
  },
  exportButton: {
    flex: 1.5,
    height: 46,
    borderRadius: Radius.lg,
  },
});
