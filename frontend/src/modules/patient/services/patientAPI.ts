// Mocked patient API - mirrors donorAPI shape but returns mock data

export interface PatientDashboard {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  fulfilled: number;
  upcomingAppointments: number;
}

export interface PatientProfile {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  bloodType?: string;
  location?: string;
}

export interface BloodRequest {
  id: number;
  bloodType: string;
  unitsRequested: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  hospitalName: string;
  date: string;
  time: string;
  status: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const MOCK_DASHBOARD: PatientDashboard = {
  totalRequests: 4,
  pending: 1,
  approved: 2,
  rejected: 0,
  fulfilled: 1,
  upcomingAppointments: 2,
};

const MOCK_PROFILE: PatientProfile = {
  userId: 9,
  fullName: 'Sharveen Kaur',
  email: 'sharveen@example.com',
  phone: '+60 12-345 6789',
  bloodType: 'A+',
  location: 'Kuala Lumpur',
};

const MOCK_REQUESTS: BloodRequest[] = [
  { id: 1, bloodType: 'A+', unitsRequested: 2, status: 'Pending', notes: 'Urgent', createdAt: '2025-11-01' },
  { id: 2, bloodType: 'O-', unitsRequested: 1, status: 'Approved', createdAt: '2025-10-12' },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, hospitalName: 'City Hospital', date: '2025-12-10', time: '09:00', status: 'Scheduled' },
  { id: 2, hospitalName: 'Central Clinic', date: '2026-01-05', time: '14:00', status: 'Scheduled' },
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: 'Appointment Reminder', body: 'You have an appointment on 2025-12-10', date: '2025-12-01', read: false },
  { id: 2, title: 'Request Approved', body: 'Your blood request #2 was approved', date: '2025-11-15', read: true },
];

export const patientAPI = {
  getPatientDashboard: async (_patientId: number): Promise<PatientDashboard> => {
    await delay();
    return MOCK_DASHBOARD;
  },

  getPatientProfile: async (patientId: number): Promise<PatientProfile> => {
    await delay();
    return { ...MOCK_PROFILE, userId: patientId };
  },

  updatePatientProfile: async (_patientId: number, _data: Partial<PatientProfile>): Promise<{ message: string }> => {
    await delay();
    return { message: 'Profile updated (mock)' };
  },

  createBloodRequest: async (_patientId: number, _data: Partial<BloodRequest>): Promise<{ message: string; id: number }> => {
    await delay();
    return { message: 'Request created (mock)', id: Date.now() % 100000 };
  },

  getBloodRequests: async (_patientId: number): Promise<BloodRequest[]> => {
    await delay();
    return MOCK_REQUESTS;
  },

  getPatientAppointments: async (_patientId: number): Promise<Appointment[]> => {
    await delay();
    return MOCK_APPOINTMENTS;
  },

  getNotifications: async (_patientId: number): Promise<NotificationItem[]> => {
    await delay();
    return MOCK_NOTIFICATIONS;
  },
};
