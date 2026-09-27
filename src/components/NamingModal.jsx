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
import { FileText, CheckCircle2, XCircle, FileOutput, ShieldAlert } from 'lucide-react-native';
import { generateDefaultFilename, sanitizeFilename } from '../services/pdfService';

/**
 * Inner modal content that mounts fresh whenever the modal becomes visible
 */
function NamingModalContent({
  visible,
  pageCount,
  isLoading,
  onClose,
  onConfirm,
}) {
  const [fileName, setFileName] = useState(() => generateDefaultFilename());
  const [hasIllegalCharNotice, setHasIllegalCharNotice] = useState(false);

  // Handle live input typing with auto-sanitization
  const handleInputChange = (text) => {
    const illegalCharsRegex = /[/\\:*?"<>|]/g;
    if (illegalCharsRegex.test(text)) {
      setHasIllegalCharNotice(true);
      // Automatically strip illegal characters
      const clean = text.replace(illegalCharsRegex, '');
      setFileName(clean);
      // Hide warning after 2.5s
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
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <View style={styles.modalCard}>
              {/* Decorative Glow Header */}
              <View style={styles.headerIconContainer}>
                <View style={styles.iconCircle}>
                  <FileOutput color="#14B8A6" size={28} />
                </View>
              </View>

              {/* Title & Info */}
              <Text style={styles.title}>Beri Nama Dokumen</Text>
              <Text style={styles.subtitle}>
                PDF siap diekspor dari{' '}
                <Text style={styles.highlightText}>{pageCount} halaman</Text> hasil pindaian.
              </Text>

              {/* Input Group */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputLabelRow}>
                  <Text style={styles.inputLabel}>Nama Berkas</Text>
                  <Text style={styles.extensionLabel}>.pdf</Text>
                </View>

                <View style={styles.inputContainer}>
                  <FileText color="#94A3B8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={fileName}
                    onChangeText={handleInputChange}
                    placeholder="Contoh: Dokumen_Penting"
                    placeholderTextColor="#64748B"
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectTextOnFocus
                    editable={!isLoading}
                  />
                  {fileName.length > 0 && !isLoading && (
                    <TouchableOpacity
                      onPress={() => setFileName('')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <XCircle color="#64748B" size={18} />
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
                  <Text style={styles.helperText}>
                    Tersimpan di penyimpanan lokal perangkat.
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.exportButton,
                    (!fileName.trim() || isLoading) && styles.disabledButton,
                  ]}
                  onPress={handleExport}
                  disabled={!fileName.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.exportButtonText}>Memproses...</Text>
                    </View>
                  ) : (
                    <View style={styles.loadingRow}>
                      <CheckCircle2 color="#FFFFFF" size={18} />
                      <Text style={styles.exportButtonText}>Simpan & Ekspor</Text>
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
 * Modern Glassmorphism / Slate Styled PDF Naming Modal
 * Provides preset Scan_YYYYMMDD_HHMMSS naming, live auto-sanitizing,
 * and sleek Teal/Slate action buttons.
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  highlightText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  extensionLabel: {
    fontSize: 13,
    color: '#14B8A6',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 0,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  noticeText: {
    fontSize: 12,
    color: '#F59E0B',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelButtonText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
