import { describe, expect, it } from 'vitest';

import { AppError } from '../src/shared/errors/app-error.js';
import {
  buildSampleContactsCsv,
  parseCampaignContactsCsv,
  requiredSampleColumns,
} from '../src/modules/vocallabs/campaign-contacts.js';

const columns = ['name', 'phone', 'brand_name'];

function issuesFor(csv: string, required = columns): string[] {
  try {
    parseCampaignContactsCsv(csv, required);
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    return ((error as AppError).details ?? []).map((detail) => detail.message);
  }
  return [];
}

describe('parseCampaignContactsCsv', () => {
  it('reads required columns and keeps the variable values', () => {
    expect(
      parseCampaignContactsCsv(
        ['name,phone,brand_name', 'Ada,+919876543210,Huntlo'].join('\n'),
        columns
      )
    ).toEqual([
      {
        name: 'Ada',
        phone: '+919876543210',
        email: '',
        data: { brand_name: 'Huntlo' },
      },
    ]);
  });

  it('reports missing columns, extra columns, empty cells, and bad phones together', () => {
    expect(
      issuesFor(
        ['name,phone,city', 'Ada,+919876543210,Mumbai', ',98765,'].join('\n'),
        ['name', 'phone', 'brand_name']
      )
    ).toEqual([
      'Missing columns: brand_name.',
      'Remove extra columns: city.',
      'Row 3 is missing name.',
      'Row 3 phone must start with + and include the country code.',
    ]);
  });

  it('reports a repeated phone number', () => {
    expect(
      issuesFor(
        ['name,phone,brand_name', 'Ada,+919876543210,Huntlo', 'Neha,+919876543210,Huntlo'].join('\n')
      )
    ).toEqual(['Row 3 repeats the phone number from row 2.']);
  });

  it('reports a repeated column name', () => {
    expect(issuesFor('name,phone,phone\nAda,+919876543210,+919876543210')).toEqual([
      'Column "phone" is listed more than once.',
      'Missing columns: brand_name.',
    ]);
  });

  it('puts every required variable in the sample header', () => {
    const sampleColumns = requiredSampleColumns({
      texts: ['Hello {{name}}, this is {{agent_name}} from {{brand_name}}.'],
      inputsNeeded: { clinic_name: 'about', contact_id: 'hidden', name: 'about' },
    });

    expect(sampleColumns).toEqual(['name', 'phone', 'agent_name', 'brand_name', 'clinic_name']);
    expect(buildSampleContactsCsv(sampleColumns).split('\n')[0]).toBe(
      'name,phone,agent_name,brand_name,clinic_name'
    );
  });
});
