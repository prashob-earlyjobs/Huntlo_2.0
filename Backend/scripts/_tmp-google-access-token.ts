/**
 * Temp: print Gmail access token(s) already stored on userintegrations.
 *
 * From Backend:
 *   npx tsx scripts/_tmp-google-access-token.ts
 *   npx tsx scripts/_tmp-google-access-token.ts you@gmail.com
 */
import { config } from 'dotenv';
config();

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { decryptSecret } from '../src/modules/integrations/credentials.js';
import { UserIntegrationModel } from '../src/modules/integrations/user-integration.model.js';
import { refreshGmailAccessToken } from '../src/providers/gmail/gmail.oauth.js';

const emailFilter = (process.argv[2] || '').trim().toLowerCase();

await connectDatabase();

const filter: any = { provider: 'gmail' };
if (emailFilter) filter.email = emailFilter;

const rows = await UserIntegrationModel.find(filter).sort({ updatedAt: -1 }).lean();

if (!rows.length) {
  console.error(emailFilter ? `No Gmail integration for ${emailFilter}` : 'No Gmail integrations in DB');
  await disconnectDatabase();
  process.exit(1);
}

for (const row of rows) {
  let access = decryptSecret(row.encryptedAccessToken as any);
  const refresh = decryptSecret(row.encryptedRefreshToken as any);
  const expiresAt = row.tokenExpiresAt ? new Date(row.tokenExpiresAt) : null;
  const expired = !expiresAt || expiresAt.getTime() <= Date.now() + 60_000;

  if (expired && refresh) {
    try {
      const tokens: any = await refreshGmailAccessToken(refresh);
      access = String(tokens.access_token || access || '');
      console.log('(refreshed expired token)');
    } catch (error) {
      console.error('refresh failed:', error instanceof Error ? error.message : error);
    }
  }

  console.log('---');
  console.log('id:         ', String(row._id));
  console.log('email:      ', row.email);
  console.log('status:     ', row.status);
  console.log('expiresAt:  ', expiresAt?.toISOString() || '(none)');
  console.log('access_token:\n' + (access || '(none)'));
  console.log('');
}

await disconnectDatabase();
