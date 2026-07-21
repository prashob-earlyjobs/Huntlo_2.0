export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Huntlo API',
    version: '0.1.0',
    description:
      'Huntlo agentic AI recruiting platform API. Candidate search uses annotate → apply → poll → persist → WebSocket.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current API version',
    },
  ],
  tags: [
    { name: 'Health', description: 'Liveness and readiness probes' },
    { name: 'Meta', description: 'API metadata' },
    {
      name: 'Candidate Search',
      description:
        'Annotate → filter drawer → apply → poll → persist → WebSocket candidate search flow',
    },
    {
      name: 'Outreach Config',
      description:
        'Configuration layer: email/WhatsApp plans, templates, AI sequence drafts under /outreach',
    },
    {
      name: 'Outreach Campaigns',
      description:
        'Canonical campaign execution under /outreach-campaigns (also aliased at /outreach/campaigns)',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        responses: {
          '200': {
            description: 'Service is alive',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness probe',
        description: 'Returns 503 when MongoDB is not connected.',
        responses: {
          '200': { description: 'Service is ready' },
          '503': { description: 'Service is not ready' },
        },
      },
    },
    '/version': {
      get: {
        tags: ['Meta'],
        summary: 'Application version',
        responses: {
          '200': { description: 'Version metadata' },
        },
      },
    },
    '/candidates/search/annotate': {
      post: {
        tags: ['Candidate Search'],
        summary: 'Annotate a natural-language requirement into filterForm',
        description: 'Does not consume candidate_search quota.',
        responses: {
          '200': { description: 'filterForm for the advanced-filter drawer' },
        },
      },
    },
    '/candidates/search/apply': {
      post: {
        tags: ['Candidate Search'],
        summary: 'Apply filters and create/update a Future Jobs sourcing session',
        description:
          'Primary search endpoint. Consumes one candidate_search quota. sessionId = Future Jobs id; savedSessionId = Mongo id.',
        responses: {
          '200': {
            description:
              'Candidates on success, or sessionPending when Future Jobs statusCode is 207',
          },
          '429': { description: 'SEARCH_QUOTA_EXHAUSTED' },
          '422': { description: 'INVALID_SEARCH_PROMPT / INVALID_FILTER_FORM' },
        },
      },
    },
    '/candidates/search': {
      post: {
        tags: ['Candidate Search'],
        summary: 'Legacy one-shot search',
        description: 'LEGACY — prefer POST /candidates/search/apply. Same implementation.',
        responses: {
          '200': { description: 'Same as apply' },
        },
      },
    },
    '/candidates/filters/autocomplete': {
      get: {
        tags: ['Candidate Search'],
        summary: 'Filter autocomplete suggestions',
        responses: {
          '200': { description: 'Suggestions list' },
          '400': { description: 'AUTOCOMPLETE_QUERY_TOO_SHORT' },
        },
      },
    },
    '/candidates/session/{sessionId}/profiles': {
      get: {
        tags: ['Candidate Search'],
        summary: 'Reload session profiles (MongoDB first)',
        responses: {
          '200': { description: 'fromStored true when Mongo has candidates' },
        },
      },
    },
    '/candidates/session/{sessionId}/fetch-more': {
      post: {
        tags: ['Candidate Search'],
        summary: 'Request more candidates (consumes one search quota)',
        responses: {
          '200': { description: 'Merged candidates; never drops stored rows' },
          '429': { description: 'SEARCH_QUOTA_EXHAUSTED' },
        },
      },
    },
    '/candidates/session/{sessionId}/stored-candidates': {
      get: {
        tags: ['Candidate Search'],
        summary: 'MongoDB-only stored candidates (primary reopen path)',
        responses: {
          '200': { description: 'metaOnly / all / paginated modes' },
        },
      },
    },
    '/candidates/sessions': {
      get: {
        tags: ['Candidate Search'],
        summary: 'Search history',
        responses: { '200': { description: 'Session summaries' } },
      },
    },
    '/candidates/recent-searches': {
      get: {
        tags: ['Candidate Search'],
        summary: 'Compact recent searches',
        responses: { '200': { description: 'Recent search shortcuts' } },
      },
    },
    '/outreach/plans': {
      get: {
        tags: ['Outreach Config'],
        summary: 'List email outreach plans',
        responses: { '200': { description: 'Plan list' } },
      },
      post: {
        tags: ['Outreach Config'],
        summary: 'Create email outreach plan',
        responses: { '201': { description: 'Created plan' } },
      },
    },
    '/outreach/plans/{id}': {
      get: {
        tags: ['Outreach Config'],
        summary: 'Get email outreach plan',
        responses: { '200': { description: 'Plan' } },
      },
      put: {
        tags: ['Outreach Config'],
        summary: 'Update email outreach plan',
        responses: { '200': { description: 'Updated plan' } },
      },
      delete: {
        tags: ['Outreach Config'],
        summary: 'Delete email outreach plan',
        responses: { '200': { description: 'Deleted' } },
      },
    },
    '/outreach/whatsapp/plans': {
      get: {
        tags: ['Outreach Config'],
        summary: 'List WhatsApp outreach plans',
        responses: { '200': { description: 'Plan list' } },
      },
      post: {
        tags: ['Outreach Config'],
        summary: 'Create WhatsApp outreach plan',
        responses: { '201': { description: 'Created plan' } },
      },
    },
    '/outreach/whatsapp/plans/{id}': {
      put: {
        tags: ['Outreach Config'],
        summary: 'Update WhatsApp outreach plan',
        responses: { '200': { description: 'Updated plan' } },
      },
      delete: {
        tags: ['Outreach Config'],
        summary: 'Delete WhatsApp outreach plan',
        responses: { '200': { description: 'Deleted' } },
      },
    },
    '/outreach/ai/generate-sequence': {
      post: {
        tags: ['Outreach Config'],
        summary: 'Generate AI sequence draft (never auto-launches)',
        responses: { '200': { description: 'Draft only' } },
      },
    },
    '/outreach/generate': {
      post: {
        tags: ['Outreach Config'],
        summary: 'Deprecated alias of /outreach/ai/generate-sequence',
        deprecated: true,
        responses: { '200': { description: 'Draft only' } },
      },
    },
    '/outreach-campaigns': {
      get: {
        tags: ['Outreach Campaigns'],
        summary: 'List campaigns',
        responses: { '200': { description: 'Campaign list' } },
      },
      post: {
        tags: ['Outreach Campaigns'],
        summary: 'Create campaign',
        responses: { '201': { description: 'Created campaign' } },
      },
    },
    '/outreach-campaigns/drafts': {
      post: {
        tags: ['Outreach Campaigns'],
        summary: 'Create empty builder draft',
        responses: { '201': { description: 'Draft campaign' } },
      },
    },
    '/outreach-campaigns/{id}/builder': {
      get: {
        tags: ['Outreach Campaigns'],
        summary: 'Load builder state',
        responses: { '200': { description: 'Builder state' } },
      },
    },
    '/outreach-campaigns/{id}/steps/{stepKey}': {
      patch: {
        tags: ['Outreach Campaigns'],
        summary: 'Save one builder step',
        responses: { '200': { description: 'Updated builder state' } },
      },
    },
    '/outreach-campaigns/{id}/validate': {
      post: {
        tags: ['Outreach Campaigns'],
        summary: 'Validate campaign (compiles builder first)',
        responses: { '200': { description: 'Validation result' } },
      },
    },
    '/outreach-campaigns/{id}/launch': {
      post: {
        tags: ['Outreach Campaigns'],
        summary: 'Launch campaign with compile + enrollment + lock',
        responses: {
          '200': { description: 'Launch summary' },
          '409': { description: 'Already launched/running' },
          '422': { description: 'Builder/validation blockers' },
          '429': { description: 'Quota exhausted' },
        },
      },
    },
    '/outreach-campaigns/{id}/tracking': {
      get: {
        tags: ['Outreach Campaigns'],
        summary: 'Campaign tracking metrics',
        responses: { '200': { description: 'Tracking payload' } },
      },
    },
    '/outreach-campaigns/{id}/candidates/{candidateId}/actions': {
      post: {
        tags: ['Outreach Campaigns'],
        summary: 'Recruiter candidate action',
        responses: { '200': { description: 'Action result' } },
      },
    },
    '/outreach/campaigns': {
      get: {
        tags: ['Outreach Campaigns'],
        summary: 'Deprecated alias of /outreach-campaigns',
        deprecated: true,
        responses: { '200': { description: 'Campaign list' } },
      },
      post: {
        tags: ['Outreach Campaigns'],
        summary: 'Deprecated alias of /outreach-campaigns',
        deprecated: true,
        responses: { '201': { description: 'Created campaign' } },
      },
    },
  },
  components: {
    schemas: {
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string' },
            },
          },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    path: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          requestId: { type: 'string' },
        },
      },
      CandidateSearchPollEvent: {
        type: 'object',
        description: 'WebSocket event candidates.search.poll',
        properties: {
          type: { type: 'string', example: 'candidates.search.poll' },
          sessionId: { type: 'string', description: 'Future Jobs session id' },
          savedSessionId: { type: 'string', description: 'Mongo SourcingSession id' },
          status: {
            type: 'string',
            enum: ['polling', 'partial', 'completed', 'failed', 'cancelled'],
          },
          polling: { type: 'boolean' },
          newCandidateCount: { type: 'integer' },
          totalDocs: { type: 'integer' },
          canFetchMore: { type: 'boolean' },
          regionExpandFallbackUsed: { type: 'boolean' },
          error: { type: 'string', nullable: true },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      SearchPendingResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          sessionPending: { type: 'boolean', example: true },
          fjStatusCode: { type: 'integer', example: 207 },
          sessionId: { type: 'string' },
          savedSessionId: { type: 'string' },
          message: { type: 'string' },
          filterForm: { type: 'object' },
        },
      },
    },
  },
} as const;
