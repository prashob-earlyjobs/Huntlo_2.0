/**
 * Temp: print Zoho Mail access token + account id for gateway / API testing.
 *
 * From Backend:
 *   npx tsx scripts/_tmp-zoho-access-token.ts
 *   npx tsx scripts/_tmp-zoho-access-token.ts you@domain.com
 *
 * Delete after testing — prints live secrets to the terminal.
 */
import { config } from 'dotenv';
config();

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { decryptSecret } from '../src/modules/integrations/credentials.js';
import { UserIntegrationModel } from '../src/modules/integrations/user-integration.model.js';
import { refreshZohoAccessToken } from '../src/providers/zoho/zoho.oauth.js';

const emailFilter = (process.argv[2] || '').trim().toLowerCase();

await connectDatabase();

const filter: Record<string, unknown> = { provider: 'zoho-mail' };
if (emailFilter) filter.email = emailFilter;

const rows = await UserIntegrationModel.find(filter).sort({ updatedAt: -1 }).lean();

if (!rows.length) {
  console.error(
    emailFilter
      ? `No Zoho Mail integration for ${emailFilter}`
      : 'No Zoho Mail integrations in DB'
  );
  await disconnectDatabase();
  process.exit(1);
}

for (const row of rows) {
  let access = decryptSecret(row.encryptedAccessToken as never);
  const refresh = decryptSecret(row.encryptedRefreshToken as never);
  const expiresAt = row.tokenExpiresAt ? new Date(row.tokenExpiresAt) : null;
  const expired = !expiresAt || expiresAt.getTime() <= Date.now() + 60_000;
  const configObj = (row.config || {}) as {
    zohoDataCenter?: string;
    zohoAccountId?: string;
    zohoAuthMode?: string;
  };
  const dataCenter = configObj.zohoDataCenter || 'com';
  const accountId =
    String(configObj.zohoAccountId || row.providerAccountId || '').trim() ||
    '(none)';

  if (expired && refresh) {
    try {
      const tokens = await refreshZohoAccessToken(refresh, dataCenter);
      access = String(tokens.access_token || access || '');
      console.log('(refreshed expired token)');
    } catch (error) {
      console.error(
        'refresh failed:',
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log('---');
  console.log('id:           ', String(row._id));
  console.log('email:        ', row.email || '(none)');
  console.log('status:       ', row.status);
  console.log('authMode:     ', configObj.zohoAuthMode || '(oauth)');
  console.log('dataCenter:   ', dataCenter);
  console.log('accountId:    ', accountId);
  console.log('fromAddress:  ', row.email || '(none)');
  console.log('expiresAt:    ', expiresAt?.toISOString() || '(none)');
  console.log('access_token:\n' + (access || '(none)'));
  console.log('');
}

await disconnectDatabase();
