// This import MUST stay first.
//
// expo-asset computes `manifestBaseUrl` at module load (PlatformUtils.js), and
// that calls getManifestBaseUrl(), which assigns to `url.protocol`. React
// Native's built-in URL (Libraries/Blob/URL.js) declares `protocol` as a
// getter with no setter, so the assignment throws:
//
//   TypeError: Cannot assign to property 'protocol' which has only a getter
//
// This polyfill installs a spec-compliant URL that does have a protocol
// setter. It has to run before anything pulls in expo-asset — which
// @expo/vector-icons does, via expo-font.
import 'react-native-url-polyfill/auto';

import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
