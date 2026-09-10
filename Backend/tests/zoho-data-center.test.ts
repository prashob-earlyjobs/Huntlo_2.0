import { describe, expect, it } from 'vitest';

import {
  dataCenterFromAccountsServer,
  dataCenterFromApiDomain,
  resolveZohoDataCenter,
} from '../src/providers/zoho/zoho.oauth.js';

describe('zoho data center resolution', () => {
  it('infers India from accounts-server and api_domain', () => {
    expect(dataCenterFromAccountsServer('https://accounts.zoho.in')).toBe('in');
    expect(dataCenterFromApiDomain('https://www.zohoapis.in')).toBe('in');
  });

  it('prefers India api_domain over a defaulted US dataCenter hint', () => {
    expect(
      resolveZohoDataCenter({
        dataCenter: 'com',
        apiDomain: 'https://www.zohoapis.in',
      })
    ).toBe('in');
  });

  it('uses location when present', () => {
    expect(
      resolveZohoDataCenter({
        location: 'in',
        dataCenter: 'com',
        apiDomain: 'https://www.zohoapis.com',
      })
    ).toBe('in');
  });
});
