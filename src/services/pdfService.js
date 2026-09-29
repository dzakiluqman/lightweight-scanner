import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin';

export const STORAGE_HISTORY_KEY = '@lightweight_pdf_scanner_history';
export const SCANS_DIR = `${FileSystem.documentDirectory || ''}scans/`;

/**
 * Format bytes into readable string (KB, MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Generates default filename in Scan_YYYYMMDD_HHMMSS format
 */
export function generateDefaultFilename() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `Scan_${yyyy}${MM}${dd}_${hh}${mm}${ss}`;
}

/**
 * Sanitizes input filename by stripping invalid filesystem characters:
 * / \ : * ? " < > |
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return generateDefaultFilename();
  }
  // Strip illegal chars and trim
  const clean = filename
    .replace(/[/\\:*?"<>|]/g, '')
    .trim()
    .replace(/\.pdf$/i, ''); // strip .pdf if typed by user

  return clean.length > 0 ? clean : generateDefaultFilename();
}

/**
 * Ensures the internal scans directory exists
 */
export async function ensureScansDirectory() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(SCANS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SCANS_DIR, { intermediates: true });
    }
  } catch (error) {
    console.warn('Could not create scans directory:', error);
  }
}

/**
 * Trigger native document edge detection and perspective auto-crop camera
 */
export async function scanDocumentWithCamera(options = {}) {
  try {
    const { croppedImageQuality = 90, maxNumDocuments } = options;
    const response = await DocumentScanner.scanDocument({
      croppedImageQuality,
      maxNumDocuments,
      responseType: ResponseType.ImageFilePath,
    });

    if (response && response.status === 'success' && Array.isArray(response.scannedImages)) {
      return {
        cancelled: false,
        images: response.scannedImages,
      };
    }

    return {
      cancelled: true,
      images: [],
    };
  } catch (error) {
    console.error('DocumentScanner error:', error);
    throw error;
  }
}

/**
 * Converts scanned page images into high-resolution Base64 and embeds into HTML for Print to PDF
 */
async function generatePdfHtml(imageUris) {
  const base64Images = await Promise.all(
    imageUris.map(async (uri) => {
      try {
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        return `data:image/jpeg;base64,${base64Data}`;
      } catch (err) {
        console.warn('Fallback reading image URI directly:', err);
        return uri;
      }
    })
  );

  const pagesHtml = base64Images
    .map(
      (src, index) => `
    <div class="page-container" id="page-${index + 1}">
      <img src="${src}" class="page-image" alt="Scanned Page ${index + 1}" />
    </div>`
    )
    .join('\n');

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      html, body {
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-container {
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        page-break-after: always;
        page-break-inside: avoid;
        overflow: hidden;
        background-color: #ffffff;
      }
      .page-container:last-child {
        page-break-after: auto;
      }
      .page-image {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
      }
    </style>
  </head>
  <body>
    ${pagesHtml}
  </body>
</html>`;
}

/**
 * Compiles array of image URIs to PDF, saves locally to app storage, and logs to history
 */
export async function compileImagesToPdf(imageUris, rawFilename) {
  if (!imageUris || imageUris.length === 0) {
    throw new Error('Tidak ada halaman yang dipilih untuk dikonversi.');
  }

  await ensureScansDirectory();

  const cleanName = sanitizeFilename(rawFilename);
  const targetFileName = `${cleanName}.pdf`;
  const targetPath = `${SCANS_DIR}${targetFileName}`;

  // 1. Generate optimized HTML with inline images
  const htmlContent = await generatePdfHtml(imageUris);

  // 2. Render to PDF via expo-print
  const printResult = await Print.printToFileAsync({
    html: htmlContent,
  });

  // 3. Move/Copy to app permanent scans directory
  const existingCheck = await FileSystem.getInfoAsync(targetPath);
  if (existingCheck.exists) {
    await FileSystem.deleteAsync(targetPath, { idempotent: true });
  }

  await FileSystem.copyAsync({
    from: printResult.uri,
    to: targetPath,
  });

  // 4. Retrieve file stats
  const fileInfo = await FileSystem.getInfoAsync(targetPath);
  const fileSize = fileInfo.exists ? fileInfo.size : 0;

  const newScanRecord = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    fileName: targetFileName,
    uri: targetPath,
    bytes: fileSize,
    size: formatBytes(fileSize),
    pages: imageUris.length,
    createdAt: new Date().toISOString(),
  };

  // 5. Persist to History in AsyncStorage
  await addScanToHistory(newScanRecord);

  return newScanRecord;
}

/**
 * Fetch scan history from AsyncStorage and prune entries whose files no longer exist
 */
export async function getScanHistory() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return [];

    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];

    // Filter out missing files asynchronously
    const validatedItems = [];
    for (const item of items) {
      if (item && item.uri) {
        try {
          const info = await FileSystem.getInfoAsync(item.uri);
          if (info.exists) {
            validatedItems.push({
              ...item,
              bytes: info.size,
              size: formatBytes(info.size),
            });
          }
        } catch {
          // If check fails, exclude
        }
      }
    }

    // Save cleaned list if items were pruned
    if (validatedItems.length !== items.length) {
      await AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(validatedItems));
    }

    // Sort newest first
    return validatedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

/**
 * Add a new scan record to history
 */
export async function addScanToHistory(record) {
  try {
    const current = await getScanHistory();
    const updated = [record, ...current.filter((item) => item.id !== record.id)];
    await AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving scan to history:', error);
    return [];
  }
}

/**
 * Delete a scan record and its underlying PDF file
 */
export async function deleteScanRecord(recordId, fileUri) {
  try {
    if (fileUri) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
    const current = await getScanHistory();
    const filtered = current.filter((item) => item.id !== recordId);
    await AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error deleting scan:', error);
    throw error;
  }
}

/**
 * Share PDF file using OS share sheet
 */
export async function sharePdfFile(fileUri, fileName = 'Dokumen.pdf') {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Fitur berbagi tidak didukung di perangkat ini.');
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Bagikan ${fileName}`,
      UTI: 'com.adobe.pdf',
    });
    return true;
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
}

/**
 * Export PDF to Android Storage (Downloads/Document folder) using StorageAccessFramework
 * or save to Media Library
 */
export async function exportToExternalStorage(fileUri, fileName = 'Dokumen.pdf') {
  if (Platform.OS === 'android') {
    try {
      // 1. Try StorageAccessFramework to let user pick target folder (e.g. Downloads)
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64Data = await FileSystem.readAsStringAsync(fileUri, {
          encoding: 'base64',
        });
        const cleanName = sanitizeFilename(fileName);
        const createdFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          cleanName,
          'application/pdf'
        );
        await FileSystem.writeAsStringAsync(createdFileUri, base64Data, {
          encoding: 'base64',
        });
        return {
          success: true,
          method: 'saf',
          uri: createdFileUri,
          message: 'Berhasil diekspor ke folder pilihan!',
        };
      }
    } catch (safError) {
      console.warn('StorageAccessFramework warning/fallback:', safError);
    }

    // 2. Secondary fallback: MediaLibrary permission
    try {
      const mediaPerm = await MediaLibrary.requestPermissionsAsync();
      if (mediaPerm.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        return {
          success: true,
          method: 'mediaLibrary',
          message: 'Berhasil disimpan ke Penyimpanan Dokumen!',
        };
      }
    } catch (mediaError) {
      console.warn('MediaLibrary fallback error:', mediaError);
    }
  }

  // 3. Fallback for iOS or if user cancelled folder picker: use Sharing
  await sharePdfFile(fileUri, fileName);
  return {
    success: true,
    method: 'share',
    message: 'Menu simpan/bagikan telah dibuka.',
  };
}
