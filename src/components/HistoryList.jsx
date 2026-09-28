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
import { Spacing, Radius, Typography } from '../constants/theme';

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
      `Hapus "${item.fileName}" secara permanen dari perangkat?`,
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

      {/* Search Input Bar if items exist */}
      {history.length > 0 && (
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Search color={colors.textSecondary} size={16} />
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
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Dokumen Tersimpan
        </Text>
        <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
          {filteredHistory.length} berkas
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Search color={colors.textMuted} size={28} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Tidak Ditemukan
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {`Tidak ada dokumen yang cocok dengan "${searchQuery}".`}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <FileText color={colors.textMuted} size={32} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          Belum Ada Dokumen
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Belum ada dokumen. Ketuk &apos;Mulai Pindai&apos; untuk membuat PDF pertama.
        </Text>
        {onStartScan && (
          <TouchableOpacity
            style={[
              styles.emptyCtaButton,
              {
                backgroundColor: colors.primaryCta,
              },
            ]}
            onPress={onStartScan}
            activeOpacity={0.8}
          >
            <Camera color={colors.primaryCtaText} size={16} />
            <Text
              style={[
                styles.emptyCtaButtonText,
                { color: colors.primaryCtaText },
              ]}
            >
              Mulai Pindai
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.rowItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.rowMain}
        onPress={() => onOpenPdf(item)}
        activeOpacity={0.7}
      >
        {/* PDF Document Icon Badge */}
        <View
          style={[
            styles.pdfBadge,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : colors.accentSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <FileText color={colors.accent} size={18} />
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
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
            <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.size || '0 B'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons: Download, Share, Delete */}
      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={[
            styles.actionIconButton,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onSaveToDownloads(item)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          activeOpacity={0.7}
          accessibilityLabel="Simpan ke Penyimpanan"
        >
          <DownloadCloud color={colors.textSecondary} size={16} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionIconButton,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onSharePdf(item)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          activeOpacity={0.7}
          accessibilityLabel="Bagikan PDF"
        >
          <Share2 color={colors.accent} size={16} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionIconButton,
            {
              backgroundColor: isDark ? colors.dangerBg : colors.dangerBg,
              borderColor: isDark ? colors.dangerBorder : colors.dangerBorder,
            },
          ]}
          onPress={() => confirmDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          activeOpacity={0.7}
          accessibilityLabel="Hapus PDF"
        >
          <Trash2 color={colors.danger} size={16} />
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
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.xs,
  },
  pdfBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
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
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  emptyCtaButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
