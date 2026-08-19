const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  console.log('materials:', await p.learningMaterial.count());
  console.log('files:', await p.file.count());
  console.log('research:', await p.researchProject.count());
  console.log('subjects:', await p.subject.count());
  const byGrade = await p.grade.findMany({ include: { _count: { select: { materials: true, subjects: true } } } });
  for (const g of byGrade) console.log(g.name, 'materials=' + g._count.materials, 'subjects=' + g._count.subjects);
  const byCat = await p.researchCategory.findMany({ include: { _count: { select: { projects: true } } } });
  for (const c of byCat) console.log(c.name, c._count.projects);
  await p.$disconnect();
})();