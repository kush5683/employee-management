const employees = [
  { employeeId: "EMP001", name: "Jordan Miles", email: "jordan.miles@example.com", role: "Manager", location: "Boston HQ", hourlyRate: 28, active: true, managerId: null },
  { employeeId: "EMP002", name: "Priya Patel", email: "priya.patel@example.com", role: "Employee", location: "Cambridge Cafe", hourlyRate: 18.5, active: true, managerId: "EMP001" },
  { employeeId: "EMP003", name: "Andres Castillo", email: "andres.castillo@example.com", role: "Employee", location: "Seaport Kitchen", hourlyRate: 20, active: false, managerId: "EMP001" },
  { employeeId: "EMP004", name: "Sasha Green", email: "sasha.green@example.com", role: "Employee", location: "Seaport Kitchen", hourlyRate: 17, active: true, managerId: "EMP001" },
  { employeeId: "EMP005", name: "Marcus Lee", email: "marcus.lee@example.com", role: "Employee", location: "Cambridge Cafe", hourlyRate: 19, active: true, managerId: "EMP001" }
];

const credentials = [
  { employeeId: "EMP001", passwordHash: "$2a$10$WV.wYT38gcb5NAgwY6fjgeAmK.IiivvBQKgWxCyqoPOOCIH/oXque", role: "manager" },
  { employeeId: "EMP002", passwordHash: "$2a$10$lAzi.k8dm7srWizdcUqZG.MAAH8oiQPx8UC.JZItQFfqRZxb1uGVm", role: "employee" },
  { employeeId: "EMP003", passwordHash: "$2a$10$.MEm6d5t.R3JGs6Ea02KyeOx8iCC5pk34YVXopzDY56NUyyZ.Y2mq", role: "employee" },
  { employeeId: "EMP004", passwordHash: "$2a$10$9qgbylZAUqGrXHrrlgyVQO/EPYXL5Y5u0j51ZmGtLFmPURE3MvblC", role: "employee" },
  { employeeId: "EMP005", passwordHash: "$2a$10$5iaJFwHXP5Sa60z1D70.uua9PMML/rD4Oj1TmgCEHApgNaG692NvO", role: "employee" }
];

const shifts = [
  { employeeId: "EMP002", date: "2024-06-10", startTime: "07:00", endTime: "13:00", location: "Cambridge Cafe", status: "scheduled" },
  { employeeId: "EMP002", date: "2024-06-03", startTime: "12:00", endTime: "18:00", location: "Cambridge Cafe", status: "in-progress" },
  { employeeId: "EMP003", date: "2024-05-15", startTime: "16:00", endTime: "22:00", location: "Seaport Kitchen", status: "completed" },
  { employeeId: "EMP003", date: "2024-06-18", startTime: "15:00", endTime: "21:00", location: "Seaport Kitchen", status: "scheduled" },
  { employeeId: "EMP004", date: "2024-05-28", startTime: "09:00", endTime: "17:00", location: "Seaport Kitchen", status: "cancelled" },
  { employeeId: "EMP005", date: "2024-05-30", startTime: "06:00", endTime: "12:00", location: "Cambridge Cafe", status: "completed" },
  { employeeId: "EMP005", date: "2024-06-12", startTime: "10:00", endTime: "16:00", location: "Cambridge Cafe", status: "scheduled" },
  { employeeId: "EMP001", date: "2024-06-05", startTime: "08:00", endTime: "16:00", location: "Boston HQ", status: "scheduled" }
];

const timeOffRequests = [
  { employeeId: "EMP002", startDate: "2024-05-21", endDate: "2024-05-23", reason: "Family trip", status: "approved" },
  { employeeId: "EMP002", startDate: "2024-06-14", endDate: "2024-06-16", reason: "Sister's graduation", status: "pending" },
  { employeeId: "EMP003", startDate: "2024-05-28", endDate: "2024-05-30", reason: "Medical appointment", status: "approved" },
  { employeeId: "EMP004", startDate: "2024-06-01", endDate: "2024-06-02", reason: "Weekend trip", status: "rejected" },
  { employeeId: "EMP005", startDate: "2024-06-20", endDate: "2024-06-22", reason: "Moving apartments", status: "pending" },
  { employeeId: "EMP001", startDate: "2024-07-04", endDate: "2024-07-05", reason: "Holiday PTO", status: "cancelled" }
];

const availabilities = [
  { employeeId: "EMP001", dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  { employeeId: "EMP001", dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
  { employeeId: "EMP001", dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
  { employeeId: "EMP001", dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
  { employeeId: "EMP001", dayOfWeek: 5, startTime: "09:00", endTime: "15:00" },
  { employeeId: "EMP002", dayOfWeek: 1, startTime: "06:00", endTime: "14:00" },
  { employeeId: "EMP002", dayOfWeek: 2, startTime: "12:00", endTime: "20:00" },
  { employeeId: "EMP002", dayOfWeek: 4, startTime: "08:00", endTime: "16:00" },
  { employeeId: "EMP002", dayOfWeek: 5, startTime: "07:00", endTime: "13:00" },
  { employeeId: "EMP002", dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
  { employeeId: "EMP003", dayOfWeek: 1, startTime: "15:00", endTime: "22:00" },
  { employeeId: "EMP003", dayOfWeek: 2, startTime: "15:00", endTime: "22:00" },
  { employeeId: "EMP003", dayOfWeek: 3, startTime: "15:00", endTime: "22:00" },
  { employeeId: "EMP003", dayOfWeek: 5, startTime: "12:00", endTime: "18:00" },
  { employeeId: "EMP004", dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
  { employeeId: "EMP004", dayOfWeek: 2, startTime: "08:00", endTime: "16:00" },
  { employeeId: "EMP004", dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
  { employeeId: "EMP004", dayOfWeek: 4, startTime: "08:00", endTime: "16:00" },
  { employeeId: "EMP004", dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
  { employeeId: "EMP005", dayOfWeek: 2, startTime: "06:00", endTime: "14:00" },
  { employeeId: "EMP005", dayOfWeek: 3, startTime: "06:00", endTime: "14:00" },
  { employeeId: "EMP005", dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
  { employeeId: "EMP005", dayOfWeek: 5, startTime: "07:00", endTime: "13:00" },
  { employeeId: "EMP005", dayOfWeek: 6, startTime: "08:00", endTime: "14:00" }
];

const dbName = process.env.MONGO_INITDB_DATABASE || "employeeManagement";
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
  return ref ? ref.valueOf() : code;
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

print('Mongo seed complete.');
