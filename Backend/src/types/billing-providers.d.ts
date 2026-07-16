declare module 'razorpay' {
  export default class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(payload: {
        amount: number;
        currency: string;
        receipt: string;
        notes?: Record<string, string>;
      }): Promise<{ id: string; amount: number; currency: string }>;
    };
    payments: {
      fetch(paymentId: string): Promise<{
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: Record<string, string>;
      }>;
    };
  }
}

declare module 'standardwebhooks' {
  export class Webhook {
    constructor(secret: string);
    verify(
      payload: string,
      headers: {
        'webhook-id': string;
        'webhook-signature': string;
        'webhook-timestamp': string;
      }
    ): unknown;
    sign(msgId: string, timestamp: Date, payload: string): string;
  }
}
