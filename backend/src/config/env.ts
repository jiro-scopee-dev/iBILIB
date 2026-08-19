import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  uploadDir: path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIRECTORY || 'uploads'),
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
