import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const INVOICE_STATUSES = ['paid', 'failed', 'refunded', 'pending'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type BillingInvoiceDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  paymentOrderId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  status: InvoiceStatus;
  invoiceUrl: string | null;
  planName: string | null;
  provider: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const billingInvoiceSchema = new Schema<BillingInvoiceDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    paymentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentOrder',
      required: true,
      index: true,
    },
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: { type: String, enum: INVOICE_STATUSES, default: 'paid', index: true },
    invoiceUrl: { type: String, default: null, trim: true },
    planName: { type: String, default: null, trim: true },
    provider: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

billingInvoiceSchema.index({ organizationId: 1, createdAt: -1 });

export const BillingInvoiceModel: Model<BillingInvoiceDocument> =
  mongoose.models.BillingInvoice ??
  mongoose.model<BillingInvoiceDocument>('BillingInvoice', billingInvoiceSchema);
