import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env';

const prisma = new PrismaClient();
const UPLOAD_DIR = env.uploadDir;

const Q_RE = /(?:^|[^A-Za-z])(?:Q|Quarter)[\s:._-]*([1-4])(?!\d)/i;
const QUARTER_TOPIC_RE = /quarter\s*([1-4])\b/i;
const M_RE =
  /(?:^|[^A-Za-z0-9_]|Q[1-4])(?:M(?:od(?:ule)?|odyul)?[\s:._-]*)?(\d{1,2})(?!\d)/i;
const M_LOOSE_RE = /M(\d{1,2})(?!\d)/i;

function quarterInTopic(topic?: string | null): number | undefined {
  const t = QUARTER_TOPIC_RE.exec(topic || '');
  return t ? Number(t[1]) : undefined;
}
function quarterInTitle(title?: string | null): number | undefined {
  const x = Q_RE.exec(title || '');
  return x ? Number(x[1]) : undefined;
}
function moduleIn(title?: string | null): number | undefined {
  const m = M_RE.exec(title || '');
  return m ? Number(m[1]) : undefined;
}
function moduleLoose(title?: string | null): number | undefined {
  if (!/Q[1-4]/i.test(title || '')) return undefined;
  const m = M_LOOSE_RE.exec(title || '');
  return m ? Number(m[1]) : undefined;
}

const SEED_TITLES = [
  'Introduction to Statistics',
  'Research Methodology Basics',
  'Cell Structure and Function',
  'English Grammar Essentials',
  'Statistics in Research',
  'Media Arts 10 Module 1Q1',
];

function cleanSubject(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[_\s.]+$/g, '')
    .trim();
}

(async () => {
  const files = await prisma.file.findMany({
    include: { material: { include: { subject: true } } },
    orderBy: { id: 'asc' },
  });
  const materialFiles = files.filter((f) => f.material);

  const qBySubjMod = new Map<string, number>();
  for (const f of materialFiles) {
    const m = f.material!;
    const mod = moduleIn(m.title);
    const q = quarterInTopic(m.topic) ?? quarterInTitle(m.title);
    if (q && mod) qBySubjMod.set(`${m.subject.name}||${mod}`, q);
  }

  let renamed = 0, suffixed = 0, skippedNoMeta = 0, failed = 0;
  const collisions = new Set<string>();

  for (const f of materialFiles) {
    const m = f.material!;
    if (SEED_TITLES.includes(m.title || '')) continue;

    const mod = moduleIn(m.title) ?? moduleLoose(m.title);
    let quarter = quarterInTopic(m.topic) ?? quarterInTitle(m.title);
    if (!quarter && mod) {
      quarter = qBySubjMod.get(`${m.subject.name}||${mod}`);
    }
    quarter = quarter ?? 1;
    if (!mod) {
      skippedNoMeta++;
      continue;
    }

    const ext = path.extname(f.originalFilename).toLowerCase() || '.pdf';
    const subj = cleanSubject(m.subject.name);
    const base = `${subj}_Q${quarter}_M${mod}`;
    let storedName = `${base}${ext}`;
    let n = 2;
    while (collisions.has(storedName) || fs.existsSync(path.join(UPLOAD_DIR, storedName))) {
      storedName = `${base}-${n}${ext}`;
      n++;
    }
    collisions.add(storedName);

    const oldPath = path.join(UPLOAD_DIR, f.filename);
    const newPath = path.join(UPLOAD_DIR, storedName);
    try {
      if (!fs.existsSync(oldPath)) {
        failed++;
        console.log(`  ! missing on disk: ${oldPath}`);
        continue;
      }
      if (storedName !== f.filename) fs.renameSync(oldPath, newPath);
      await prisma.file.update({
        where: { id: f.id },
        data: {
          filename: storedName,
          path: `uploads/${storedName}`,
          originalFilename: `${base}${ext}`,
        },
      });
      renamed++;
      if (n > 2) suffixed++;
    } catch (e) {
      failed++;
      console.log(`  ! failed #${f.id} ${oldPath}: ${(e as Error).message}`);
    }
  }

  console.log(`\nDone. renamed=${renamed} suffixed=${suffixed} skippedNoMeta=${skippedNoMeta} failed=${failed}`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});