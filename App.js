import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  StatusBar,
  ScrollView,
  ToastAndroid,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Layers,
  ArrowLeft,
  Trash2,
  RotateCcw,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileOutput,
  Share2,
  DownloadCloud,
  CheckCircle,
  FolderOpen,
  Sparkles,
  Zap,
} from 'lucide-react-native';

import Logo from './src/components/Logo';
import NamingModal from './src/components/NamingModal';
import HistoryList from './src/components/HistoryList';
import {
  scanDocumentWithCamera,
  compileImagesToPdf,
  getScanHistory,
  deleteScanRecord,
  sharePdfFile,
  exportToExternalStorage,
} from './src/services/pdfService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
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

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setRefreshing(true);
    try {
      const records = await getScanHistory();
      setHistory(records);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Trigger camera document scanner
   */
  const handleStartScan = async (append = false) => {
    try {
      const result = await scanDocumentWithCamera({
        croppedImageQuality: 90,
      });

      if (!result.cancelled && result.images.length > 0) {
        if (append) {
          // Append new pages to existing batch
          setScannedImages((prev) => [...prev, ...result.images]);
          setSelectedPageIndex((prev) => prev); // keep or update
          showToast(`Berhasil menambah ${result.images.length} halaman.`);
        } else {
          // Fresh scan
          setScannedImages(result.images);
          setSelectedPageIndex(0);
          setCurrentView('PREVIEW');
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert(
        'Gagal Memindai',
        'Tidak dapat membuka kamera pemindai. Pastikan izin kamera telah diberikan.',
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
      Alert.alert('Pindai Ulang Gagal', 'Gagal memindai ulang halaman.');
    }
  };

  /**
   * Delete current page
   */
  const handleDeleteCurrentPage = () => {
    if (scannedImages.length <= 1) {
      Alert.alert(
        'Hapus Halaman Terakhir?',
        'Menghapus halaman ini akan membatalkan sesi pindaian saat ini.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus & Keluar',
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
      // Reload history
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

  /**
   * Post-export actions
   */
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
      showToast(`"${item.fileName}" telah dihapus.`);
    } catch (error) {
      Alert.alert('Gagal Menghapus', 'Tidak dapat menghapus dokumen.');
    }
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* ==================== DASHBOARD VIEW ==================== */}
        {currentView === 'DASHBOARD' && (
          <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.topNavbar}>
              <View style={styles.navBrand}>
                <Logo size={36} showGlow={false} />
                <View style={styles.brandTextWrapper}>
                  <Text style={styles.brandTitle}>Lightweight Scanner</Text>
                  <View style={styles.badgeUltraLight}>
                    <Zap color="#14B8A6" size={10} />
                    <Text style={styles.badgeUltraLightText}>ULTRA LIGHTWEIGHT</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.refreshIconBtn}
                onPress={loadHistory}
                activeOpacity={0.7}
              >
                <RotateCcw color="#94A3B8" size={18} />
              </TouchableOpacity>
            </View>

            {/* Hero Start Scan Banner Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroBackgroundDecoration} />
              <View style={styles.heroContent}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.techPill}>
                    <Sparkles color="#38BDF8" size={12} />
                    <Text style={styles.techPillText}>Deteksi Tepi Otomatis & Auto-Crop</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>Pindai Dokumen Fisik Jadi PDF Berkualitas</Text>
                <Text style={styles.heroDescription}>
                  Cepat, tanpa watermark, dan langsung tersimpan ke perangkat Anda.
                </Text>

                {/* Primary Scan Button */}
                <TouchableOpacity
                  style={styles.heroButton}
                  onPress={() => handleStartScan(false)}
                  activeOpacity={0.85}
                >
                  <View style={styles.heroButtonContent}>
                    <View style={styles.heroButtonIconBg}>
                      <Camera color="#FFFFFF" size={22} />
                    </View>
                    <Text style={styles.heroButtonText}>Mulai Pindai Dokumen</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Document History Section */}
            <View style={styles.historyContainer}>
              <HistoryList
                history={history}
                refreshing={refreshing}
                onRefresh={loadHistory}
                onOpenPdf={handleSharePdf}
                onSharePdf={handleSharePdf}
                onSaveToDownloads={handleSaveToDownloads}
                onDeletePdf={handleDeleteHistoryItem}
                onStartScan={() => handleStartScan(false)}
              />
            </View>
          </View>
        )}

        {/* ==================== INTERACTIVE PREVIEW SCREEN ==================== */}
        {currentView === 'PREVIEW' && (
          <View style={styles.container}>
            {/* Preview Top Navbar */}
            <View style={styles.previewTopNavbar}>
              <TouchableOpacity
                style={styles.navBackBtn}
                onPress={() => {
                  Alert.alert(
                    'Tutup Pratinjau?',
                    'Halaman yang telah dipindai akan dibatalkan jika belum diekspor.',
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
                <ArrowLeft color="#F8FAFC" size={20} />
              </TouchableOpacity>

              <View style={styles.previewNavCenter}>
                <Text style={styles.previewNavTitle}>Pratinjau Pindaian</Text>
                <Text style={styles.previewNavSubtitle}>
                  Halaman {selectedPageIndex + 1} dari {scannedImages.length}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addPageNavBtn}
                onPress={() => handleStartScan(true)}
                activeOpacity={0.7}
              >
                <Plus color="#14B8A6" size={18} />
                <Text style={styles.addPageNavText}>Tambah</Text>
              </TouchableOpacity>
            </View>

            {/* Main Center Image Preview */}
            <View style={styles.mainPreviewArea}>
              {scannedImages[selectedPageIndex] ? (
                <View style={styles.previewImageCard}>
                  <Image
                    source={{ uri: scannedImages[selectedPageIndex] }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  {/* Floating Page Index Tag */}
                  <View style={styles.previewPageTag}>
                    <Layers color="#38BDF8" size={12} />
                    <Text style={styles.previewPageTagText}>
                      Hal {selectedPageIndex + 1} / {scannedImages.length}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Editing Page Controls Toolbar */}
            <View style={styles.pageToolbar}>
              <TouchableOpacity
                style={[
                  styles.toolbarToolBtn,
                  selectedPageIndex === 0 && styles.disabledToolBtn,
                ]}
                onPress={() => handleMovePage(-1)}
                disabled={selectedPageIndex === 0}
                activeOpacity={0.7}
              >
                <ChevronLeft
                  color={selectedPageIndex === 0 ? '#475569' : '#CBD5E1'}
                  size={18}
                />
                <Text
                  style={[
                    styles.toolbarToolText,
                    selectedPageIndex === 0 && styles.disabledToolText,
                  ]}
                >
                  Geser Kiri
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolbarToolBtn}
                onPress={handleRescanCurrentPage}
                activeOpacity={0.7}
              >
                <RotateCcw color="#38BDF8" size={18} />
                <Text style={styles.toolbarToolText}>Pindai Ulang</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolbarToolBtn, styles.deleteToolBtn]}
                onPress={handleDeleteCurrentPage}
                activeOpacity={0.7}
              >
                <Trash2 color="#EF4444" size={18} />
                <Text style={[styles.toolbarToolText, { color: '#EF4444' }]}>Hapus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toolbarToolBtn,
                  selectedPageIndex === scannedImages.length - 1 && styles.disabledToolBtn,
                ]}
                onPress={() => handleMovePage(1)}
                disabled={selectedPageIndex === scannedImages.length - 1}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.toolbarToolText,
                    selectedPageIndex === scannedImages.length - 1 && styles.disabledToolText,
                  ]}
                >
                  Geser Kanan
                </Text>
                <ChevronRight
                  color={
                    selectedPageIndex === scannedImages.length - 1 ? '#475569' : '#CBD5E1'
                  }
                  size={18}
                />
              </TouchableOpacity>
            </View>

            {/* Thumbnail Strip / Carousel */}
            <View style={styles.thumbnailStripWrapper}>
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
                        isSelected && styles.activeThumbnailCard,
                      ]}
                      onPress={() => setSelectedPageIndex(index)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri }} style={styles.thumbnailImage} />
                      <View
                        style={[
                          styles.thumbnailIndexBadge,
                          isSelected && styles.activeThumbnailIndexBadge,
                        ]}
                      >
                        <Text style={styles.thumbnailIndexText}>{index + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Add Page Shortcut inside Thumbnail List */}
                <TouchableOpacity
                  style={styles.addThumbnailButton}
                  onPress={() => handleStartScan(true)}
                  activeOpacity={0.7}
                >
                  <Plus color="#14B8A6" size={20} />
                  <Text style={styles.addThumbnailText}>Tambah</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Floating Action / Bottom Export Button */}
            <View style={styles.bottomExportBar}>
              <TouchableOpacity
                style={styles.exportPdfButton}
                onPress={handlePromptExport}
                activeOpacity={0.85}
              >
                <View style={styles.exportBtnIconContainer}>
                  <FileOutput color="#FFFFFF" size={20} />
                </View>
                <Text style={styles.exportPdfButtonText}>
                  Ekspor ke PDF ({scannedImages.length} Halaman)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================== NAMING MODAL ==================== */}
        <NamingModal
          visible={namingModalVisible}
          pageCount={scannedImages.length}
          isLoading={isExporting}
          onClose={() => setNamingModalVisible(false)}
          onConfirm={handleExecuteExport}
        />

        {/* ==================== SUCCESS BANNER MODAL ==================== */}
        {successExportData && (
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <CheckCircle color="#14B8A6" size={40} />
              </View>

              <Text style={styles.successTitle}>PDF Berhasil Dibuat!</Text>
              <Text style={styles.successFilename} numberOfLines={1}>
                {successExportData.fileName}
              </Text>

              <View style={styles.successStatsRow}>
                <View style={styles.successStatPill}>
                  <Text style={styles.successStatLabel}>Ukuran</Text>
                  <Text style={styles.successStatValue}>{successExportData.size}</Text>
                </View>
                <View style={styles.successStatPill}>
                  <Text style={styles.successStatLabel}>Halaman</Text>
                  <Text style={styles.successStatValue}>{successExportData.pages} hal</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.successActions}>
                <TouchableOpacity
                  style={styles.successPrimaryBtn}
                  onPress={() => handleSharePdf(successExportData)}
                  activeOpacity={0.8}
                >
                  <Share2 color="#FFFFFF" size={18} />
                  <Text style={styles.successPrimaryBtnText}>Bagikan PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.successSecondaryBtn}
                  onPress={() => handleSaveToDownloads(successExportData)}
                  activeOpacity={0.8}
                >
                  <DownloadCloud color="#38BDF8" size={18} />
                  <Text style={styles.successSecondaryBtnText}>Simpan ke Downloads</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.successDoneBtn}
                  onPress={handleFinishSuccess}
                  activeOpacity={0.8}
                >
                  <Text style={styles.successDoneBtnText}>Kembali ke Beranda</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  /* Top Navbar */
  topNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTextWrapper: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  badgeUltraLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  badgeUltraLightText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#14B8A6',
    letterSpacing: 0.5,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Hero Card */
  heroCard: {
    margin: 16,
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackgroundDecoration: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
  },
  heroContent: {
    zIndex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  techPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  techPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 26,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 18,
  },
  heroButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  heroButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  heroButtonIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  historyContainer: {
    flex: 1,
  },
  /* Preview Screen Styles */
  previewTopNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  navBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewNavCenter: {
    alignItems: 'center',
  },
  previewNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  previewNavSubtitle: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '600',
    marginTop: 2,
  },
  addPageNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  addPageNavText: {
    color: '#14B8A6',
    fontSize: 13,
    fontWeight: '700',
  },
  mainPreviewArea: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImageCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  previewPageTag: {
    position: 'absolute',
    top: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  previewPageTagText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  pageToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  toolbarToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  disabledToolBtn: {
    opacity: 0.4,
  },
  deleteToolBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  toolbarToolText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  disabledToolText: {
    color: '#64748B',
  },
  thumbnailStripWrapper: {
    height: 90,
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  thumbnailScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  thumbnailCard: {
    width: 54,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
    position: 'relative',
  },
  activeThumbnailCard: {
    borderColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailIndexBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeThumbnailIndexBadge: {
    backgroundColor: '#14B8A6',
  },
  thumbnailIndexText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  addThumbnailButton: {
    width: 54,
    height: 70,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addThumbnailText: {
    fontSize: 10,
    color: '#14B8A6',
    fontWeight: '700',
  },
  bottomExportBar: {
    padding: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  exportPdfButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  exportBtnIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportPdfButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  /* Success Overlay */
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 99,
  },
  successCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.4)',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 2,
    borderColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  successFilename: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  successStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  successStatPill: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  successStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  successStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  successPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0EA5E9',
    borderRadius: 14,
    height: 48,
  },
  successPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155',
  },
  successSecondaryBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
  successDoneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginTop: 4,
  },
  successDoneBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
