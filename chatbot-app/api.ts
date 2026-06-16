import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getHostFromUri(uri?: string | null) {
  if (!uri) {
    return null;
  }

  try {
    const normalizedUri = uri.includes('://') ? uri : `http://${uri}`;
    return new URL(normalizedUri).hostname || null;
  } catch {
    return null;
  }
}

export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  const expoHost =
    getHostFromUri(Constants.expoConfig?.hostUri) ||
    getHostFromUri(Constants.linkingUri);

  if (expoHost) {
    return `http://${expoHost}:3000`;
  }

  return Platform.OS === 'android'
    ? 'http://192.168.101.100:3000'
    : 'http://localhost:3000';
}

export const apiBaseUrl = getApiBaseUrl();
