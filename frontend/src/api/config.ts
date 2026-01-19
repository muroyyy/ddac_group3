// API Configuration
const getApiBaseUrl = () => {
  // Production: Use api subdomain
  if (window.location.hostname === 'bloodline.dev' || window.location.hostname === 'www.bloodline.dev') {
    return 'https://api.bloodline.dev/api';
  }

  // Development: Use localhost
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }

  // Fallback to api subdomain
  return 'https://api.bloodline.dev/api';
};

export const API_BASE_URL = getApiBaseUrl();
