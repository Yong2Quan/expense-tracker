import axios from "axios";
import Constants from "expo-constants";

const PORT = 8000;

/**
 * Work out where the Flask backend lives.
 *
 * On a physical phone, "localhost" means the phone itself — not your PC — so
 * a hardcoded localhost URL can never work. Expo already knows your PC's LAN
 * address (it's how the app got delivered), so we reuse that host and just
 * swap the port. Falls back to localhost for web/simulator.
 */
function resolveBaseUrl(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    // Legacy field, still present in some Expo Go builds.
    Constants.expoGoConfig?.debuggerHost ??
    undefined;

  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:${PORT}` : `http://localhost:${PORT}`;
}

export const BASE_URL = resolveBaseUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

/** Surface the backend's JSON {"error": "..."} as a normal Error message. */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ??
      (error.code === "ECONNABORTED" || !error.response
        ? `Cannot reach the backend at ${BASE_URL}. Is it running?`
        : error.message);
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
