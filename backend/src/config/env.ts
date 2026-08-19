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
  // 'local' stores uploads on disk; 'supabase' stores them in Supabase Storage.
  storageBackend: process.env.STORAGE_BACKEND === 'supabase' ? 'supabase' : 'local',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseBucket: process.env.SUPABASE_BUCKET || 'uploads',
};