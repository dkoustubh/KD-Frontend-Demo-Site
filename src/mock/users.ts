import { User, Role, Department } from '../types';

const firstNames = ['Koustubh', 'Hrushikesh', 'Vedang', 'Amit', 'Rahul', 'Priya', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Suresh', 'Ramesh', 'Aditi', 'Nikhil', 'Pooja', 'Sunil', 'Kavita', 'Arjun', 'Neha', 'Sanjay'];
const lastNames = ['Deodhar', 'Pandir', 'Dharamadhikari', 'Sharma', 'Verma', 'Patil', 'Deshmukh', 'Joshi', 'Kulkarni', 'Singh', 'Kumar', 'Rao', 'Nair', 'Menon', 'Iyer', 'Pillai', 'Reddy', 'Gowda', 'Das', 'Sen'];

const generateMockUsers = (): User[] => {
  const users: User[] = [];

  // Admin
  users.push({
    id: 'E001',
    name: 'Super Admin',
    role: 'Admin',
    department: 'Management',
    phone: '+91 9876543210',
    email: 'admin@ats.com',
    status: 'Active',
    avatar: 'SA',
    projects: []
  });

  // HOD
  users.push({
    id: 'E010',
    name: 'Department Head',
    role: 'HOD',
    department: 'Installation and commissioning',
    phone: '+91 9876543211',
    email: 'hod.ic@ats.com',
    status: 'Active',
    avatar: 'DH',
    projects: ['0022A252', '0023A008']
  });

  // Fixed Engineers
  users.push(
    { id: 'E100', name: 'Koustubh Deodhar', role: 'Engineer', department: 'Installation and commissioning', phone: '+91 9876500100', email: 'koustubh@ats.com', status: 'On-Site', avatar: 'KD', projects: ['0022A252'], latitude: 18.5205, longitude: 73.8568 },
    { id: 'E101', name: 'Hrushikesh Pandir', role: 'Engineer', department: 'Installation and commissioning', phone: '+91 9876500101', email: 'hrushikesh@ats.com', status: 'On-Site', avatar: 'HP', projects: ['0023A008'], latitude: 22.6110, longitude: 75.6795 },
    { id: 'E102', name: 'Vedang Dharamadhikari', role: 'Engineer', department: 'Installation and commissioning', phone: '+91 9876500102', email: 'vedang@ats.com', status: 'Leave', avatar: 'VD', projects: [] }
  );

  // Generate remaining
  const departments: Department[] = ['IT', 'R&D', 'Mechanical Design', 'Electrical Design', 'Electrical workshop', 'mech workshop', 'purchase', 'finance', 'HR & A', 'Installation and commissioning', 'Controls Dept'];
  
  for (let i = 103; i <= 500; i++) {
    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const statusOpts: any[] = ['On-Site', 'Office', 'Leave', 'Absent'];
    
    users.push({
      id: `E${i}`,
      name: `${fname} ${lname}`,
      role: 'Engineer',
      department: dept,
      phone: `+91 9876500${i.toString().padStart(3, '0')}`,
      email: `${fname.toLowerCase()}@ats.com`,
      status: statusOpts[Math.floor(Math.random() * statusOpts.length)],
      avatar: `${fname[0]}${lname[0]}`,
      projects: []
    });
  }

  return users;
};

export const mockUsers = generateMockUsers();
