import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

/**
 * Imports migration-dump.json (produced by scripts/dump-local.ts) into
 * PostgreSQL (e.g. Supabase) and uploads file bytes to Supabase Storage.
 *
 * Requires: prisma generate --schema prisma/schema.postgres.prisma
 * Env: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET
 */

const DUMP_FILE = 'migration-dump.json';
const UPLOADS_DIR = 'uploads';

async function main() {
  if (!fs.existsSync(DUMP_FILE)) {
    console.error('migration-dump.json not found. Run: npm run dump:local');
    process.exit(1);
  }
  const dump = JSON.parse(fs.readFileSync(DUMP_FILE, 'utf8'));

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || 'uploads';
  if (!supabaseUrl || !serviceKey) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let uploaded = 0;
  let skipped = 0;
  for (const f of dump.files) {
    const localPath = path.join(UPLOADS_DIR, f.filename);
    if (f.localFileExists && fs.existsSync(localPath)) {
      const bytes = fs.readFileSync(localPath);
      const { error } = await supabase.storage.from(bucket).upload(f.filename, bytes, {
        contentType: f.fileType,
        upsert: false,
      });
      if (error && error.message && !error.message.includes('already exists')) {
        console.error(`Upload failed for ${f.filename}: ${error.message}`);
        process.exit(1);
      }
      uploaded++;
    } else {
      skipped++;
    }
  }
  console.log(`Storage: uploaded ${uploaded} files, skipped ${skipped} (missing on disk).`);

  const prisma = new PrismaClient();
  const db = { prisma, usedIds: new Map<string, number[]>() };

  function track(table: string, id: number) {
    db.usedIds.set(table, [...(db.usedIds.get(table) ?? []), id]);
  }

  console.log('Importing grades...');
  for (const g of dump.grades) {
    track('Grade', g.id);
    await prisma.grade.create({
      data: { id: g.id, name: g.name, level: g.level, createdAt: g.createdAt, updatedAt: g.updatedAt },
    });
  }

  console.log('Importing subjects...');
  for (const s of dump.subjects) {
    track('Subject', s.id);
    await prisma.subject.create({
      data: { id: s.id, name: s.name, gradeId: s.gradeId, createdAt: s.createdAt, updatedAt: s.updatedAt },
    });
  }

  console.log('Importing tags...');
  for (const t of dump.tags) {
    track('Tag', t.id);
    await prisma.tag.create({
      data: { id: t.id, name: t.name, createdAt: t.createdAt, updatedAt: t.updatedAt },
    });
  }

  console.log('Importing files...');
  for (const f of dump.files) {
    track('File', f.id);
    await prisma.file.create({
      data: {
        id: f.id,
        filename: f.filename,
        originalFilename: f.originalFilename,
        fileType: f.fileType,
        fileSize: f.fileSize,
        path: `${bucket}/${f.filename}`,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      },
    });
  }

  console.log('Importing materials...');
  for (const m of dump.materials) {
    track('LearningMaterial', m.id);
    await prisma.learningMaterial.create({
      data: {
        id: m.id,
        title: m.title,
        description: m.description,
        topic: m.topic,
        author: m.author,
        gradeId: m.gradeId,
        subjectId: m.subjectId,
        fileId: m.fileId,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        tags: { connect: m.tags.map((t: { id: number }) => ({ id: t.id })) },
      },
    });
  }

  console.log('Importing research categories...');
  for (const c of dump.researchCategories) {
    track('ResearchCategory', c.id);
    await prisma.researchCategory.create({
      data: { id: c.id, name: c.name, slug: c.slug, createdAt: c.createdAt, updatedAt: c.updatedAt },
    });
  }

  console.log('Importing research projects...');
  for (const p of dump.researchProjects) {
    track('ResearchProject', p.id);
    await prisma.researchProject.create({
      data: {
        id: p.id,
        title: p.title,
        abstract: p.abstract,
        authors: p.authors,
        categoryId: p.categoryId,
        gradeLevel: p.gradeLevel,
        strand: p.strand,
        adviser: p.adviser,
        school: p.school,
        year: p.year,
        keywords: p.keywords,
        description: p.description,
        references: p.references,
        fileId: p.fileId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
  }

  console.log('Importing research chapters...');
  for (const ch of dump.researchChapters) {
    track('ResearchChapter', ch.id);
    await prisma.researchChapter.create({
      data: {
        id: ch.id,
        title: ch.title,
        content: ch.content,
        sortOrder: ch.sortOrder,
        projectId: ch.projectId,
        fileId: ch.fileId,
        createdAt: ch.createdAt,
        updatedAt: ch.updatedAt,
      },
    });
  }

  console.log('Importing views & downloads...');
  for (const v of dump.views) {
    await prisma.view.create({ data: v });
  }
  for (const d of dump.downloads) {
    await prisma.download.create({ data: d });
  }

  console.log('Fixing sequences...');
  for (const [table, ids] of db.usedIds) {
    if (ids.length === 0) continue;
    const max = Math.max(...ids);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), ${max});`);
  }

  console.log('Import complete.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });