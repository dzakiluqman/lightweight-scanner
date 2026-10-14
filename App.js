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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
import CameraScannerOverlay from './src/components/CameraScannerOverlay';
import GradientButton from './src/components/GradientButton';
import GlassButton from './src/components/GlassButton';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { Spacing, Radius, Shadows, Typography } from './src/constants/theme';
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

  // Unified camera scanner overlay
  const [scannerOverlayVisible, setScannerOverlayVisible] = useState(false);
  const [scannerAppendMode, setScannerAppendMode] = useState(false);

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
    } catch (_err) {
      // Handled silently
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
      .catch((_err) => {
        // Handled silently
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
   * Open Unified Camera Scanner View
   */
  const handleOpenScanner = (append = false) => {
    setScannerAppendMode(append);
    setScannerOverlayVisible(true);
  };

  /**
   * Execute document scan with camera
   */
  const handleExecuteScannerCapture = async (options = {}) => {
    setScannerOverlayVisible(false);
    try {
      const result = await scanDocumentWithCamera({
        croppedImageQuality: 92,
        maxNumDocuments: options.isBatchMode ? undefined : 1,
      });

      if (!result.cancelled && result.images && result.images.length > 0) {
        if (scannerAppendMode) {
          setScannedImages((prev) => [...prev, ...result.images]);
          showToast(`Berhasil menambah ${result.images.length} halaman.`);
        } else {
          setScannedImages(result.images);
          setSelectedPageIndex(0);
          setCurrentView('PREVIEW');
        }
      }
    } catch (_error) {
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
        croppedImageQuality: 92,
        maxNumDocuments: 1,
      });

      if (!result.cancelled && result.images && result.images.length > 0) {
        const replacement = result.images[0];
        setScannedImages((prev) => {
          const updated = [...prev];
          updated[selectedPageIndex] = replacement;
          return updated;
        });
        showToast('Halaman berhasil dipindai ulang.');
      }
    } catch (_error) {
      Alert.alert('Pindai Ulang Gagal', 'Gagal memperbarui halaman dokumen.');
    }
  };

  /**
   * Delete current page
   */
  const handleDeleteCurrentPage = () => {
    if (scannedImages.length <= 1) {
      Alert.alert(
        'Batalkan Sesi?',
        'Menghapus satu-satunya halaman akan membatalkan sesi pindaian ini.',
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
    showToast('Halaman berhasil dihapus.');
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

  // Dashboard Header Hero Section: Liquid Glass Card + Electric Cyan to Royal Indigo Gradient CTA
  const renderDashboardHero = () => (
    <View style={styles.dashboardHeroSection}>
      {/* Prominent Liquid Glass Primary Hero Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.glassCardBg,
            borderColor: colors.glassCardBorder,
          },
          Shadows.glass,
        ]}
      >
        <BlurView
          intensity={isDark ? 30 : 50}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroTextWrapper}>
          <Text
            style={[
              styles.heroTitle,
              { color: colors.textPrimary, fontFamily: Typography.fontFamily },
            ]}
          >
            Pindai Dokumen Kualitas Tinggi
          </Text>
          <Text
            style={[
              styles.heroDescription,
              { color: colors.textSecondary, fontFamily: Typography.fontFamily },
            ]}
          >
            Deteksi sudut otomatis, filter kontras presisi, dan konversi PDF instan beresolusi tinggi.
          </Text>
        </View>

        {/* Multi-layered Vibrant Gradient CTA Button */}
        <GradientButton
          title="Mulai Pindai"
          icon={<Camera color="#FFFFFF" size={19} strokeWidth={2.3} />}
          onPress={() => handleOpenScanner(false)}
          size="lg"
          style={styles.heroScanButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.statusBarBg}
      />

      {/* ==================== DASHBOARD VIEW ==================== */}
      {currentView === 'DASHBOARD' && (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Top Compact Liquid Glass Header */}
          <View
            style={[
              styles.topNavbar,
              {
                backgroundColor: colors.glassCardBg,
                borderBottomColor: colors.glassBorder,
              },
            ]}
          >
            <BlurView
              intensity={isDark ? 25 : 45}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.navBrand}>
              <Logo size={30} />
              <Text
                style={[
                  styles.brandTitle,
                  { color: colors.textPrimary, fontFamily: Typography.fontFamily },
                ]}
              >
                Lightweight Scanner
              </Text>
            </View>

            {/* Header Right Actions: Storage Pill & Theme Toggle */}
            <View style={styles.headerRightActions}>
              {/* Local Storage Pill */}
              <View
                style={[
                  styles.storagePill,
                  {
                    backgroundColor: colors.glassPillBg,
                    borderColor: colors.glassPillBorder,
                  },
                ]}
              >
                <HardDrive color={colors.accent} size={13} strokeWidth={2.2} />
                <Text
                  style={[
                    styles.storagePillText,
                    { color: colors.textSecondary, fontFamily: Typography.fontFamily },
                  ]}
                >
                  {history.length} PDF • {formatBytes(totalBytes)}
                </Text>
              </View>

              {/* Theme Toggle Button */}
              <TouchableOpacity
                style={[
                  styles.iconNavButton,
                  {
                    backgroundColor: colors.glassBg,
                    borderColor: colors.glassBorder,
                  },
                ]}
                onPress={toggleTheme}
                activeOpacity={0.7}
                accessibilityLabel="Ganti Tema"
              >
                {isDark ? (
                  <Sun color={colors.accent} size={16} strokeWidth={2.2} />
                ) : (
                  <Moon color={colors.textPrimary} size={16} strokeWidth={2.2} />
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
            onStartScan={() => handleOpenScanner(false)}
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
                backgroundColor: colors.glassCardBg,
                borderBottomColor: colors.glassBorder,
              },
            ]}
          >
            <BlurView
              intensity={isDark ? 25 : 45}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

            <TouchableOpacity
              style={[
                styles.navBackBtn,
                {
                  backgroundColor: colors.glassBg,
                  borderColor: colors.glassBorder,
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
              <ArrowLeft color={colors.textPrimary} size={18} strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.previewNavCenter}>
              <Text
                style={[
                  styles.previewNavTitle,
                  { color: colors.textPrimary, fontFamily: Typography.fontFamily },
                ]}
              >
                Pratinjau Pindaian
              </Text>
              <Text
                style={[
                  styles.previewNavSubtitle,
                  { color: colors.textSecondary, fontFamily: Typography.fontFamily },
                ]}
              >
                Halaman {selectedPageIndex + 1} dari {scannedImages.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addPageNavBtn,
                {
                  backgroundColor: isDark ? 'rgba(6, 182, 212, 0.14)' : 'rgba(6, 182, 212, 0.12)',
                  borderColor: 'rgba(6, 182, 212, 0.30)',
                },
              ]}
              onPress={() => handleOpenScanner(true)}
              activeOpacity={0.7}
            >
              <Plus color={colors.accent} size={16} strokeWidth={2.5} />
              <Text
                style={[
                  styles.addPageNavText,
                  { color: colors.accent, fontFamily: Typography.fontFamily },
                ]}
              >
                Tambah
              </Text>
            </TouchableOpacity>
          </View>

          {/* Center Page Preview - Clean Liquid Glass Presentation */}
          <View style={styles.mainPreviewArea}>
            {scannedImages[selectedPageIndex] ? (
              <View
                style={[
                  styles.previewImageCard,
                  {
                    backgroundColor: colors.glassCardBg,
                    borderColor: colors.glassCardBorder,
                  },
                  Shadows.glass,
                ]}
              >
                <BlurView
                  intensity={isDark ? 20 : 40}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />

                <Image
                  source={{ uri: scannedImages[selectedPageIndex] }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />

                {/* Explicit Page Index Glass Pill */}
                <View
                  style={[
                    styles.previewPageTag,
                    {
                      backgroundColor: colors.glassPillBg,
                      borderColor: colors.glassPillBorder,
                    },
                  ]}
                >
                  <BlurView
                    intensity={25}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text
                    style={[
                      styles.previewPageTagText,
                      { color: colors.textPrimary, fontFamily: Typography.fontFamily },
                    ]}
                  >
                    Halaman {selectedPageIndex + 1} dari {scannedImages.length}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Contextual Action Bar: Reorder, Rescan, Add Page, Delete */}
          <View
            style={[
              styles.contextualActionBar,
              {
                backgroundColor: colors.glassCardBg,
                borderColor: colors.glassCardBorder,
              },
              Shadows.glass,
            ]}
          >
            <BlurView
              intensity={isDark ? 25 : 45}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

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
                    fontFamily: Typography.fontFamily,
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
              <RotateCcw color={colors.accent} size={16} strokeWidth={2.2} />
              <Text
                style={[
                  styles.contextActionText,
                  { color: colors.textPrimary, fontFamily: Typography.fontFamily },
                ]}
              >
                Pindai Ulang
              </Text>
            </TouchableOpacity>

            <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.contextActionBtn}
              onPress={() => handleOpenScanner(true)}
              activeOpacity={0.7}
            >
              <Plus color={colors.accent} size={16} strokeWidth={2.5} />
              <Text
                style={[
                  styles.contextActionText,
                  { color: colors.textPrimary, fontFamily: Typography.fontFamily },
                ]}
              >
                Tambah
              </Text>
            </TouchableOpacity>

            <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.contextActionBtn}
              onPress={handleDeleteCurrentPage}
              activeOpacity={0.7}
            >
              <Trash2 color={colors.danger} size={16} strokeWidth={2} />
              <Text
                style={[
                  styles.contextActionText,
                  { color: colors.danger, fontFamily: Typography.fontFamily },
                ]}
              >
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
                    fontFamily: Typography.fontFamily,
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
                backgroundColor: colors.glassCardBg,
                borderTopColor: colors.glassBorder,
              },
            ]}
          >
            <BlurView
              intensity={isDark ? 20 : 35}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

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
                        backgroundColor: colors.glassBg,
                        borderColor: isSelected ? colors.accent : colors.glassBorder,
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
                          backgroundColor: isSelected ? colors.accent : 'rgba(15, 23, 42, 0.7)',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.thumbnailPillText,
                          {
                            color: '#FFFFFF',
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
                    backgroundColor: colors.glassBg,
                    borderColor: colors.glassBorder,
                  },
                ]}
                onPress={() => handleOpenScanner(true)}
                activeOpacity={0.7}
              >
                <Plus color={colors.accent} size={18} strokeWidth={2.2} />
                <Text
                  style={[
                    styles.addThumbnailText,
                    { color: colors.textSecondary, fontFamily: Typography.fontFamily },
                  ]}
                >
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
                backgroundColor: colors.glassCardBg,
                borderTopColor: colors.glassBorder,
              },
            ]}
          >
            <BlurView
              intensity={isDark ? 30 : 50}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

            <GradientButton
              title={`Ekspor ke PDF (${scannedImages.length} Halaman)`}
              icon={<FileOutput color="#FFFFFF" size={18} strokeWidth={2.3} />}
              onPress={handlePromptExport}
              size="lg"
              style={styles.exportGradientBtn}
            />
          </View>
        </View>
      )}

      {/* ==================== UNIFIED CAMERA & SCANNER OVERLAY ==================== */}
      <CameraScannerOverlay
        visible={scannerOverlayVisible}
        onClose={() => setScannerOverlayVisible(false)}
        onCapture={handleExecuteScannerCapture}
        initialBatchMode={scannerAppendMode}
      />

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
        <View style={styles.successOverlay}>
          <BlurView
            intensity={isDark ? 45 : 30}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.backdropDim,
              { backgroundColor: isDark ? 'rgba(7, 13, 23, 0.70)' : 'rgba(15, 23, 42, 0.40)' },
            ]}
          />

          <View
            style={[
              styles.successCard,
              {
                backgroundColor: colors.glassCardBg,
                borderColor: colors.glassCardBorder,
              },
              Shadows.glass,
            ]}
          >
            <BlurView
              intensity={isDark ? 35 : 55}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

            {/* Glowing Gradient Check Badge */}
            <LinearGradient
              colors={['#06B6D4', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.successIconCircle, Shadows.glowCyan]}
            >
              <Check color="#FFFFFF" size={28} strokeWidth={3} />
            </LinearGradient>

            <Text
              style={[
                styles.successTitle,
                { color: colors.textPrimary, fontFamily: Typography.fontFamily },
              ]}
            >
              PDF Berhasil Dibuat
            </Text>
            <Text
              style={[
                styles.successFilename,
                { color: colors.textSecondary, fontFamily: Typography.fontFamily },
              ]}
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
                  backgroundColor: colors.glassPillBg,
                  borderColor: colors.glassPillBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.successStatText,
                  { color: colors.textPrimary, fontFamily: Typography.fontFamily },
                ]}
              >
                {successExportData.pages} Halaman • {successExportData.size}
              </Text>
            </View>

            {/* Action Buttons Pairing */}
            <View style={styles.successActions}>
              <GradientButton
                title="Bagikan PDF"
                icon={<Share2 color="#FFFFFF" size={16} strokeWidth={2.2} />}
                onPress={() => handleSharePdf(successExportData)}
                size="md"
              />

              <GlassButton
                title="Simpan ke Unduhan"
                icon={<DownloadCloud color={colors.textPrimary} size={16} />}
                onPress={() => handleSaveToDownloads(successExportData)}
                size="md"
              />

              <TouchableOpacity
                style={styles.successDoneBtn}
                onPress={handleFinishSuccess}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.successDoneText,
                    { color: colors.textSecondary, fontFamily: Typography.fontFamily },
                  ]}
                >
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
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
  },
  /* Top Compact Liquid Glass Header */
  topNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    overflow: 'hidden',
    position: 'relative',
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  storagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  storagePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconNavButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Dashboard Hero Section */
  dashboardHeroSection: {
    paddingTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  heroCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  heroTextWrapper: {
    gap: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroScanButton: {
    width: '100%',
  },
  /* Preview Top Navbar */
  previewNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  navBackBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
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
    height: 38,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  addPageNavText: {
    fontSize: 13,
    fontWeight: '700',
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
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '95%',
    height: '95%',
  },
  previewPageTag: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewPageTagText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  /* Contextual Action Bar */
  contextualActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  contextActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  disabledContextBtn: {
    opacity: 0.35,
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
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  thumbnailCard: {
    width: 56,
    height: 74,
    borderRadius: Radius.md,
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
    width: 56,
    height: 74,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  addThumbnailText: {
    fontSize: 10,
    fontWeight: '600',
  },
  /* Bottom Export Bar */
  bottomExportBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderTopWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  exportGradientBtn: {
    width: '100%',
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
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  successIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  successFilename: {
    fontSize: 13,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    maxWidth: 280,
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
    gap: Spacing.sm,
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
