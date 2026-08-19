import fs from 'fs';
import path from 'path';
import prisma from '../src/models/db';

interface StoredFile {
  id: number;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  localFileExists: boolean;
}

async function main() {
  const files: StoredFile[] = (await prisma.file.findMany()).map((f) => ({
    ...f,
    localFileExists: fs.existsSync(path.join(process.cwd(), 'uploads', f.filename)),
  }));

  const dump = {
    grades: await prisma.grade.findMany(),
    subjects: await prisma.subject.findMany(),
    tags: await prisma.tag.findMany(),
    materials: await prisma.learningMaterial.findMany({ include: { tags: true } }),
    researchCategories: await prisma.researchCategory.findMany(),
    researchProjects: await prisma.researchProject.findMany(),
    researchChapters: await prisma.researchChapter.findMany(),
    files,
    views: await prisma.view.findMany(),
    downloads: await prisma.download.findMany(),
  };

  fs.writeFileSync('migration-dump.json', JSON.stringify(dump, null, 2));
  console.log(`Dumped ${dump.grades.length} grades, ${dump.subjects.length} subjects, ${dump.materials.length} materials, ${dump.researchProjects.length} research projects, ${files.length} files (${files.filter((f) => f.localFileExists).length} present on disk).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });