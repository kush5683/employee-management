#!/usr/bin/env node

/**
 * Seed the MongoDB database with demo employees, shifts, time-off requests,
 * and availability windows sourced from the /data directory.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { connectToDatabase } from '../backend/src/db/mongo.js';
import { hashPassword } from '../backend/src/utils/password.js';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

async function loadJSON(filename) {
  const filePath = path.join(dataDir, filename);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function seed() {
  const { db } = await connectToDatabase();
  const employeesCol = db.collection('employees');
  const shiftsCol = db.collection('shifts');
  const timeOffCol = db.collection('time_off_requests');
  const availabilitiesCol = db.collection('availabilities');

  const employeesData = await loadJSON('employees.json');
  const credentialsData = await loadJSON('credentials.json');
  const shiftsData = await loadJSON('shifts.json');
  const timeOffData = await loadJSON('timeOffRequests.json');
  const availabilitiesData = await loadJSON('availabilities.json');

  const employeeIdMap = new Map();

  console.log('Clearing existing collections...');
  await shiftsCol.deleteMany({});
  await timeOffCol.deleteMany({});
  await availabilitiesCol.deleteMany({});
  await employeesCol.deleteMany({});

  console.log('Seeding employees...');
  const baseDocs = employeesData.map((employee) => ({
    employeeCode: employee.employeeId,
    name: employee.name,
    email: employee.email.toLowerCase(),
    role: employee.role,
    location: employee.location,
    hourlyRate: Number(employee.hourlyRate) || 0,
    active: Boolean(employee.active),
    managerCode: employee.managerId || null,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const insertResult = await employeesCol.insertMany(baseDocs);

  employeesData.forEach((employee, idx) => {
    const insertedId = insertResult.insertedIds[idx];
    if (!insertedId) {
      throw new Error(`Failed to insert employee ${employee.employeeId}`);
    }
    employeeIdMap.set(employee.employeeId, insertedId);
  });

  console.log('Linking manager relationships...');
  for (const employee of employeesData) {
    const employeeObjectId = employeeIdMap.get(employee.employeeId);
    const managerObjectId = employee.managerId ? employeeIdMap.get(employee.managerId) : null;
    await employeesCol.updateOne(
      { _id: employeeObjectId },
      {
        $set: {
          managerId: managerObjectId || null,
          updatedAt: new Date()
        }
      }
    );
  }

  console.log('Updating credentials...');
  for (const credential of credentialsData) {
    const employeeObjectId = employeeIdMap.get(credential.employeeId);
    if (!employeeObjectId) continue;

    const passwordHash =
      credential.password && credential.password.length
        ? await hashPassword(credential.password)
        : credential.passwordHash;

    if (!passwordHash) continue;

    await employeesCol.updateOne(
      { _id: employeeObjectId },
      {
        $set: {
          passwordHash,
          updatedAt: new Date()
        }
      }
    );
  }

  console.log('Seeding shifts...');
  if (shiftsData.length) {
    await shiftsCol.insertMany(
      shiftsData
        .map((shift) => ({
          ...shift,
          employeeId: employeeIdMap.get(shift.employeeId)?.toString() || shift.employeeId,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
        .filter((shift) => shift.employeeId)
    );
  }

  console.log('Seeding time off requests...');
  if (timeOffData.length) {
    await timeOffCol.insertMany(
      timeOffData
        .map((request) => ({
          ...request,
          employeeId: employeeIdMap.get(request.employeeId)?.toString() || request.employeeId,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
        .filter((request) => request.employeeId)
    );
  }

  console.log('Seeding availabilities...');
  if (availabilitiesData.length) {
    await availabilitiesCol.insertMany(
      availabilitiesData
        .map((row) => ({
          ...row,
          employeeId: employeeIdMap.get(row.employeeId)?.toString() || row.employeeId,
          dayOfWeek: Number(row.dayOfWeek),
          createdAt: new Date(),
          updatedAt: new Date()
        }))
        .filter((row) => row.employeeId && row.dayOfWeek >= 0)
    );
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Failed to seed database', error);
  process.exit(1);
});
