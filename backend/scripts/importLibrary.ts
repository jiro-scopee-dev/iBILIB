/**
 * Bulk import utility for iBILIB.
 *
 * Walks a Google Drive export folder tree and imports files into the database
 * and uploads directory:
 *   - "Learning Materials-*"   -> LearningMaterial rows (grade / subject / quarter from folders)
 *   - "Research Project-*"     -> ResearchProject rows (category "research-project")
 *   - "Practical Research 1-*" -> ResearchProject rows (category "practical-research-1")
 *   - "Practical Research 2-*" -> ResearchProject rows (category "practical-research-2")
 *   - "Capstone-*"             -> ResearchProject rows (category "capstone")
 *
 * Usage:
 *   npx tsx scripts/importLibrary.ts [sourceRoot]
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { ALLOWED_EXTENSIONS, generateStoredFilename } from '../src/utils/fileUtils';

const prisma = new PrismaClient();

const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');
const DEFAULT_SOURCE = path.resolve(__dirname, '..', '..', 'files');
const SOURCE = process.argv[2] ?? DEFAULT_SOURCE;

const WRAPPER_DIRS = new Set([
  'Core & Applied Subjects',
  'Specialized Subjects',
  'Others',
  'ABM (Accountancy, Business, and Management)',
  'HUMSS (Humanities and Social Sciences)',
  'STEM (Science, Technology, Engineering, and Mathematics)',
]);

const RESEARCH_FOLDERS: Array<{ folder: string; slug: string }> = [
  { folder: 'Research Project', slug: 'research-project' },
  { folder: 'Practical Research 1', slug: 'practical-research-1' },
  { folder: 'Practical Research 2', slug: 'practical-research-2' },
  { folder: 'Capstone', slug: 'capstone' },
];

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

let imported = 0;
let skipped = 0;
let errors = 0;

function log(step: number, msg: string): void {
  if (step % 25 === 0 || step === 1) console.log(msg);
}

function cleanTitle(base: string): string {
  return base
    .replace(/[_]+/g, ' ')
    .replace(/-+/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normSubject(name: string): string {
  const m = name.match(/^Homeroom Guidance\b/i);
  if (m) return 'Homeroom Guidance';
  return name.trim();
}

function mimeFor(filePath: string): string {
  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

async function subjectId(gradeId: number, rawName: string): Promise<number> {
  const name = normSubject(rawName);
  const existing = await prisma.subject.findUnique({ where: { gradeId_name: { gradeId, name } } });
  if (existing) return existing.id;
  const created = await prisma.subject.create({ data: { gradeId, name } });
  console.log(`  + new subject: ${name} (grade ${gradeId})`);
  return created.id;
}

/** Copies a source file into the uploads dir and registers a File row. */
async function attachFile(
  srcPath: string,
  link: { materialId?: number; researchProjectId?: number },
  opts: { forceCopy?: boolean } = {},
): Promise<boolean> {
  const originalFilename = path.basename(srcPath);
  const fileSize = fs.statSync(srcPath).size;
  if (!opts.forceCopy) {
    const dup = await prisma.file.findFirst({ where: { originalFilename, fileSize } });
    if (dup) {
      console.log(`  ~ already in DB: ${originalFilename} (file #${dup.id}, skipping copy)`);
      return false;
    }
  }
  const filename = generateStoredFilename(originalFilename);
  fs.copyFileSync(srcPath, path.join(UPLOAD_DIR, filename));
  await prisma.file.create({
    data: {
      filename,
      originalFilename,
      fileType: mimeFor(srcPath),
      fileSize,
      path: `uploads/${filename}`,
      ...link,
    },
  });
  return true;
}

/** All allowed files under `dir`, relative to `base`. */
function filesUnder(base: string, dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (
        entry.isFile() &&
        ALLOWED_EXTENSIONS.includes(path.extname(entry.name).slice(1).toLowerCase())
      ) {
        out.push(path.relative(base, full));
      }
    }
  };
  walk(dir);
  return out.sort();
}

/* ------------------------------------------------------------------ */
/* Learning Materials                                                  */
/* ------------------------------------------------------------------ */

async function importMaterials(rootDir: string): Promise<void> {
  const exportEntry = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .find((e) => e.isDirectory() && e.name.startsWith('Learning Materials'));
  if (!exportEntry) return;
  const base = path.join(rootDir, exportEntry.name, 'Learning Materials');
  if (!fs.existsSync(base)) return;
  const gradeDirs = fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory());

  for (const gradeEntry of gradeDirs) {
    const m = gradeEntry.name.match(/^Grade\s*(\d+)$/i);
    if (!m) continue;
    const level = Number(m[1]);
    const grade = await prisma.grade.upsert({
      where: { level },
      update: {},
      create: { level, name: `Grade ${level}` },
    });
    const gradePath = path.join(base, gradeEntry.name);
    console.log(`\n[Materials] ${grade.name} — ${gradePath}`);

    for (const rel of filesUnder(gradePath, gradePath)) {
      const parts = rel.split(path.sep);
      const dirs = parts.slice(0, -1);
      const filename = parts[parts.length - 1];
      const fullPath = path.join(gradePath, rel);

      const quarterHit = dirs.find((d) => /^quarter\b/i.test(d.trim()));
      const topic = quarterHit ? quarterHit.replace(/^Quarter\b/i, 'Quarter').trim() : undefined;

      const chain = dirs.slice();
      while (chain.length && WRAPPER_DIRS.has(chain[0])) chain.shift();
      if (
        chain.length >= 2 &&
        /^Homeroom Guidance/i.test(chain[0]) &&
        /^Homeroom Guidance/i.test(chain[1])
      ) {
        chain.shift();
      }
      let subjectName = chain.length ? (chain.shift() as string) : 'Other Subjects';
      if (subjectName === 'TLE' && chain.length && !/^quarter\b/i.test(chain[0])) {
        subjectName = chain.shift() as string;
      }
      subjectName = normSubject(subjectName);

      const title = cleanTitle(path.basename(filename, path.extname(filename)));
      if (!title) continue;

      const sid = await subjectId(grade.id, subjectName);
      const dupMaterial = await prisma.learningMaterial.findFirst({
        where: { title, gradeId: grade.id, subjectId: sid },
      });
      if (dupMaterial) {
        skipped++;
        log(skipped, `  ~ skip material (exists): ${title}`);
        continue;
      }

      let fileOk = false;
      try {
        const material = await prisma.learningMaterial.create({
          data: {
            title,
            gradeId: grade.id,
            subjectId: sid,
            description: topic ? `${subjectName} · ${topic}` : subjectName,
            topic,
          },
        });
        fileOk = await attachFile(fullPath, { materialId: material.id }, { forceCopy: true });
        if (fileOk) {
          imported++;
          log(imported, `  + ${title} [${subjectName}${topic ? ` · ${topic}` : ''}]`);
        } else {
          await prisma.learningMaterial.deleteMany({
            where: { title, gradeId: grade.id, subjectId: sid, file: null },
          });
        }
      } catch (err) {
        errors++;
        console.error(`  ! FAILED: ${path.join(gradePath, rel)}`, err instanceof Error ? err.message : err);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Research                                                            */
/* ------------------------------------------------------------------ */

async function importResearch(rootDir: string): Promise<void> {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const { folder, slug } of RESEARCH_FOLDERS) {
    const match = entries.find((e) => e.name.startsWith(folder));
    if (!match) continue;
    const category = await prisma.researchCategory.findUnique({ where: { slug } });
    if (!category) {
      console.error(`  ! category missing: ${slug}`);
      continue;
    }
    let searchDir = path.join(rootDir, match.name, folder);
    const children = fs.readdirSync(searchDir, { withFileTypes: true });
    const hasFiles = children.some((c) => c.isFile());
    const firstDir = children.find((c) => c.isDirectory());
    if (!hasFiles && firstDir) searchDir = path.join(searchDir, firstDir.name);

    console.log(`\n[Research] ${folder} — ${searchDir}`);
    for (const rel of filesUnder(searchDir, searchDir)) {
      const fullPath = path.join(searchDir, rel);
      const filename = path.basename(rel);
      const cleanBase = path.basename(filename, path.extname(filename));
      const title = cleanTitle(cleanBase);
      if (!title) continue;

      const dupProject = await prisma.researchProject.findFirst({
        where: { title, categoryId: category.id },
      });
      if (dupProject) {
        skipped++;
        log(skipped, `  ~ skip research (exists): ${title}`);
        continue;
      }

      let authors: string | null = null;
      const am = cleanBase.match(/^(.{2,40}?)(?:_et_al\.?|\.et\.al\.?|\s+et\s+al\.?)/i);
      if (am) authors = `${am[1].replace(/_/g, ' ').trim()} et al.`;

      try {
        const project = await prisma.researchProject.create({
          data: { title, categoryId: category.id, authors, description: folder },
        });
        await attachFile(fullPath, { researchProjectId: project.id });
        imported++;
        log(imported, `  + ${title}${authors ? ` (${authors})` : ''}`);
      } catch (err) {
        errors++;
        console.error(`  ! FAILED: ${fullPath}`, err instanceof Error ? err.message : err);
      }
    }
  }
}

/* ------------------------------------------------------------------ */

/** Removes orphan rows left by a failed run (materials under junk "Grade N" subjects). */
async function cleanupBadImports(): Promise<void> {
  const junk = await prisma.subject.findMany({ where: { name: { startsWith: 'Grade ' } } });
  const junkIds = junk
    .filter((s) => /^Grade \d+$/.test(s.name))
    .map((s) => s.id);
  if (junkIds.length === 0) return;
  const removed = await prisma.learningMaterial.deleteMany({
    where: { subjectId: { in: junkIds }, file: null },
  });
  await prisma.subject.deleteMany({ where: { id: { in: junkIds } } });
  console.log(`Cleaned ${removed.count} orphan materials and ${junkIds.length} junk subjects.`);
}

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source root not found: ${SOURCE}`);
    process.exit(1);
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Importing from: ${SOURCE}`);
  console.log(`Uploading to:   ${UPLOAD_DIR}\n`);

  await cleanupBadImports();
  await importMaterials(SOURCE);
  await importResearch(SOURCE);

  console.log(`\nDone. imported=${imported} skipped=${skipped} errors=${errors}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Import crashed:', err);
  await prisma.$disconnect();
  process.exit(1);
});