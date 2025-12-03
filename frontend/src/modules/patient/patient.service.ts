const API_BASE_URL = import.meta.env.VITE_EC2_PUBLIC_IP 
  ? `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5269/api`
  : 'http://localhost:5269/api';

/**
 * Safe JSON response parser - handles non-JSON responses (HTML errors)
 */
async function parseJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType?.includes('application/json')) {
    let bodyText = '';
    try {
      bodyText = await response.text();
      if (bodyText.length > 200) {
        bodyText = bodyText.substring(0, 200) + '...';
      }
    } catch {
      bodyText = '(unable to read response)';
    }
    
    const errorMsg = `Server returned ${contentType || 'unknown type'}: ${bodyText}`;
    console.error('❌ Non-JSON Response:', { status: response.status, errorMsg });
    throw new Error(errorMsg);
  }
  
  return response.json();
}

export const PatientService = {
  createRequest: async (patientId: number, payload: any) => {
    const res = await fetch(`${API_BASE_URL}/patient/${patientId}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    return parseJsonResponse(res);
  },

  getRequests: async (patientId: number) => {
    const res = await fetch(`${API_BASE_URL}/patient/${patientId}/requests`);
    return parseJsonResponse(res);
  },

  getDashboard: async (patientId: number) => {
    console.log(`📡 Fetching patient dashboard from: ${API_BASE_URL}/patient/${patientId}/dashboard`);
    const res = await fetch(`${API_BASE_URL}/patient/${patientId}/dashboard`);
    console.log('📨 Response status:', res.status, res.statusText);
    return parseJsonResponse(res);
  }
};
 
