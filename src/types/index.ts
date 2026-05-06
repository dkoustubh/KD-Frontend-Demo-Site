export type Role = 'Admin' | 'HOD' | 'Engineer';
export type Department = 'Management' | 'IT' | 'R&D' | 'Mechanical Design' | 'Electrical Design' | 'Electrical workshop' | 'mech workshop' | 'purchase' | 'finance' | 'HR & A' | 'Installation and commissioning' | 'Controls Dept';
export type UserStatus = 'Active' | 'On-Site' | 'Office' | 'Leave' | 'Absent';

export interface User {
  id: string;
  name: string;
  role: Role;
  department: Department;
  phone: string;
  email: string;
  status: UserStatus;
  avatar: string;
  projects: string[]; // Array of Project IDs
  latitude?: number;
  longitude?: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  logo: string;
  members: string[]; // User IDs
  startDate: string;
  endDate: string;
  type: 'Internal' | 'External';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Ongoing' | 'Completed' | 'Delayed';
  progress: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
