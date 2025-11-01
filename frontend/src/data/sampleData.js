// ---- Sample Data Definitions -------------------------------------------------
// The frontend now depends on the backend for time off requests and shifts.
// This file only exports employee metadata so dropdowns and labels stay human
// friendly without extra API calls.

export const EMPLOYEES = [
  {
    id: 'emp-001',
    name: 'Jordan Miles',
    email: 'jordan.miles@example.com',
    role: 'Shift Supervisor',
    location: 'Boston HQ',
    hourlyRate: 28,
    active: true
  },
  {
    id: 'emp-002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'Barista',
    location: 'Cambridge Cafe',
    hourlyRate: 18.5,
    active: true
  },
  {
    id: 'emp-003',
    name: 'Andres Castillo',
    email: 'andres.castillo@example.com',
    role: 'Line Cook',
    location: 'Seaport Kitchen',
    hourlyRate: 20,
    active: false
  },
  {
    id: 'emp-004',
    name: 'Sasha Green',
    email: 'sasha.green@example.com',
    role: 'Prep Cook',
    location: 'Seaport Kitchen',
    hourlyRate: 17,
    active: true
  },
  {
    id: 'emp-005',
    name: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    role: 'Barista',
    location: 'Cambridge Cafe',
    hourlyRate: 19,
    active: true
  }
];
