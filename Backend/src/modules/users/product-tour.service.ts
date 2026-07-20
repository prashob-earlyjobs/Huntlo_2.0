import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { RequestContext } from '../auth/auth.types.js';
import { UserModel } from '../auth/user.model.js';
import {
  HUNTLO_DASHBOARD_TOUR_VERSION,
  UserPreferenceModel,
  defaultDashboardProductTour,
  defaultNotificationPreferences,
  defaultProductTours,
  toPublicDashboardTour,
  type DashboardProductTourState,
  type ProductTourStatus,
} from './user-preference.model.js';
import type { UpdateDashboardProductTourInput } from './product-tour.validation.js';

async function loadUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user || user.deletedAt) {
    throw new AppError(404, 'PRODUCT_TOUR_NOT_FOUND', 'User not found');
  }
  if (user.memberStatus === 'suspended' || user.memberStatus === 'blocked') {
    throw new AppError(403, 'PRODUCT_TOUR_FORBIDDEN', 'Account is not active');
  }
  return user;
}

async function ensurePreferences(userId: string) {
  let prefs = await UserPreferenceModel.findOne({ userId });
  if (!prefs) {
    const user = await loadUser(userId);
    prefs = await UserPreferenceModel.create({
      userId,
      timezone: user.timezone || 'Asia/Kolkata',
      locale: user.locale || 'en-IN',
      notificationPreferences: defaultNotificationPreferences(),
      productTours: defaultProductTours(),
    });
  } else if (!prefs.productTours?.dashboard) {
    prefs.productTours = defaultProductTours();
    await prefs.save();
  }
  return prefs;
}

function getDashboardTour(prefs: {
  productTours?: {
    dashboard?: Partial<DashboardProductTourState> | null;
  } | null;
}): DashboardProductTourState {
  const raw = prefs.productTours?.dashboard as
    | (Partial<DashboardProductTourState> & { toObject?: () => Partial<DashboardProductTourState> })
    | null
    | undefined;
  const dashboard =
    raw && typeof raw.toObject === 'function' ? raw.toObject() : raw;
  return {
    ...defaultDashboardProductTour(),
    ...(dashboard ?? {}),
    startedAt: dashboard?.startedAt ?? null,
    completedAt: dashboard?.completedAt ?? null,
    skippedAt: dashboard?.skippedAt ?? null,
    updatedAt: dashboard?.updatedAt ?? null,
  };
}

function tourErrorFromValidation(input: UpdateDashboardProductTourInput): AppError | null {
  if (input.version !== HUNTLO_DASHBOARD_TOUR_VERSION) {
    return new AppError(
      422,
      'PRODUCT_TOUR_INVALID_VERSION',
      `Unsupported tour version. Expected ${HUNTLO_DASHBOARD_TOUR_VERSION}.`
    );
  }
  if (input.lastStep < 0) {
    return new AppError(422, 'PRODUCT_TOUR_INVALID_STEP', 'Tour step must be zero or greater');
  }
  return null;
}

function auditActionForStatus(status: ProductTourStatus): string | null {
  switch (status) {
    case 'in_progress':
      return 'product_tour_started';
    case 'completed':
      return 'product_tour_completed';
    case 'skipped':
      return 'product_tour_skipped';
    default:
      return null;
  }
}

export const productTourService = {
  async getDashboardTour(context: RequestContext) {
    await loadUser(context.userId);
    const prefs = await ensurePreferences(context.userId);
    return toPublicDashboardTour(getDashboardTour(prefs));
  },

  async updateDashboardTour(context: RequestContext, input: UpdateDashboardProductTourInput) {
    const validationError = tourErrorFromValidation(input);
    if (validationError) throw validationError;

    await loadUser(context.userId);
    const prefs = await ensurePreferences(context.userId);
    const current = getDashboardTour(prefs);
    const now = new Date();

    // Idempotent terminal states: repeated complete/skip keeps original timestamps.
    if (input.status === 'completed' && current.status === 'completed') {
      return toPublicDashboardTour(current);
    }
    if (input.status === 'skipped' && current.status === 'skipped') {
      return toPublicDashboardTour(current);
    }

    const next: DashboardProductTourState = {
      ...current,
      version: input.version,
      status: input.status,
      lastStep: input.lastStep,
      updatedAt: now,
    };

    if (input.status === 'in_progress') {
      if (!next.startedAt) next.startedAt = now;
      next.completedAt = null;
      next.skippedAt = null;
    } else if (input.status === 'completed') {
      if (!next.startedAt) next.startedAt = now;
      next.completedAt = current.completedAt ?? now;
      next.skippedAt = null;
    } else if (input.status === 'skipped') {
      if (!next.startedAt) next.startedAt = current.startedAt ?? now;
      next.skippedAt = current.skippedAt ?? now;
      next.completedAt = null;
    } else if (input.status === 'not_started') {
      next.startedAt = null;
      next.completedAt = null;
      next.skippedAt = null;
      next.lastStep = 0;
    }

    prefs.set('productTours', {
      ...(prefs.productTours ? { ...prefs.productTours } : defaultProductTours()),
      dashboard: next,
    });
    prefs.markModified('productTours');
    try {
      await prefs.save();
    } catch (cause) {
      throw new AppError(500, 'PRODUCT_TOUR_UPDATE_FAILED', 'Failed to update product tour', {
        cause,
      });
    }

    if (input.status === 'in_progress' && current.status === 'in_progress') {
      await recordAuditEvent({
        action: 'product_tour_step_viewed',
        module: 'product_tour',
        userId: context.userId,
        organizationId: context.organizationId,
        relatedEntityType: 'product_tour',
        relatedEntityId: 'dashboard',
        metadata: {
          tour: 'dashboard',
          version: input.version,
          step: input.lastStep,
          status: input.status,
        },
      });
    } else {
      const action = auditActionForStatus(input.status);
      if (action) {
        await recordAuditEvent({
          action,
          module: 'product_tour',
          userId: context.userId,
          organizationId: context.organizationId,
          relatedEntityType: 'product_tour',
          relatedEntityId: 'dashboard',
          metadata: {
            tour: 'dashboard',
            version: input.version,
            step: input.lastStep,
            status: input.status,
          },
        });
      }
    }

    return toPublicDashboardTour(next);
  },

  async resetDashboardTour(context: RequestContext) {
    await loadUser(context.userId);
    const prefs = await ensurePreferences(context.userId);
    const now = new Date();
    const next = {
      ...defaultDashboardProductTour(),
      updatedAt: now,
    };

    prefs.set('productTours', {
      ...(prefs.productTours ? { ...prefs.productTours } : defaultProductTours()),
      dashboard: next,
    });
    prefs.markModified('productTours');
    try {
      await prefs.save();
    } catch (cause) {
      throw new AppError(500, 'PRODUCT_TOUR_UPDATE_FAILED', 'Failed to reset product tour', {
        cause,
      });
    }

    await recordAuditEvent({
      action: 'product_tour_restarted',
      module: 'product_tour',
      userId: context.userId,
      organizationId: context.organizationId,
      relatedEntityType: 'product_tour',
      relatedEntityId: 'dashboard',
      metadata: {
        tour: 'dashboard',
        version: HUNTLO_DASHBOARD_TOUR_VERSION,
        step: 0,
        status: 'not_started',
      },
    });

    return toPublicDashboardTour(next);
  },
};
