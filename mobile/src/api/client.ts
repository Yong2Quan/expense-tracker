import axios from "axios";

// Replace with your machine's local IP when testing on a physical device.
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
const BASE_URL = "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
