import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FileText, Check, X, ShieldAlert } from './Icons';
import { generateDefaultFilename, sanitizeFilename } from '../services/pdfService';
import { useAppTheme } from '../context/ThemeContext';
import { Spacing, Radius, Typography } from '../constants/theme';

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
      animationType="fade"
      onRequestClose={isLoading ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header Title with Document Pill */}
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? colors.surfaceSecondary : colors.accentSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <FileText color={colors.accent} size={20} />
                </View>
                <View style={styles.headerTextCol}>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Beri Nama Dokumen
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {pageCount} halaman siap dikompilasi
                  </Text>
                </View>
              </View>

              {/* Input Group */}
              <View style={styles.inputSection}>
                <View style={styles.inputLabelRow}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Nama Berkas
                  </Text>
                  <View
                    style={[
                      styles.extensionPill,
                      {
                        backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.extensionText, { color: colors.accent }]}>
                      .pdf
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
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

                {/* Sanitization feedback */}
                {hasIllegalCharNotice ? (
                  <View style={styles.noticeRow}>
                    <ShieldAlert color="#F59E0B" size={14} />
                    <Text style={styles.noticeText}>
                      {'Karakter tidak valid (/ \\ : * ? " < > |) otomatis dihapus.'}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.helperText, { color: colors.textMuted }]}>
                    Format default: Scan_YYYYMMDD_HHMMSS
                  </Text>
                )}
              </View>

              {/* Action Buttons Pairing */}
              <View style={styles.buttonRow}>
                {/* Ghost / Outline Button for Batal */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={onClose}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
                    Batal
                  </Text>
                </TouchableOpacity>

                {/* High Contrast Solid Button for Simpan & Ekspor */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.exportButton,
                    {
                      backgroundColor: colors.primaryCta,
                    },
                    (!fileName.trim() || isLoading) && styles.disabledButton,
                  ]}
                  onPress={handleExport}
                  disabled={!fileName.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.actionContent}>
                      <ActivityIndicator
                        color={colors.primaryCtaText}
                        size="small"
                      />
                      <Text
                        style={[
                          styles.exportButtonText,
                          { color: colors.primaryCtaText },
                        ]}
                      >
                        Memproses...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.actionContent}>
                      <Check color={colors.primaryCtaText} size={16} strokeWidth={2.5} />
                      <Text
                        style={[
                          styles.exportButtonText,
                          { color: colors.primaryCtaText },
                        ]}
                      >
                        Simpan & Ekspor
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/**
 * Handcrafted Custom File Naming Modal
 * Dialog style with strict 8pt grid, 1px subtle border, system typography,
 * high-contrast buttons, and live sanitization.
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
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
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  extensionPill: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  extensionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 6,
  },
  noticeText: {
    fontSize: 12,
    color: '#F59E0B',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {},
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.45,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
