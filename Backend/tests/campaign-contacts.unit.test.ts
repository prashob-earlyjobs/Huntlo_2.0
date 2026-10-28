import { describe, expect, it } from 'vitest';

import { AppError } from '../src/shared/errors/app-error.js';
import {
  buildSampleContactsCsv,
  parseCampaignContactsCsv,
  requiredSampleColumns,
} from '../src/modules/vocallabs/campaign-contacts.js';

const columns = ['name', 'phone', 'brand_name'];

function messageFor(csv: string, required = columns): string {
  try {
    parseCampaignContactsCsv(csv, required);
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    return (error as AppError).message;
  }
  return '';
}

describe('parseCampaignContactsCsv', () => {
  it('adds +91 when the phone is a local number and keeps an existing +', () => {
    expect(
      parseCampaignContactsCsv(
        ['name,phone,brand_name', 'Ada,9876543210,Huntlo', 'Neha,+91 98765 43211,Huntlo', 'Gokul,919876543212,Huntlo'].join('\n'),
        columns
      ).map((contact) => contact.phone)
    ).toEqual(['+919876543210', '+919876543211', '+919876543212']);
  });

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

  it('reports one message when a file has several problems', () => {
    expect(
      messageFor(
        ['name,phone,city', 'Ada,+919876543210,Mumbai', ',98765,'].join('\n'),
        ['name', 'phone', 'brand_name']
      )
    ).toBe('This file has 4 problems and cannot be imported.');
  });

  it('reports a repeated phone number', () => {
    expect(
      messageFor(
        ['name,phone,brand_name', 'Ada,+919876543210,Huntlo', 'Neha,+919876543210,Huntlo'].join('\n')
      )
    ).toBe('Row 3 repeats the phone number from row 2.');
  });

  it('reports a repeated column name', () => {
    expect(messageFor('name,phone,phone\nAda,+919876543210,+919876543210')).toBe(
      'This file has 2 problems and cannot be imported.'
    );
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
