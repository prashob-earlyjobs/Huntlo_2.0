import {
  generateOutreachSequence,
  generateQualificationQuestions,
  rewriteOutreachMessage,
} from '../../providers/gemini/gemini.outreach.js';
import { AppError } from '../../shared/errors/app-error.js';
import { assertVariablesAllowed, validateMessageVariables } from './variables.js';
import { outreachTemplatesService } from './templates.service.js';
import { sequenceTemplatesService } from './sequences.service.js';
import type {
  generateOutreachSchema,
  rewriteOutreachSchema,
  validateVariablesSchema,
} from './outreach.validation.js';
import type { z } from 'zod';

type GenerateInput = z.infer<typeof generateOutreachSchema>;
type RewriteInput = z.infer<typeof rewriteOutreachSchema>;
type ValidateInput = z.infer<typeof validateVariablesSchema>;

function toGenerationMeta(meta: {
  isDraft: true;
  action: string;
  model: string;
  generatedAt: string;
  summary: string;
  autoLaunch: false;
}) {
  return {
    isDraft: true as const,
    action: meta.action,
    model: meta.model,
    generatedAt: new Date(meta.generatedAt),
    summary: meta.summary,
  };
}

export const outreachAiService = {
  async generate(organizationId: string, userId: string, input: GenerateInput) {
    if (input.mode === 'qualification_questions') {
      const draft = await generateQualificationQuestions({
        jobTitle: input.jobTitle,
        instructions: input.instructions,
      });
      // Never auto-launch — return draft only (optional save as template body)
      let saved = null;
      if (input.saveAsDraft) {
        const body = draft.questions
          .map((q, i) => `${i + 1}. ${q.prompt} (${q.answerType}${q.knockout ? ' · knockout' : ''})`)
          .join('\n');
        saved = await outreachTemplatesService.create(
          organizationId,
          userId,
          {
            name: `Qualification draft — ${input.jobTitle || 'role'}`.slice(0, 160),
            channel: 'email',
            category: 'qualification',
            subject: null,
            body,
            status: 'draft',
          },
          toGenerationMeta(draft.generation)
        );
      }
      return {
        kind: 'qualification_questions' as const,
        draft: {
          ...draft,
          status: 'draft' as const,
          autoLaunch: false as const,
        },
        saved,
      };
    }

    const draft = await generateOutreachSequence({
      jobTitle: input.jobTitle,
      objective: input.objective,
      channels: input.channels,
      companyName: input.companyName,
    });

    // Validate step variables before optional save
    for (const step of draft.steps) {
      if (step.body) {
        try {
          assertVariablesAllowed(step.subject, step.body, { channel: step.channel ?? undefined });
        } catch (error) {
          throw new AppError(400, 'INVALID_VARIABLES', (error as Error).message);
        }
      }
    }

    let saved = null;
    if (input.saveAsDraft) {
      saved = await sequenceTemplatesService.create(
        organizationId,
        userId,
        {
          name: draft.name,
          channels: draft.channels,
          steps: draft.steps.map((step) => ({
            ...step,
            delayUnit: 'days' as const,
            templateId: null,
            config: {},
          })),
          qualificationConfig: draft.qualificationConfig,
          schedulingConfig: draft.schedulingConfig,
          status: 'draft',
        },
        toGenerationMeta(draft.generation)
      );
    }

    return {
      kind: 'sequence' as const,
      draft: {
        ...draft,
        autoLaunch: false as const,
      },
      saved,
    };
  },

  async rewrite(organizationId: string, userId: string, input: RewriteInput) {
    const draft = await rewriteOutreachMessage({
      action: input.action,
      body: input.body,
      subject: input.subject,
      tone: input.tone,
      channel: input.channel,
      category: input.category,
      instructions: input.instructions,
    });

    try {
      assertVariablesAllowed(draft.subject, draft.body, { channel: draft.channel });
    } catch (error) {
      throw new AppError(400, 'INVALID_VARIABLES', (error as Error).message, {
        meta: { draft },
      });
    }

    let saved = null;
    if (input.saveAsDraft) {
      saved = await outreachTemplatesService.create(
        organizationId,
        userId,
        {
          name: draft.name,
          channel: draft.channel,
          category: draft.category,
          subject: draft.subject,
          body: draft.body,
          language: draft.language,
          status: 'draft',
        },
        toGenerationMeta(draft.generation)
      );
    }

    return {
      draft: {
        ...draft,
        autoLaunch: false as const,
      },
      saved,
    };
  },

  validateVariables(input: ValidateInput) {
    return validateMessageVariables(input);
  },
};
