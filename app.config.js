const fs = require('fs');
const path = require('path');

function loadDotEnv(file) {
  const envPath = path.join(__dirname, file);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv('.env');

const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const useGoogleMaps = process.env.EXPO_PUBLIC_USE_GOOGLE_MAPS === 'true' && mapsKey.length > 0;

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      ...(useGoogleMaps
        ? {
            googleMaps: {
              apiKey: mapsKey,
            },
          }
        : {}),
    },
  },
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      ...(useGoogleMaps ? { googleMapsApiKey: mapsKey } : {}),
    },
  },
  plugins: [
    ...(config.plugins ?? []),
    '@maplibre/maplibre-react-native',
    ...(useGoogleMaps
      ? [
          [
            'react-native-maps',
            {
              androidGoogleMapsApiKey: mapsKey,
              iosGoogleMapsApiKey: mapsKey,
            },
          ],
        ]
      : []),
  ],
});
