/**
 * Create or promote a platform admin user.
 *
 * Usage:
 *   npx tsx scripts/create-platform-admin.ts <email> <password> [firstName] [lastName]
 */
import { config } from 'dotenv';
config();

import dns from 'node:dns';
import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { hashPassword } from '../src/shared/auth/crypto.js';
import { normalizeEmail } from '../src/shared/validation/email.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { adminConsoleService } from '../src/modules/admin/admin-console.service.js';
import { ADMIN_PERMISSIONS } from '../src/modules/admin/require-admin.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch {
  // ignore
}

const [emailRaw, password, firstName = 'Huntlo', lastName = 'Admin'] = process.argv.slice(2);

if (!emailRaw || !password) {
  console.error(
    'Usage: npx tsx scripts/create-platform-admin.ts <email> <password> [firstName] [lastName]'
  );
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (check Backend/.env).');
  process.exit(1);
}

const email = normalizeEmail(emailRaw);

await connectDatabase();

try {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    existing.passwordHash = await hashPassword(password);
    existing.platformAdmin = true;
    existing.adminPermissions = [...ADMIN_PERMISSIONS];
    existing.memberStatus = 'active';
    existing.onboardingStatus = 'completed';
    if (!existing.emailVerifiedAt) existing.emailVerifiedAt = new Date();
    if (firstName) existing.firstName = firstName;
    if (lastName) existing.lastName = lastName;
    await existing.save();
    console.log(`Updated existing user to platform admin: ${email} (${existing._id})`);
  } else {
    const user = await adminConsoleService.createUser({
      email,
      password,
      firstName,
      lastName,
      organizationName: 'Huntlo Platform',
      role: 'owner',
      platformAdmin: true,
      adminPermissions: [...ADMIN_PERMISSIONS],
    });
    console.log(`Created platform admin: ${email} (${user.id})`);
  }
} finally {
  await disconnectDatabase();
  await mongoose.disconnect().catch(() => undefined);
}
