import { sessionManager } from '../utils/sessionManager';
import { API_BASE_URL } from './config';

const getAuthHeaders = (): HeadersInit => {
  const token = sessionManager.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    sessionManager.clearSession();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  return response;
};

export async function parseJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType?.includes('application/json')) {
    let bodyText = '';
    try {
      bodyText = await response.text();
      if (bodyText.length > 200) {
        bodyText = bodyText.substring(0, 200) + '...';
      }
    } catch {
      bodyText = '(unable to read response body)';
    }
    
    const errorMsg = `Server returned ${contentType || 'unknown content type'}: ${bodyText}`;
    console.error('❌ Non-JSON Response:', { status: response.status, errorMsg });
    throw new Error(errorMsg);
  }
  
  return response.json();
}

export { API_BASE_URL };
