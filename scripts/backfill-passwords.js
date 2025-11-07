#!/usr/bin/env node

/**
 * Backfill employee passwords.
 * Generates a temporary password for every employee document that does not yet
 * have a `passwordHash`, hashes it with the shared bcrypt helper, and prints
 * the credentials so they can be communicated securely to each user.
 */

import { randomBytes } from 'node:crypto';
import { connectToDatabase } from '../backend/src/db/mongo.js';
import { hashPassword } from '../backend/src/utils/password.js';

function generateTempPassword(name = '') {
  const prefix = name
    .trim()
    .split(/\s+/)
    .shift()
    ?.slice(0, 5)
    .toLowerCase() || 'user';
  const suffix = randomBytes(3).toString('hex');
  return `${prefix}-${suffix}`;
}

async function main() {
  const { client, db } = await connectToDatabase();
  const employees = db.collection('employees');

  const cursor = employees.find({
    $or: [
      { passwordHash: { $exists: false } },
      { passwordHash: { $eq: null } },
      { passwordHash: { $eq: '' } }
    ]
  });

  const issued = [];

  for await (const employee of cursor) {
    const tempPassword = generateTempPassword(employee.name);
    const passwordHash = await hashPassword(tempPassword);

    await employees.updateOne(
      { _id: employee._id },
      {
        $set: {
          passwordHash,
          updatedAt: new Date()
        }
      }
    );

    issued.push({
      name: employee.name,
      email: employee.email,
      password: tempPassword
    });
  }

  await client.close();

  if (!issued.length) {
    console.log('All employees already have passwords; no updates performed.');
    return;
  }

  console.log('Temporary passwords issued (share securely and rotate after first login):');
  for (const record of issued) {
    console.log(`- ${record.name} <${record.email}>: ${record.password}`);
  }
}

main().catch((error) => {
  console.error('Failed to backfill employee passwords', error);
  process.exit(1);
});
