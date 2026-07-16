import mongoose from 'mongoose';

let pluginsApplied = false;

export function applyMongoosePlugins(): void {
  if (pluginsApplied) return;
  pluginsApplied = true;

  mongoose.plugin(auditFieldsPlugin);
  mongoose.plugin(softDeletePlugin);
}

function auditFieldsPlugin(schema: mongoose.Schema): void {
  const auditFields = {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  };

  if (!schema.path('createdBy')) {
    schema.add(auditFields);
  }

  if (!schema.options.timestamps) {
    schema.set('timestamps', true);
  }
}

function softDeletePlugin(schema: mongoose.Schema): void {
  if (schema.path('deletedAt')) return;

  schema.add({
    deletedAt: { type: Date, default: null, index: true },
  });

  schema.pre('find', excludeDeletedMiddleware);
  schema.pre('findOne', excludeDeletedMiddleware);
  schema.pre('countDocuments', excludeDeletedMiddleware);

  schema.methods.softDelete = async function softDelete(
    this: mongoose.Document & { deletedAt?: Date | null },
    deletedBy?: mongoose.Types.ObjectId
  ) {
    this.deletedAt = new Date();
    if (deletedBy && this.schema.path('updatedBy')) {
      this.set('updatedBy', deletedBy);
    }
    return this.save();
  };

  schema.statics.findWithDeleted = function findWithDeleted(filter: Record<string, unknown>) {
    return this.find(filter).setOptions({ includeDeleted: true });
  };
}

function excludeDeletedMiddleware(this: mongoose.Query<unknown, unknown>) {
  const options = this.getOptions() as { includeDeleted?: boolean };
  if (options.includeDeleted) return;
  this.where({ deletedAt: null });
}
