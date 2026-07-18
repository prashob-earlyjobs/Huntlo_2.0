import {
  fetchCalendlyEventTypes,
  fetchCalendlyScheduledEvents,
  fetchCalendlyEventInvitees,
} from '../../providers/calendly/calendly.client.js';
import { AppError } from '../../shared/errors/app-error.js';
import { getOrgCalendlyCredentials } from './calendly-credentials.js';
import { interviewsService } from './interview.service.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';

export const schedulingSyncService = {
  async listEventTypes(organizationId: string, userId: string) {
    const creds = await getOrgCalendlyCredentials(organizationId, userId);
    if (!creds) {
      throw new AppError(
        400,
        'CALENDLY_NOT_CONNECTED',
        'Connect Calendly in Integrations before listing event types.'
      );
    }
    return fetchCalendlyEventTypes(creds.personalAccessToken, creds.userUri || undefined);
  },

  async sync(organizationId: string, userId: string, input: {
    eventTypeUri?: string;
    minStartTime?: string;
  } = {}) {
    const creds = await getOrgCalendlyCredentials(organizationId, userId);
    if (!creds) {
      throw new AppError(
        400,
        'CALENDLY_NOT_CONNECTED',
        'Connect Calendly in Integrations before syncing bookings.'
      );
    }

    let userUri = creds.userUri;
    if (!userUri) {
      const { fetchCalendlyUser } = await import('../../providers/calendly/calendly.client.js');
      const user = await fetchCalendlyUser(creds.personalAccessToken);
      userUri = user.uri;
    }

    const events = await fetchCalendlyScheduledEvents(creds.personalAccessToken, {
      userUri: userUri!,
      eventTypeUri: input.eventTypeUri,
      minStartTime: input.minStartTime,
    });

    let synced = 0;
    for (const event of events) {
      const invitees = await fetchCalendlyEventInvitees(
        creds.personalAccessToken,
        String(event.uri || '')
      );
      for (const invitee of invitees) {
        const doc = await interviewsService.upsertFromCalendlyInvitee({
          organizationId,
          event,
          invitee,
          source: 'sync',
        });
        if (doc) synced += 1;
      }
    }

    await UserIntegrationModel.updateOne(
      { _id: creds.integrationId },
      { $set: { lastSyncAt: new Date() } }
    );

    return { synced, message: `Synced ${synced} Calendly booking(s).` };
  },
};
