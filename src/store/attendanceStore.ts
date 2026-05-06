import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RegStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PunchRecord {
  date: string; // e.g. '2026-05-03'
  punchIn: string | null; // e.g. '09:12 AM'
  punchOut: string | null; // e.g. '06:45 PM'
  workHours: string | null; // e.g. '9h 33m'
  siteId: string;
  siteName: string;
}

export interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  oldPunchIn: string | null;
  oldPunchOut: string | null;
  newPunchIn: string;
  newPunchOut: string;
  reason: string;
  status: RegStatus;
  createdAt: string;
  respondedAt?: string;
  hodId?: string;
}

interface AttendanceState {
  punchRecords: PunchRecord[];
  regularizationRequests: RegularizationRequest[];
  addPunchRecord: (record: PunchRecord) => void;
  getPunchForDate: (date: string) => PunchRecord | undefined;
  submitRegularization: (request: Omit<RegularizationRequest, 'id' | 'createdAt' | 'status'>) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  getPendingRequestsForHOD: (department: string) => RegularizationRequest[];
  getRequestsForEmployee: (employeeId: string) => RegularizationRequest[];
  deleteRequest: (requestId: string) => void;
}

// Generate realistic mock punch data for May 2026
const generateMockPunches = (): PunchRecord[] => {
  const records: PunchRecord[] = [];
  const sites = [
    { id: '0022A252', name: 'Lumax ASRS' },
    { id: '0023A008', name: 'VECV' },
  ];
  
  for (let day = 1; day <= 5; day++) {
    const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
    const inHour = 8 + Math.floor(Math.random() * 2);
    const inMin = Math.floor(Math.random() * 60);
    const outHour = 17 + Math.floor(Math.random() * 2);
    const outMin = Math.floor(Math.random() * 60);
    const workMins = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const wh = Math.floor(workMins / 60);
    const wm = workMins % 60;

    const site = sites[Math.floor(Math.random() * sites.length)];
    
    if (day === 4) {
      records.push({
        date: dateStr,
        punchIn: `${inHour.toString().padStart(2, '0')}:${inMin.toString().padStart(2, '0')} AM`,
        punchOut: null,
        workHours: null,
        siteId: site.id,
        siteName: site.name,
      });
    } else {
      records.push({
        date: dateStr,
        punchIn: `${inHour > 12 ? inHour - 12 : inHour}:${inMin.toString().padStart(2, '0')} ${inHour >= 12 ? 'PM' : 'AM'}`,
        punchOut: `${outHour > 12 ? outHour - 12 : outHour}:${outMin.toString().padStart(2, '0')} PM`,
        workHours: `${wh}h ${wm}m`,
        siteId: site.id,
        siteName: site.name,
      });
    }
  }
  return records;
};

const generateMockRequests = (): RegularizationRequest[] => [
  {
    id: 'REG001',
    employeeId: 'E100',
    employeeName: 'Koustubh Deodhar',
    department: 'Installation and commissioning',
    date: '2026-05-04',
    oldPunchIn: '09:12 AM',
    oldPunchOut: null,
    newPunchIn: '09:12 AM',
    newPunchOut: '06:30 PM',
    reason: 'Forgot to punch out due to urgent site meeting.',
    status: 'Pending',
    createdAt: '2026-05-05T10:30:00Z',
  },
  {
    id: 'REG002',
    employeeId: 'E101',
    employeeName: 'Hrushikesh Pandir',
    department: 'Installation and commissioning',
    date: '2026-05-02',
    oldPunchIn: null,
    oldPunchOut: null,
    newPunchIn: '08:45 AM',
    newPunchOut: '05:15 PM',
    reason: 'Network connectivity issue at site prevented punching.',
    status: 'Pending',
    createdAt: '2026-05-03T09:00:00Z',
  },
];

let nextId = 3;

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      punchRecords: generateMockPunches(),
      regularizationRequests: generateMockRequests(),

      addPunchRecord: (record) =>
        set((state) => ({ punchRecords: [...state.punchRecords, record] })),

      getPunchForDate: (date) => get().punchRecords.find((r) => r.date === date),

      submitRegularization: (request) => {
        const newReq: RegularizationRequest = {
          ...request,
          id: `REG${String(nextId++).padStart(3, '0')}`,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          regularizationRequests: [newReq, ...state.regularizationRequests],
        }));
      },

      approveRequest: (requestId) =>
        set((state) => {
          const requests = state.regularizationRequests.map((r) => {
            if (r.id === requestId) {
              return { ...r, status: 'Approved' as RegStatus, respondedAt: new Date().toISOString() };
            }
            return r;
          });
          const approved = requests.find((r) => r.id === requestId);
          let punchRecords = [...state.punchRecords];
          if (approved) {
            const existingIdx = punchRecords.findIndex((p) => p.date === approved.date);
            const updatedRecord: PunchRecord = {
              date: approved.date,
              punchIn: approved.newPunchIn,
              punchOut: approved.newPunchOut,
              workHours: calculateWorkHours(approved.newPunchIn, approved.newPunchOut),
              siteId: '',
              siteName: '',
            };
            if (existingIdx >= 0) {
              punchRecords[existingIdx] = { ...punchRecords[existingIdx], ...updatedRecord };
            } else {
              punchRecords.push(updatedRecord);
            }
          }
          return { regularizationRequests: requests, punchRecords };
        }),

      rejectRequest: (requestId) =>
        set((state) => ({
          regularizationRequests: state.regularizationRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'Rejected' as RegStatus, respondedAt: new Date().toISOString() }
              : r
          ),
        })),

      getPendingRequestsForHOD: (department) =>
        get().regularizationRequests.filter(
          (r) => r.department === department
        ),

      getRequestsForEmployee: (employeeId) =>
        get().regularizationRequests.filter((r) => r.employeeId === employeeId),

      deleteRequest: (requestId) =>
        set((state) => ({
          regularizationRequests: state.regularizationRequests.filter((r) => r.id !== requestId),
        })),
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function calculateWorkHours(punchIn: string, punchOut: string): string {
  try {
    const parseTime = (t: string) => {
      const [time, period] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    const diff = parseTime(punchOut) - parseTime(punchIn);
    if (diff <= 0) return '0h 0m';
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  } catch {
    return '--';
  }
}
