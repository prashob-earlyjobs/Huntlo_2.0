import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import multer from 'multer';
import { randomUUID } from 'node:crypto';

import { AppError } from '../shared/errors/app-error.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = new Set(['.csv', '.xlsx', '.xls']);
const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'text/plain',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream', // some browsers send this for csv/xlsx
]);

export function getImportUploadDir(): string {
  const dir = path.join(os.tmpdir(), 'huntlo-imports');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function extensionOf(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function createImportUpload() {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      try {
        cb(null, getImportUploadDir());
      } catch (error) {
        cb(error as Error, getImportUploadDir());
      }
    },
    filename: (_req, file, cb) => {
      const ext = extensionOf(file.originalname) || '.bin';
      cb(null, `${randomUUID()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (_req, file, cb) => {
      const ext = extensionOf(file.originalname);
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        cb(AppError.badRequest('Only .csv, .xlsx, and .xls files are allowed'));
        return;
      }
      cb(null, true);
    },
  });
}

export { MAX_FILE_SIZE, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES };
