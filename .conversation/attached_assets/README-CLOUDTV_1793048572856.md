# CloudTV — IPTV client

CloudTV is a React + TypeScript + Vite IPTV client. The current source includes live TV playback, M3U playlist parsing, Xtream Codes provider support, favorites, channel search, an EPG screen, playback preferences, appearance settings, and configurable public/free channel sources.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm ci
npm run dev
```

Create a production web build:

```bash
npm run build
npm run preview
```

## Playlist and provider notes

- Add an M3U/M3U8 URL from Settings → IPTV Servers → Add.
- Add Xtream Codes server details in the same screen.
- Playlist fetches depend on the provider's CORS configuration when running in a browser. A browser CORS restriction is not proof that the playlist URL is invalid.
- Playback depends on a valid stream URL, codec support, and the provider's availability. DRM-protected or access-controlled content requires the provider's authorized playback mechanism.
- Use only playlists and streams you are authorized to access.

## Android and iOS packaging

This repository is currently a Vite web app, not a configured native Android/iOS project. To make installable mobile builds, integrate Capacitor, configure the native projects and application IDs, verify player compatibility on physical devices, then build Android with Android Studio and iOS with Xcode on macOS. A successful web build alone does not mean an APK or IPA has been produced.

## Current work in this revision

- Rebranded visible application labels and page metadata from OrbitTV to CloudTV.
- Improved Extended-M3U attribute parsing for double-quoted, single-quoted, and unquoted attributes.
- Added support for a UTF-8 BOM, relative stream URLs, standalone stream URLs, and common radio extensions.
- Passed each playlist's source URL into the parser so relative stream paths can be resolved.

## Verification status

A production build was attempted in the current workspace but could not run because Vite was not present in the partially installed `node_modules` directory. Run `npm ci` in an environment with registry access, then `npm run build` to verify the project. Native Android/iOS builds have not been generated or verified.
