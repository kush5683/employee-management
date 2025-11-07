const TOTAL_EMPLOYEES = 1000;
const TARGET_MANAGER_COUNT = 40;
const DEFAULT_PASSWORD_HASH = '$2a$10$Nlw8jki8/NeJ5z6Voe16mudyg80Hrhwz/Lt8ECMfS7B2PudCpkfFS'; // bcrypt hash for "changeme123"

const baseEmployees = [
  { employeeId: 'EMP001', name: 'Jordan Miles', email: 'jordan.miles@example.com', role: 'Manager', location: 'Boston HQ', hourlyRate: 28, active: true, managerId: null },
  { employeeId: 'EMP002', name: 'Priya Patel', email: 'priya.patel@example.com', role: 'Employee', location: 'Cambridge Cafe', hourlyRate: 18.5, active: true, managerId: 'EMP001' },
  { employeeId: 'EMP003', name: 'Andres Castillo', email: 'andres.castillo@example.com', role: 'Employee', location: 'Seaport Kitchen', hourlyRate: 20, active: false, managerId: 'EMP001' },
  { employeeId: 'EMP004', name: 'Sasha Green', email: 'sasha.green@example.com', role: 'Employee', location: 'Seaport Kitchen', hourlyRate: 17, active: true, managerId: 'EMP001' },
  { employeeId: 'EMP005', name: 'Marcus Lee', email: 'marcus.lee@example.com', role: 'Employee', location: 'Cambridge Cafe', hourlyRate: 19, active: true, managerId: 'EMP001' }
];

const baseCredentials = [
  { employeeId: 'EMP001', passwordHash: '$2a$10$WV.wYT38gcb5NAgwY6fjgeAmK.IiivvBQKgWxCyqoPOOCIH/oXque', role: 'manager' },
  { employeeId: 'EMP002', passwordHash: '$2a$10$lAzi.k8dm7srWizdcUqZG.MAAH8oiQPx8UC.JZItQFfqRZxb1uGVm', role: 'employee' },
  { employeeId: 'EMP003', passwordHash: '$2a$10$.MEm6d5t.R3JGs6Ea02KyeOx8iCC5pk34YVXopzDY56NUyyZ.Y2mq', role: 'employee' },
  { employeeId: 'EMP004', passwordHash: '$2a$10$9qgbylZAUqGrXHrrlgyVQO/EPYXL5Y5u0j51ZmGtLFmPURE3MvblC', role: 'employee' },
  { employeeId: 'EMP005', passwordHash: '$2a$10$5iaJFwHXP5Sa60z1D70.uua9PMML/rD4Oj1TmgCEHApgNaG692NvO', role: 'employee' }
];

const firstNames = [
  'alex', 'bailey', 'casey', 'devon', 'elliot', 'finley', 'harper', 'indigo', 'kai', 'lex',
  'morgan', 'nova', 'owen', 'phoebe', 'quinn', 'river', 'sloane', 'taylor', 'ulises', 'vida',
  'wyatt', 'xavier', 'yara', 'zane', 'aria', 'blair', 'cameron', 'drew', 'ember', 'felix'
];

const lastNames = [
  'adams', 'bennett', 'carson', 'diaz', 'ellis', 'fletcher', 'garcia', 'hayes', 'iverson', 'jenkins',
  'keane', 'lawson', 'maddox', 'nguyen', 'owens', 'palmer', 'quincy', 'ramirez', 'shan', 'thorpe',
  'upton', 'vega', 'wells', 'xu', 'young', 'zimmer', 'carter', 'brooks', 'nash', 'porter'
];

const locations = [
  'Boston HQ',
  'Cambridge Cafe',
  'Seaport Kitchen',
  'Back Bay Cafe',
  'Fenway Stand',
  'Somerville Test Kitchen',
  'South End Market',
  'Harbor Bistro'
];

const managerRoles = ['General Manager', 'Shift Supervisor', 'Operations Lead', 'Regional Manager'];
const employeeRoles = ['Barista', 'Line Cook', 'Prep Cook', 'Host', 'Server', 'Cashier', 'Shift Lead', 'Inventory Specialist'];

const shiftStartTimes = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '15:00'];
const shiftDurations = [4, 5, 6, 7, 8];
const shiftStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
const timeOffReasons = ['Family trip', 'Medical appointment', 'Travel', 'Conference', 'Personal day', 'Celebration', 'Errands'];
const availabilityStartTimes = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '13:00', '14:00', '15:00'];
const availabilityDurations = [4, 5, 6, 7, 8];
const timeOffStatuses = ['pending', 'approved', 'rejected', 'cancelled'];

const employees = baseEmployees.slice();
const credentials = baseCredentials.slice();
const managers = employees.filter((emp) => emp.managerId === null).map((emp) => emp.employeeId);

const rng = (function () {
  let seed = 42;
  return function () {
    seed = (1664525 * seed + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
})();

function padNumber(num, width) {
  const str = String(num);
  return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
}

function title(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function pick(list) {
  return list[Math.floor(rng() * list.length)];
}

function addHours(time, hours) {
  const parts = time.split(':').map(Number);
  const total = parts[0] + hours;
  const clamped = Math.min(total, 23);
  return padNumber(clamped, 2) + ':' + padNumber(parts[1], 2);
}

function buildDate(month, day) {
  const normalizedDay = ((day - 1) % 28) + 1;
  const normalizedMonth = ((month - 4) % 6) + 4; // months 4-9
  return `2024-${padNumber(normalizedMonth, 2)}-${padNumber(normalizedDay, 2)}`;
}

function createSyntheticEmployee(seq) {
  const employeeId = `EMP${padNumber(seq, 3)}`;
  const shouldBeManager = (managers.length < TARGET_MANAGER_COUNT && rng() < 0.6) || rng() < 0.05;
  const managerId = shouldBeManager || managers.length === 0 ? null : pick(managers);

  if (shouldBeManager) {
    managers.push(employeeId);
  }

  const first = pick(firstNames);
  const last = pick(lastNames);
  const role = shouldBeManager ? pick(managerRoles) : pick(employeeRoles);
  const email = `${first}.${last}${padNumber(seq % 997, 3)}@example.com`.toLowerCase();

  return {
    employeeId,
    name: `${title(first)} ${title(last)}`,
    email,
    role,
    location: pick(locations),
    hourlyRate: +(16 + Math.floor(rng() * 15)),
    active: rng() > 0.05,
    managerId
  };
}

while (employees.length < TOTAL_EMPLOYEES) {
  const seq = employees.length + 1;
  const employee = createSyntheticEmployee(seq);
  employees.push(employee);
  credentials.push({
    employeeId: employee.employeeId,
    passwordHash: employee.managerId === null ? DEFAULT_PASSWORD_HASH : DEFAULT_PASSWORD_HASH,
    role: employee.managerId === null ? 'manager' : 'employee'
  });
}

const shifts = [];
const timeOffRequests = [];
const availabilities = [];

employees.forEach((employee, index) => {
  const shiftCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < shiftCount; i += 1) {
    const dayOffset = index * 3 + i * 5;
    const date = buildDate(4 + (dayOffset % 6), (dayOffset % 28) + 1);
    const startTime = pick(shiftStartTimes);
    const endTime = addHours(startTime, pick(shiftDurations));
    shifts.push({
      employeeId: employee.employeeId,
      date,
      startTime,
      endTime,
      location: employee.location,
      status: pick(shiftStatuses)
    });
  }

  if (rng() < 0.25) {
    const startDay = ((index * 3) % 20) + 1;
    const month = 7 + (index % 2);
    const duration = 1 + Math.floor(rng() * 3);
    const startDate = `2024-${padNumber(month, 2)}-${padNumber(startDay, 2)}`;
    const endDate = `2024-${padNumber(month, 2)}-${padNumber(Math.min(startDay + duration, 28), 2)}`;
    timeOffRequests.push({
      employeeId: employee.employeeId,
      startDate,
      endDate,
      reason: pick(timeOffReasons),
      status: pick(timeOffStatuses)
    });
  }

  const availabilityDays = new Set();
  while (availabilityDays.size < 3) {
    availabilityDays.add(1 + Math.floor(rng() * 7));
  }
  availabilityDays.forEach((dayOfWeek) => {
    const startTime = pick(availabilityStartTimes);
    const endTime = addHours(startTime, pick(availabilityDurations));
    availabilities.push({
      employeeId: employee.employeeId,
      dayOfWeek,
      startTime,
      endTime
    });
  });
});

const dbName = process.env.MONGO_INITDB_DATABASE || 'employeeManagement';
const database = db.getSiblingDB(dbName);

database.employees.drop();
database.shifts.drop();
database.time_off_requests.drop();
database.availabilities.drop();

const employeeDocs = employees.map((employee) => ({
  employeeCode: employee.employeeId,
  name: employee.name,
  email: employee.email.toLowerCase(),
  role: employee.role,
  location: employee.location,
  hourlyRate: Number(employee.hourlyRate) || 0,
  active: Boolean(employee.active),
  eligible: true,
  isManager: employee.managerId === null,
  managerCode: employee.managerId || null,
  createdAt: new Date(),
  updatedAt: new Date()
}));

const inserted = database.employees.insertMany(employeeDocs);
const idMap = {};

employees.forEach((employee, index) => {
  idMap[employee.employeeId] = inserted.insertedIds[index];
});

employees.forEach((employee) => {
  database.employees.updateOne(
    { _id: idMap[employee.employeeId] },
    {
      $set: {
        managerId: employee.managerId ? idMap[employee.managerId] : null,
        updatedAt: new Date()
      }
    }
  );
});

const credentialMap = {};
credentials.forEach((cred) => {
  credentialMap[cred.employeeId] = cred;
});

Object.entries(idMap).forEach(([employeeCode, objectId]) => {
  const cred = credentialMap[employeeCode];
  if (cred?.passwordHash) {
    database.employees.updateOne(
      { _id: objectId },
      { $set: { passwordHash: cred.passwordHash, updatedAt: new Date() } }
    );
  }
});

const toEmployeeRef = (code) => {
  const ref = idMap[code];
  return ref ? ref.toString() : code;
};

if (shifts.length) {
  database.shifts.insertMany(
    shifts.map((shift) => ({
      ...shift,
      employeeId: toEmployeeRef(shift.employeeId),
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
}

if (timeOffRequests.length) {
  database.time_off_requests.insertMany(
    timeOffRequests.map((request) => ({
      ...request,
      employeeId: toEmployeeRef(request.employeeId),
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
}

if (availabilities.length) {
  database.availabilities.insertMany(
    availabilities.map((row) => ({
      ...row,
      employeeId: toEmployeeRef(row.employeeId),
      dayOfWeek: Number(row.dayOfWeek),
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
}

print(`Mongo seed complete. Inserted ${employees.length} employees, ${shifts.length} shifts, ${timeOffRequests.length} time off requests, and ${availabilities.length} availability records.`);

