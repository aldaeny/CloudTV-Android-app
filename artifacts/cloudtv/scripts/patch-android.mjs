// Run after `cap add android` / `cap sync`: enables cleartext traffic, keeps the
// existing signing config (keystore) untouched, and declares TV/leanback support.
import fs from "node:fs";
import path from "node:path";

const manifest = path.resolve("android/app/src/main/AndroidManifest.xml");
if (!fs.existsSync(manifest)) {
  console.log("android project not found; run `pnpm android:add` first");
  process.exit(0);
}
let xml = fs.readFileSync(manifest, "utf8");
if (!xml.includes("usesCleartextTraffic")) {
  xml = xml.replace("<application", '<application\n        android:usesCleartextTraffic="true"');
}
if (!xml.includes("android.software.leanback")) {
  xml = xml.replace(
    "<application",
    '<uses-feature android:name="android.software.leanback" android:required="false" />\n    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n    <application',
  );
}
if (!xml.includes("LEANBACK_LAUNCHER")) {
  xml = xml.replace(
    /(<category android:name="android.intent.category.LAUNCHER" \/>)/,
    '$1\n                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />',
  );
}
if (!xml.includes("android.permission.INTERNET")) {
  xml = xml.replace("<application", '<uses-permission android:name="android.permission.INTERNET" />\n    <application');
}
fs.writeFileSync(manifest, xml);

// Version 1.5 (package ID and signing config are left untouched).
const gradle = path.resolve("android/app/build.gradle");
if (fs.existsSync(gradle)) {
  let g = fs.readFileSync(gradle, "utf8");
  g = g.replace(/versionName\s+"[^"]*"/, 'versionName "1.5"').replace(/versionCode\s+\d+/, "versionCode 15");
  fs.writeFileSync(gradle, g);
}
console.log("patched", manifest);
