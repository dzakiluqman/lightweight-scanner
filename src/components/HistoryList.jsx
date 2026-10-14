import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  FileText,
  Share2,
  Trash2,
  DownloadCloud,
  Search,
  X,
  Camera,
} from './Icons';
import { useAppTheme } from '../context/ThemeContext';
import { Spacing, Radius, Typography, Shadows } from '../constants/theme';
import GradientButton from './GradientButton';

/**
 * Format ISO date string into Indonesian friendly display: "28 Sep 2026, 14:30"
 */
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

export default function HistoryList({
  history = [],
  refreshing = false,
  onRefresh,
  onOpenPdf,
  onSharePdf,
  onSaveToDownloads,
  onDeletePdf,
  onStartScan,
  headerComponent,
}) {
  const { colors, isDark } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.fileName && item.fileName.toLowerCase().includes(q))
    );
  }, [history, searchQuery]);

  const confirmDelete = (item) => {
    Alert.alert(
      'Hapus Dokumen?',
      `Hapus "${item.fileName}" secara permanen dari penyimpanan perangkat?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => onDeletePdf(item),
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeaderWrapper}>
      {headerComponent}

      {/* Frosted Glass Search Bar if items exist */}
      {history.length > 0 && (
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.glassInputBg,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <BlurView
            intensity={isDark ? 20 : 35}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <Search color={colors.accent} size={17} strokeWidth={2.2} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontFamily: Typography.fontFamily,
              },
            ]}
            placeholder="Cari nama dokumen..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.searchClearBtn}
            >
              <X color={colors.textMuted} size={16} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Section Subheader */}
      <View style={styles.sectionHeaderRow}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textPrimary, fontFamily: Typography.fontFamily },
          ]}
        >
          Dokumen Tersimpan
        </Text>
        <View
          style={[
            styles.sectionCountBadge,
            {
              backgroundColor: colors.glassPillBg,
              borderColor: colors.glassPillBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionCount,
              { color: colors.textSecondary, fontFamily: Typography.fontFamily },
            ]}
          >
            {filteredHistory.length} berkas
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.glassCardBg,
              borderColor: colors.glassCardBorder,
            },
            Shadows.glass,
          ]}
        >
          <BlurView
            intensity={isDark ? 25 : 40}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.emptyIconBox,
              {
                backgroundColor: colors.glassBg,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <Search color={colors.textMuted} size={28} />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.textPrimary, fontFamily: Typography.fontFamily },
            ]}
          >
            Tidak Ditemukan
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.textSecondary, fontFamily: Typography.fontFamily },
            ]}
          >
            {`Tidak ada dokumen yang cocok dengan "${searchQuery}".`}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.emptyCard,
          {
            backgroundColor: colors.glassCardBg,
            borderColor: colors.glassCardBorder,
          },
          Shadows.glass,
        ]}
      >
        <BlurView
          intensity={isDark ? 25 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.emptyIconBox,
            {
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <FileText color={colors.accent} size={30} strokeWidth={2} />
        </View>
        <Text
          style={[
            styles.emptyTitle,
            { color: colors.textPrimary, fontFamily: Typography.fontFamily },
          ]}
        >
          Belum Ada Dokumen
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: colors.textSecondary, fontFamily: Typography.fontFamily },
          ]}
        >
          Pindai dokumen fisik pertamamu dengan kamera berkualitas tinggi dan deteksi sudut instan.
        </Text>
        {onStartScan && (
          <GradientButton
            title="Mulai Pindai Sekarang"
            icon={<Camera color="#FFFFFF" size={17} strokeWidth={2.2} />}
            onPress={onStartScan}
            size="md"
            style={styles.emptyGradientCta}
          />
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.rowItem,
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
        style={styles.rowMain}
        onPress={() => onOpenPdf(item)}
        activeOpacity={0.7}
      >
        {/* PDF Document Icon Badge with frosted glass styling */}
        <View
          style={[
            styles.pdfBadge,
            {
              backgroundColor: isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.10)',
              borderColor: 'rgba(6, 182, 212, 0.25)',
            },
          ]}
        >
          <FileText color={colors.accent} size={18} strokeWidth={2} />
          {item.pages > 1 && (
            <View
              style={[
                styles.pageCountTag,
                {
                  backgroundColor: colors.accent,
                },
              ]}
            >
              <Text style={styles.pageCountText}>{item.pages}p</Text>
            </View>
          )}
        </View>

        {/* File Metadata */}
        <View style={styles.rowInfo}>
          <Text
            style={[
              styles.fileName,
              {
                color: colors.textPrimary,
                fontFamily: Typography.fontFamily,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {item.fileName}
          </Text>

          <View style={styles.metaRow}>
            <Text
              style={[
                styles.metaText,
                { color: colors.textSecondary, fontFamily: Typography.fontFamily },
              ]}
            >
              {formatDate(item.createdAt)}
            </Text>
            <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
            <Text
              style={[
                styles.metaText,
                { color: colors.textSecondary, fontFamily: Typography.fontFamily },
              ]}
            >
              {item.size || '0 B'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Action Buttons: Download, Share, Delete with Liquid Glass Styling */}
      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={[
            styles.actionIconButton,
            {
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
            },
          ]}
          onPress={() => onSaveToDownloads(item)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          activeOpacity={0.7}
          accessibilityLabel="Simpan ke Penyimpanan"
        >
          <DownloadCloud color={colors.textPrimary} size={15} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionIconButton,
            {
              backgroundColor: isDark ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.10)',
              borderColor: 'rgba(6, 182, 212, 0.25)',
            },
          ]}
          onPress={() => onSharePdf(item)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          activeOpacity={0.7}
          accessibilityLabel="Bagikan PDF"
        >
          <Share2 color={colors.accent} size={15} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionIconButton,
            {
              backgroundColor: colors.dangerBg,
              borderColor: colors.dangerBorder,
            },
          ]}
          onPress={() => confirmDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          activeOpacity={0.7}
          accessibilityLabel="Hapus PDF"
        >
          <Trash2 color={colors.danger} size={15} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={filteredHistory}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 40,
  },
  listHeaderWrapper: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.md,
    gap: Spacing.xs + 2,
    overflow: 'hidden',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sectionCountBadge: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  sectionCount: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    marginBottom: Spacing.xs + 2,
    overflow: 'hidden',
    position: 'relative',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.xs,
  },
  pdfBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: Spacing.sm,
  },
  pageCountTag: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  pageCountText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  rowInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  metaDot: {
    fontSize: 11,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
    maxWidth: 290,
  },
  emptyGradientCta: {
    width: '100%',
    maxWidth: 240,
  },
});
