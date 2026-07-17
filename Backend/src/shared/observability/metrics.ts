export type WebhookMetricsSnapshot = {
  received: number;
  accepted: number;
  duplicate: number;
  rejected: number;
  processed: number;
  failed: number;
  byProvider: Record<string, { received: number; processed: number; failed: number }>;
};

class WebhookMetrics {
  received = 0;
  accepted = 0;
  duplicate = 0;
  rejected = 0;
  processed = 0;
  failed = 0;
  byProvider: Record<string, { received: number; processed: number; failed: number }> = {};

  private bumpProvider(provider: string) {
    if (!this.byProvider[provider]) {
      this.byProvider[provider] = { received: 0, processed: 0, failed: 0 };
    }
    return this.byProvider[provider]!;
  }

  recordReceived(provider: string) {
    this.received += 1;
    this.bumpProvider(provider).received += 1;
  }

  recordAccepted(provider: string) {
    this.accepted += 1;
    void provider;
  }

  recordDuplicate(provider: string) {
    this.duplicate += 1;
    void provider;
  }

  recordRejected(provider: string) {
    this.rejected += 1;
    void provider;
  }

  recordProcessed(provider: string) {
    this.processed += 1;
    this.bumpProvider(provider).processed += 1;
  }

  recordFailed(provider: string) {
    this.failed += 1;
    this.bumpProvider(provider).failed += 1;
  }

  snapshot(): WebhookMetricsSnapshot {
    return {
      received: this.received,
      accepted: this.accepted,
      duplicate: this.duplicate,
      rejected: this.rejected,
      processed: this.processed,
      failed: this.failed,
      byProvider: { ...this.byProvider },
    };
  }
}

export const webhookMetrics = new WebhookMetrics();

export type CampaignDeliveryMetricsSnapshot = {
  sent: number;
  delivered: number;
  failed: number;
  skipped: number;
  byChannel: Record<string, { sent: number; failed: number }>;
};

class CampaignDeliveryMetrics {
  sent = 0;
  delivered = 0;
  failed = 0;
  skipped = 0;
  byChannel: Record<string, { sent: number; failed: number }> = {};

  private bump(channel: string) {
    if (!this.byChannel[channel]) {
      this.byChannel[channel] = { sent: 0, failed: 0 };
    }
    return this.byChannel[channel]!;
  }

  recordSent(channel: string) {
    this.sent += 1;
    this.bump(channel).sent += 1;
  }

  recordDelivered() {
    this.delivered += 1;
  }

  recordFailed(channel: string) {
    this.failed += 1;
    this.bump(channel).failed += 1;
  }

  recordSkipped() {
    this.skipped += 1;
  }

  snapshot(): CampaignDeliveryMetricsSnapshot {
    return {
      sent: this.sent,
      delivered: this.delivered,
      failed: this.failed,
      skipped: this.skipped,
      byChannel: { ...this.byChannel },
    };
  }
}

export const campaignDeliveryMetrics = new CampaignDeliveryMetrics();
