# Lightweight PDF Scanner

A lightweight mobile application for scanning physical documents into high-quality PDF files. **Lightweight PDF Scanner** uses automatic edge detection and perspective auto-cropping powered by a native document scanner, allowing multiple pages to be combined into a single PDF document without watermarks.

## Features

- Scan single or multiple pages using the device camera.
- Automatic edge detection and perspective auto-cropping.
- Preview scanned pages before exporting.
- Add, rescan, delete, and reorder pages.
- Export scanned images to A4-formatted PDF files.
- Automatically sanitize invalid characters in PDF filenames.
- Store document history locally on the device.
- Search documents by filename.
- Share PDF files using the operating system's native share sheet.
- Save PDF files to external storage and delete documents.

## Technology Stack

- [Expo](https://expo.dev/) SDK 57
- [React Native](https://reactnative.dev/) 0.86
- [Expo Router](https://docs.expo.dev/router/introduction/)
- TypeScript and JavaScript
- [`react-native-document-scanner-plugin`](https://github.com/WebsiteBeaver/react-native-document-scanner-plugin)
- `expo-print`, `expo-file-system`, `expo-sharing`, and `expo-media-library`
- AsyncStorage for storing document history metadata

## Prerequisites

- Node.js LTS
- npm
- Android Studio and an Android emulator for Android development, or Xcode for iOS development
- Expo CLI through the project's dependencies
- A physical device or development build for testing camera-based scanning features

> The native document scanner cannot be fully tested in a web browser. For scanning functionality, use a physical device or a development build.

## Installation

Clone the repository and install the project dependencies:

```
git clone <repository-url>
cd lightweight-scanner
npm install
```

## Running the Application

Start the development server:

```
npm run start
```

Available platform commands:

```
npm run android  # Run the project on Android
npm run ios      # Run the project on iOS
npm run web      # Run the web target for compatible screens
```

On first use, grant camera and media access permissions when requested by the operating system.

## Code Quality

Run the linter before submitting changes:

```
npm run lint
```

## Building with EAS

Build profiles are defined in `eas.json`:

```
# Android development build as an APK
npx eas-cli build --profile development --platform android

# Internal preview/release build as an APK
npx eas-cli build --profile preview --platform android

# Production Android build as an Android App Bundle
npx eas-cli build --profile production --platform android
```

Make sure you are logged in to your Expo account and that the EAS project has been configured before running a build.

For more information, see the official [EAS Build documentation](https://docs.expo.dev/build/introduction/).

## Project Structure

```
.
├── App.js                    # Main scanner state and application flow
├── app.json                  # Expo configuration and native permissions
├── eas.json                  # EAS build profiles
├── src/
│   ├── app/                  # Expo Router routes
│   ├── components/           # Scanner and document history UI components
│   ├── constants/            # Theme constants
│   ├── hooks/                # Theme and color scheme hooks
│   └── services/
│       └── pdfService.js     # Scanning, PDF conversion, storage, and sharing
└── assets/                   # Application icons, splash screen, and other assets
```

## Data Storage

PDF files are stored in the application's internal document directory. Document history metadata is stored using AsyncStorage under the following key:

```
@lightweight_pdf_scanner_history
```

When the document history is loaded, entries whose corresponding PDF files are no longer available are automatically removed.

## Permissions

Depending on the platform, the application may request the following permissions:

- **Camera** — Required for scanning physical documents.
- **Gallery or media access** — Required to save and manage scanned documents.
- **External storage** — Required on Android for exporting files.

Permission descriptions are configured in `app.json` and presented by the operating system at runtime.

## License

See the `LICENSE` file for information about the project's license.
