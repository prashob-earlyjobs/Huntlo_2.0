import { Router } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { openApiSpec } from './openapi.spec.js';

export const openApiRouter = Router();

openApiRouter.get(
  '/openapi.json',
  asyncHandler(async (_req, res) => {
    res.status(200).json(openApiSpec);
  })
);

openApiRouter.get(
  '/docs',
  asyncHandler(async (_req, res) => {
    res.status(200).type('html').send(renderSwaggerUiHtml());
  })
);

function renderSwaggerUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Huntlo API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/v1/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`;
}
