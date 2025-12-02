const API_BASE_URL = import.meta.env.VITE_EC2_PUBLIC_IP 
  ? `http://${import.meta.env.VITE_EC2_PUBLIC_IP}:5000/api`
  : 'http://localhost:5000/api';

export const PatientService = {
  createRequest: async (patientId: number, payload: any) => {
    const res = await fetch(`${API_BASE_URL}/patient/${patientId}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getRequests: async (patientId: number) => {
    const res = await fetch(`${API_BASE_URL}/patient/${patientId}/requests`);
    return res.json();
  },

  getDashboard: async (patientId: number) => {
    const res = await fetch(`${API_BASE_URL}/patient/${patientId}/dashboard`);
    return res.json();
  }
};
 
