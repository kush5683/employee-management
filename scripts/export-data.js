#!/usr/bin/env node

// Export curated sample data into JSON files to seed Mongo collections.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = join(process.cwd(), 'data');
mkdirSync(outputDir, { recursive: true });

const employees = [
  {
    employeeId: 'EMP001',
    name: 'Jordan Miles',
    email: 'jordan.miles@example.com',
    role: 'Shift Supervisor',
    location: 'Boston HQ',
    hourlyRate: 28,
    active: true,
    managerId: null
  },
  {
    employeeId: 'EMP002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'Barista',
    location: 'Cambridge Cafe',
    hourlyRate: 18.5,
    active: true,
    managerId: 'EMP001'
  },
  {
    employeeId: 'EMP003',
    name: 'Andres Castillo',
    email: 'andres.castillo@example.com',
    role: 'Line Cook',
    location: 'Seaport Kitchen',
    hourlyRate: 20,
    active: false,
    managerId: 'EMP001'
  },
  {
    employeeId: 'EMP004',
    name: 'Sasha Green',
    email: 'sasha.green@example.com',
    role: 'Prep Cook',
    location: 'Seaport Kitchen',
    hourlyRate: 17,
    active: true,
    managerId: 'EMP001'
  },
  {
    employeeId: 'EMP005',
    name: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    role: 'Barista',
    location: 'Cambridge Cafe',
    hourlyRate: 19,
    active: true,
    managerId: 'EMP001'
  }
];

const shifts = [
  {
    employeeId: 'EMP002',
    date: '2024-05-20',
    startTime: '08:00',
    endTime: '14:00',
    location: 'Cambridge Cafe',
    status: 'scheduled'
  },
  {
    employeeId: 'EMP002',
    date: '2024-05-22',
    startTime: '12:00',
    endTime: '18:00',
    location: 'Cambridge Cafe',
    status: 'scheduled'
  },
  {
    employeeId: 'EMP003',
    date: '2024-05-21',
    startTime: '16:00',
    endTime: '22:00',
    location: 'Seaport Kitchen',
    status: 'scheduled'
  },
  {
    employeeId: 'EMP004',
    date: '2024-05-22',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Seaport Kitchen',
    status: 'scheduled'
  },
  {
    employeeId: 'EMP005',
    date: '2024-05-20',
    startTime: '07:00',
    endTime: '13:00',
    location: 'Cambridge Cafe',
    status: 'completed'
  }
];

const timeOffRequests = [
  {
    employeeId: 'EMP002',
    startDate: '2024-05-21',
    endDate: '2024-05-23',
    reason: 'Family trip',
    status: 'approved'
  },
  {
    employeeId: 'EMP003',
    startDate: '2024-05-28',
    endDate: '2024-05-30',
    reason: 'Medical appointment',
    status: 'pending'
  }
];

const credentials = [
  {
    employeeId: 'EMP001',
    passwordHash: '$2a$10$EoWzXlzr16nbe9ySg88OEOmxfT1UY8ailqXFz3vGN9ofuUBev5nYe',
    role: 'manager'
  },
  {
    employeeId: 'EMP002',
    passwordHash: '$2a$10$M8eAaHp1oD7f3.7XJoH9MuGxYZcQJUO2cSAB1ytY1/6KXOvNhbbXG',
    role: 'employee'
  },
  {
    employeeId: 'EMP003',
    passwordHash: '$2a$10$pbkXx2oylZMhUlCT3VkOqObkkpFmSPrbr30YIOCwVDDDeWGPAHDVO',
    role: 'employee'
  },
  {
    employeeId: 'EMP004',
    passwordHash: '$2a$10$4Ha4qzM7gc3KJ2YMBX1A9uLJfnLyC3xaQa58aeGeq/QAdzTZziEtq',
    role: 'employee'
  },
  {
    employeeId: 'EMP005',
    passwordHash: '$2a$10$SB7GuiRl6VwBEm90LkAMPuzs4Zz2oxEd4pqco3ptAOEjun9wioMxG',
    role: 'employee'
  }
];

writeFileSync(join(outputDir, 'employees.json'), JSON.stringify(employees, null, 2));
writeFileSync(join(outputDir, 'shifts.json'), JSON.stringify(shifts, null, 2));
writeFileSync(join(outputDir, 'timeOffRequests.json'), JSON.stringify(timeOffRequests, null, 2));
writeFileSync(join(outputDir, 'credentials.json'), JSON.stringify(credentials, null, 2));

console.log('Export complete. JSON files written to', outputDir);
