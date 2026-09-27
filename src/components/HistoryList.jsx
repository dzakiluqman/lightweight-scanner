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
  Calendar,
  Layers,
  HardDrive,
  FileCheck,
  FolderOpen,
} from 'lucide-react-native';

/**
 * Format ISO date string into Indonesian friendly display
 */
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
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

/**
 * Modern History List of Saved PDFs
 * Renders cards with file size, page count, date, and direct Share/Save/Delete actions
 */
export default function HistoryList({
  history = [],
  refreshing = false,
  onRefresh,
  onOpenPdf,
  onSharePdf,
  onSaveToDownloads,
  onDeletePdf,
  onStartScan,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  // Aggregate stats
  const totalBytes = useMemo(() => {
    return history.reduce((sum, item) => sum + (item.bytes || 0), 0);
  }, [history]);

  const confirmDelete = (item) => {
    Alert.alert(
      'Hapus Dokumen?',
      `Apakah Anda yakin ingin menghapus "${item.fileName}"? Tindakan ini tidak dapat dibatalkan.`,
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
    <View style={styles.headerContainer}>
      {/* Title & Stats */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.sectionTitle}>Riwayat Dokumen</Text>
          <Text style={styles.sectionSubtitle}>
            {history.length > 0
              ? `${history.length} dokumen PDF tersimpan`
              : 'Belum ada dokumen yang dipindai'}
          </Text>
        </View>

        {history.length > 0 && (
          <View style={styles.badgeStorage}>
            <HardDrive color="#14B8A6" size={13} />
            <Text style={styles.badgeStorageText}>
              {(totalBytes / (1024 * 1024)).toFixed(1)} MB
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar if items exist */}
      {history.length > 0 && (
        <View style={styles.searchBox}>
          <Search color="#64748B" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama dokumen..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <FolderOpen color="#64748B" size={40} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Dokumen Tidak Ditemukan' : 'Belum Ada Pindaian'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `Tidak ada dokumen yang cocok dengan kata kunci "${searchQuery}".`
          : 'Dokumen yang telah dipindai dan diekspor ke PDF akan muncul di sini.'}
      </Text>

      {!searchQuery && onStartScan && (
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={onStartScan}
          activeOpacity={0.8}
        >
          <FileCheck color="#FFFFFF" size={18} />
          <Text style={styles.emptyActionText}>Pindai Sekarang</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onOpenPdf(item)}
        activeOpacity={0.7}
      >
        {/* PDF Document Icon with Page Badge */}
        <View style={styles.iconContainer}>
          <FileText color="#0EA5E9" size={26} />
          <View style={styles.pageMiniBadge}>
            <Text style={styles.pageMiniBadgeText}>{item.pages || 1}p</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {item.fileName}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar color="#64748B" size={12} />
              <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
            </View>

            <View style={styles.metaSeparator} />

            <View style={styles.metaItem}>
              <Layers color="#64748B" size={12} />
              <Text style={styles.metaText}>{item.size || '0 B'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSaveToDownloads(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Simpan ke Penyimpanan"
        >
          <DownloadCloud color="#38BDF8" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSharePdf(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Bagikan PDF"
        >
          <Share2 color="#14B8A6" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Hapus PDF"
        >
          <Trash2 color="#EF4444" size={18} />
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
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
            colors={['#14B8A6', '#0EA5E9']}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 16,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  badgeStorage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  badgeStorageText: {
    color: '#14B8A6',
    fontSize: 12,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 0,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 12,
  },
  pageMiniBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0EA5E9',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pageMiniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#475569',
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
