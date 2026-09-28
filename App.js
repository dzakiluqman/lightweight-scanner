import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ScrollView,
  ToastAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  Camera,
  ArrowLeft,
  Trash2,
  RotateCcw,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileOutput,
  Share2,
  DownloadCloud,
  Check,
  Sun,
  Moon,
  HardDrive,
} from './src/components/Icons';

import Logo from './src/components/Logo';
import NamingModal from './src/components/NamingModal';
import HistoryList from './src/components/HistoryList';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { Spacing, Radius } from './src/constants/theme';
import {
  scanDocumentWithCamera,
  compileImagesToPdf,
  getScanHistory,
  deleteScanRecord,
  sharePdfFile,
  exportToExternalStorage,
  formatBytes,
} from './src/services/pdfService';

function MainScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();

  // App views: 'DASHBOARD' | 'PREVIEW'
  const [currentView, setCurrentView] = useState('DASHBOARD');

  // Scanned pages state
  const [scannedImages, setScannedImages] = useState([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  // History & loading state
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export & modal state
  const [namingModalVisible, setNamingModalVisible] = useState(false);
  const [successExportData, setSuccessExportData] = useState(null);

  const loadHistory = useCallback(async () => {
    setRefreshing(true);
    try {
      const records = await getScanHistory();
      setHistory(records);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    let isMounted = true;
    getScanHistory()
      .then((records) => {
        if (isMounted) {
          setHistory(records);
        }
      })
      .catch((err) => {
        console.error('Failed to load history on mount:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalBytes = useMemo(() => {
    return history.reduce((sum, item) => sum + (item.bytes || 0), 0);
  }, [history]);

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  /**
   * Trigger native camera document scanner
   */
  const handleStartScan = async (append = false) => {
    try {
      const result = await scanDocumentWithCamera({
        croppedImageQuality: 90,
      });

      if (!result.cancelled && result.images.length > 0) {
        if (append) {
          setScannedImages((prev) => [...prev, ...result.images]);
          showToast(`Berhasil menambah ${result.images.length} halaman.`);
        } else {
          setScannedImages(result.images);
          setSelectedPageIndex(0);
          setCurrentView('PREVIEW');
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert(
        'Gagal Memindai',
        'Tidak dapat mengakses kamera pemindai. Pastikan izin kamera telah diberikan di pengaturan sistem.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Rescan currently selected page
   */
  const handleRescanCurrentPage = async () => {
    try {
      const result = await scanDocumentWithCamera({
        croppedImageQuality: 90,
        maxNumDocuments: 1,
      });

      if (!result.cancelled && result.images.length > 0) {
        const replacement = result.images[0];
        setScannedImages((prev) => {
          const updated = [...prev];
          updated[selectedPageIndex] = replacement;
          return updated;
        });
        showToast('Halaman berhasil dipindai ulang.');
      }
    } catch (error) {
      console.error('Rescan failed:', error);
      Alert.alert('Pindai Ulang Gagal', 'Gagal memperbarui halaman.');
    }
  };

  /**
   * Delete current page
   */
  const handleDeleteCurrentPage = () => {
    if (scannedImages.length <= 1) {
      Alert.alert(
        'Batalkan Sesi?',
        'Menghapus satu-satunya halaman akan mengakhiri sesi pindaian ini.',
        [
          { text: 'Kembali', style: 'cancel' },
          {
            text: 'Batalkan',
            style: 'destructive',
            onPress: () => {
              setScannedImages([]);
              setCurrentView('DASHBOARD');
            },
          },
        ]
      );
      return;
    }

    const nextImages = scannedImages.filter((_, idx) => idx !== selectedPageIndex);
    setScannedImages(nextImages);
    if (selectedPageIndex >= nextImages.length) {
      setSelectedPageIndex(nextImages.length - 1);
    }
    showToast('Halaman dihapus.');
  };

  /**
   * Reorder pages: move left or right
   */
  const handleMovePage = (direction) => {
    const targetIndex = selectedPageIndex + direction;
    if (targetIndex < 0 || targetIndex >= scannedImages.length) return;

    setScannedImages((prev) => {
      const next = [...prev];
      const temp = next[selectedPageIndex];
      next[selectedPageIndex] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    setSelectedPageIndex(targetIndex);
  };

  /**
   * Open Naming Modal to begin export
   */
  const handlePromptExport = () => {
    if (scannedImages.length === 0) {
      Alert.alert('Perhatian', 'Tidak ada halaman untuk diekspor.');
      return;
    }
    setNamingModalVisible(true);
  };

  /**
   * Process PDF compilation and save
   */
  const handleExecuteExport = async (finalFileName) => {
    setIsExporting(true);
    try {
      const result = await compileImagesToPdf(scannedImages, finalFileName);
      setNamingModalVisible(false);
      setSuccessExportData(result);
      await loadHistory();
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Ekspor Gagal',
        error.message || 'Terjadi kesalahan saat mengonversi dokumen ke PDF.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleFinishSuccess = () => {
    setSuccessExportData(null);
    setScannedImages([]);
    setCurrentView('DASHBOARD');
  };

  const handleSharePdf = async (item) => {
    try {
      await sharePdfFile(item.uri, item.fileName);
    } catch (error) {
      Alert.alert('Gagal Membagikan', error.message || 'Tidak dapat membagikan berkas.');
    }
  };

  const handleSaveToDownloads = async (item) => {
    try {
      const res = await exportToExternalStorage(item.uri, item.fileName);
      if (res && res.message) {
        showToast(res.message);
      }
    } catch (error) {
      Alert.alert('Gagal Menyimpan', error.message || 'Tidak dapat menyimpan berkas.');
    }
  };

  const handleDeleteHistoryItem = async (item) => {
    try {
      const updated = await deleteScanRecord(item.id, item.uri);
      setHistory(updated);
      showToast(`"${item.fileName}" dihapus.`);
    } catch (_error) {
      Alert.alert('Gagal Menghapus', 'Tidak dapat menghapus dokumen.');
    }
  };

  // Header and Dashboard Elements rendered above the history list
  const renderDashboardHero = () => (
    <View style={styles.dashboardHeroSection}>
      {/* Storage Utility Strip */}
      <View
        style={[
          styles.storageStrip,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.storageLeft}>
          <HardDrive color={colors.accent} size={15} />
          <Text style={[styles.storageText, { color: colors.textSecondary }]}>
            Penyimpanan Lokal
          </Text>
        </View>
        <Text style={[styles.storageStats, { color: colors.textPrimary }]}>
          {history.length} Dokumen • {formatBytes(totalBytes)}
        </Text>
      </View>

      {/* Hero Action Section */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroTextWrapper}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
            Pindai Dokumen Fisik
          </Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
            Kamera beresolusi tinggi dengan deteksi sudut otomatis dan konversi PDF instan.
          </Text>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={[
            styles.heroScanButton,
            {
              backgroundColor: colors.primaryCta,
            },
          ]}
          onPress={() => handleStartScan(false)}
          activeOpacity={0.8}
        >
          <Camera color={colors.primaryCtaText} size={18} strokeWidth={2.25} />
          <Text style={[styles.heroScanButtonText, { color: colors.primaryCtaText }]}>
            Mulai Pindai
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.statusBarBg}
      />

      {/* ==================== DASHBOARD VIEW ==================== */}
      {currentView === 'DASHBOARD' && (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Top Compact Header */}
          <View
            style={[
              styles.topNavbar,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.navBrand}>
              <Logo size={28} />
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                Lightweight Scanner
              </Text>
              <View
                style={[
                  styles.docCounterPill,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.docCounterText, { color: colors.textSecondary }]}>
                  {history.length} PDF
                </Text>
              </View>
            </View>

            {/* Header Right Actions */}
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={[
                  styles.iconNavButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={toggleTheme}
                activeOpacity={0.7}
                accessibilityLabel="Ganti Tema"
              >
                {isDark ? (
                  <Sun color={colors.accent} size={16} strokeWidth={2} />
                ) : (
                  <Moon color={colors.textPrimary} size={16} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Document History & Dashboard Content */}
          <HistoryList
            history={history}
            refreshing={refreshing}
            onRefresh={loadHistory}
            onOpenPdf={handleSharePdf}
            onSharePdf={handleSharePdf}
            onSaveToDownloads={handleSaveToDownloads}
            onDeletePdf={handleDeleteHistoryItem}
            onStartScan={() => handleStartScan(false)}
            headerComponent={renderDashboardHero()}
          />
        </View>
      )}

      {/* ==================== INTERACTIVE PREVIEW SCREEN ==================== */}
      {currentView === 'PREVIEW' && (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Preview Top Navbar */}
          <View
            style={[
              styles.previewNavbar,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.navBackBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                Alert.alert(
                  'Tutup Pratinjau?',
                  'Pindaian yang belum diekspor akan dibatalkan.',
                  [
                    { text: 'Lanjut Mengedit', style: 'cancel' },
                    {
                      text: 'Tutup',
                      style: 'destructive',
                      onPress: () => {
                        setScannedImages([]);
                        setCurrentView('DASHBOARD');
                      },
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <ArrowLeft color={colors.textPrimary} size={18} />
            </TouchableOpacity>

            <View style={styles.previewNavCenter}>
              <Text style={[styles.previewNavTitle, { color: colors.textPrimary }]}>
                Pratinjau Pindaian
              </Text>
              <Text style={[styles.previewNavSubtitle, { color: colors.textSecondary }]}>
                Halaman {selectedPageIndex + 1} dari {scannedImages.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addPageNavBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleStartScan(true)}
              activeOpacity={0.7}
            >
              <Plus color={colors.accent} size={16} strokeWidth={2.5} />
              <Text style={[styles.addPageNavText, { color: colors.textPrimary }]}>
                Tambah
              </Text>
            </TouchableOpacity>
          </View>

          {/* Center Page Preview - Edge-to-Edge Clean Presentation */}
          <View style={styles.mainPreviewArea}>
            {scannedImages[selectedPageIndex] ? (
              <View
                style={[
                  styles.previewImageCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Image
                  source={{ uri: scannedImages[selectedPageIndex] }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />

                {/* Explicit Page Index Pill */}
                <View
                  style={[
                    styles.previewPageTag,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.previewPageTagText, { color: colors.textPrimary }]}>
                    Hal {selectedPageIndex + 1} dari {scannedImages.length}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Contextual Action Bar: Quick icon buttons for Reorder, Rescan, Delete */}
          <View
            style={[
              styles.contextualActionBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.contextActionBtn,
                selectedPageIndex === 0 && styles.disabledContextBtn,
              ]}
              onPress={() => handleMovePage(-1)}
              disabled={selectedPageIndex === 0}
              activeOpacity={0.7}
            >
              <ChevronLeft
                color={selectedPageIndex === 0 ? colors.textMuted : colors.textPrimary}
                size={16}
              />
              <Text
                style={[
                  styles.contextActionText,
                  {
                    color: selectedPageIndex === 0 ? colors.textMuted : colors.textPrimary,
                  },
                ]}
              >
                Kiri
              </Text>
            </TouchableOpacity>

            <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.contextActionBtn}
              onPress={handleRescanCurrentPage}
              activeOpacity={0.7}
            >
              <RotateCcw color={colors.accent} size={16} />
              <Text style={[styles.contextActionText, { color: colors.textPrimary }]}>
                Pindai Ulang
              </Text>
            </TouchableOpacity>

            <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.contextActionBtn}
              onPress={() => handleStartScan(true)}
              activeOpacity={0.7}
            >
              <Plus color={colors.accent} size={16} />
              <Text style={[styles.contextActionText, { color: colors.textPrimary }]}>
                Tambah Hal
              </Text>
            </TouchableOpacity>

            <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.contextActionBtn}
              onPress={handleDeleteCurrentPage}
              activeOpacity={0.7}
            >
              <Trash2 color={colors.danger} size={16} />
              <Text style={[styles.contextActionText, { color: colors.danger }]}>
                Hapus
              </Text>
            </TouchableOpacity>

            <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[
                styles.contextActionBtn,
                selectedPageIndex === scannedImages.length - 1 && styles.disabledContextBtn,
              ]}
              onPress={() => handleMovePage(1)}
              disabled={selectedPageIndex === scannedImages.length - 1}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.contextActionText,
                  {
                    color:
                      selectedPageIndex === scannedImages.length - 1
                        ? colors.textMuted
                        : colors.textPrimary,
                  },
                ]}
              >
                Kanan
              </Text>
              <ChevronRight
                color={
                  selectedPageIndex === scannedImages.length - 1
                    ? colors.textMuted
                    : colors.textPrimary
                }
                size={16}
              />
            </TouchableOpacity>
          </View>

          {/* Clean Horizontal Thumbnail Carousel */}
          <View
            style={[
              styles.thumbnailCarouselContainer,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScrollContent}
            >
              {scannedImages.map((uri, index) => {
                const isSelected = index === selectedPageIndex;
                return (
                  <TouchableOpacity
                    key={`${uri}_${index}`}
                    style={[
                      styles.thumbnailCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedPageIndex(index)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri }} style={styles.thumbnailImage} />
                    <View
                      style={[
                        styles.thumbnailPill,
                        {
                          backgroundColor: isSelected ? colors.accent : colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.thumbnailPillText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.addThumbnailCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleStartScan(true)}
                activeOpacity={0.7}
              >
                <Plus color={colors.accent} size={18} strokeWidth={2} />
                <Text style={[styles.addThumbnailText, { color: colors.textSecondary }]}>
                  Tambah
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* High-Contrast Bottom Export Bar */}
          <View
            style={[
              styles.bottomExportBar,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.exportButton,
                {
                  backgroundColor: colors.primaryCta,
                },
              ]}
              onPress={handlePromptExport}
              activeOpacity={0.8}
            >
              <FileOutput color={colors.primaryCtaText} size={17} strokeWidth={2.25} />
              <Text
                style={[
                  styles.exportButtonText,
                  { color: colors.primaryCtaText },
                ]}
              >
                Ekspor ke PDF ({scannedImages.length} Halaman)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ==================== CUSTOM NAMING MODAL ==================== */}
      <NamingModal
        visible={namingModalVisible}
        pageCount={scannedImages.length}
        isLoading={isExporting}
        onClose={() => setNamingModalVisible(false)}
        onConfirm={handleExecuteExport}
      />

      {/* ==================== SUCCESS STATE MODAL ==================== */}
      {successExportData && (
        <View style={[styles.successOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.successCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.successIconCircle,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : colors.successBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Check color={colors.success} size={28} strokeWidth={3} />
            </View>

            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
              PDF Berhasil Dibuat
            </Text>
            <Text
              style={[styles.successFilename, { color: colors.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {successExportData.fileName}
            </Text>

            {/* Document Stats Strip */}
            <View
              style={[
                styles.successStatsRow,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.successStatText, { color: colors.textPrimary }]}>
                {successExportData.pages} Halaman • {successExportData.size}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.successActions}>
              <TouchableOpacity
                style={[
                  styles.successActionBtn,
                  {
                    backgroundColor: colors.primaryCta,
                  },
                ]}
                onPress={() => handleSharePdf(successExportData)}
                activeOpacity={0.8}
              >
                <Share2 color={colors.primaryCtaText} size={16} />
                <Text
                  style={[
                    styles.successActionBtnText,
                    { color: colors.primaryCtaText },
                  ]}
                >
                  Bagikan PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.successSecondaryBtn,
                  {
                    backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSaveToDownloads(successExportData)}
                activeOpacity={0.8}
              >
                <DownloadCloud color={colors.textPrimary} size={16} />
                <Text
                  style={[
                    styles.successSecondaryBtnText,
                    { color: colors.textPrimary },
                  ]}
                >
                  Simpan ke Downloads
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.successDoneBtn}
                onPress={handleFinishSuccess}
                activeOpacity={0.7}
              >
                <Text style={[styles.successDoneText, { color: colors.textSecondary }]}>
                  Selesai
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainScreen />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  /* Top Compact Header */
  topNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  docCounterPill: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  docCounterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconNavButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Dashboard Hero & Storage Strip */
  dashboardHeroSection: {
    paddingTop: Spacing.xs,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  storageStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  storageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  storageStats: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  heroTextWrapper: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.sm,
    gap: Spacing.xs,
  },
  heroScanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  /* Preview Top Navbar */
  previewNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  navBackBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewNavCenter: {
    alignItems: 'center',
  },
  previewNavTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  previewNavSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  addPageNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  addPageNavText: {
    fontSize: 13,
    fontWeight: '600',
  },
  /* Main Preview Area */
  mainPreviewArea: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImageCard: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '96%',
    height: '96%',
  },
  previewPageTag: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  previewPageTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  /* Contextual Action Bar */
  contextualActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  contextActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  disabledContextBtn: {
    opacity: 0.4,
  },
  contextActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contextDivider: {
    width: 1,
    height: 18,
  },
  /* Thumbnail Carousel */
  thumbnailCarouselContainer: {
    paddingVertical: Spacing.xs + 2,
    borderTopWidth: 1,
  },
  thumbnailScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  thumbnailCard: {
    width: 54,
    height: 72,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPill: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 0.5,
  },
  thumbnailPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  addThumbnailCard: {
    width: 54,
    height: 72,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  addThumbnailText: {
    fontSize: 10,
    fontWeight: '600',
  },
  /* Bottom Export Bar */
  bottomExportBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: Radius.sm,
    gap: Spacing.xs,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  /* Success Overlay & Card */
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  successCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  successFilename: {
    fontSize: 13,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    maxWidth: 260,
  },
  successStatsRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  successStatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  successActions: {
    width: '100%',
    gap: Spacing.xs,
  },
  successActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.sm,
    gap: Spacing.xs,
  },
  successActionBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  successSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  successSecondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  successDoneBtn: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  successDoneText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
