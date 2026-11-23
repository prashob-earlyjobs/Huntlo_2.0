import mongoose, { type Document, type Model, Schema } from 'mongoose';

import type { ContactEnquiryType } from './contact-enquiry.validation.js';

export type ContactEnquiryDocument = Document & {
  fullName: string;
  workEmail: string;
  companyName: string | null;
  enquiryType: ContactEnquiryType;
  message: string;
  fingerprint: string;
  ipHash: string | null;
  notified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const contactEnquirySchema = new Schema<ContactEnquiryDocument>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    workEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      index: true,
    },
    companyName: { type: String, default: null, trim: true, maxlength: 160 },
    enquiryType: { type: String, required: true, trim: true, maxlength: 40 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    fingerprint: { type: String, required: true, trim: true, maxlength: 64, index: true },
    ipHash: { type: String, default: null, trim: true, maxlength: 64, index: true },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactEnquirySchema.index({ fingerprint: 1, createdAt: -1 });
contactEnquirySchema.index({ workEmail: 1, createdAt: -1 });

export const ContactEnquiryModel = (mongoose.models.ContactEnquiry ??
  mongoose.model<ContactEnquiryDocument>(
    'ContactEnquiry',
    contactEnquirySchema
  )) as Model<ContactEnquiryDocument>;
