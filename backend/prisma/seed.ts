import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GRADE_SUBJECTS: Record<number, string[]> = {
  7: ['Mathematics', 'Science', 'English', 'Filipino', 'Araling Panlipunan', 'TLE', 'MAPEH', 'Edukasyon sa Pagpapakatao'],
  8: ['Mathematics', 'Science', 'English', 'Filipino', 'Araling Panlipunan', 'TLE', 'MAPEH', 'Edukasyon sa Pagpapakatao'],
  9: ['Mathematics', 'Science', 'English', 'Filipino', 'Araling Panlipunan', 'TLE', 'MAPEH', 'Edukasyon sa Pagpapakatao'],
  10: ['Mathematics', 'Science', 'English', 'Filipino', 'Araling Panlipunan', 'TLE', 'MAPEH', 'Edukasyon sa Pagpapakatao'],
  11: ['Mathematics', 'Science', 'English', 'Research', 'Other Subjects'],
  12: ['Mathematics', 'Science', 'English', 'Research', 'Other Subjects'],
};

const RESEARCH_CATEGORIES = [
  { name: 'Research Project', slug: 'research-project' },
  { name: 'Practical Research 1', slug: 'practical-research-1' },
  { name: 'Practical Research 2', slug: 'practical-research-2' },
  { name: 'Capstone', slug: 'capstone' },
];

async function main() {
  console.log('Seeding database...');

  // Grades + subjects
  const grades: Record<number, { id: number; name: string }> = {};
  for (const [level, subjects] of Object.entries(GRADE_SUBJECTS)) {
    const lvl = Number(level);
    const grade = await prisma.grade.upsert({
      where: { level: lvl },
      update: { name: `Grade ${lvl}` },
      create: { level: lvl, name: `Grade ${lvl}` },
    });
    grades[lvl] = { id: grade.id, name: grade.name };
    for (const subjectName of subjects) {
      await prisma.subject.upsert({
        where: { gradeId_name: { gradeId: grade.id, name: subjectName } },
        update: {},
        create: { gradeId: grade.id, name: subjectName },
      });
    }
  }
  console.log(`Seeded ${Object.keys(grades).length} grades with subjects.`);

  // Research categories
  const categories: Record<string, number> = {};
  for (const c of RESEARCH_CATEGORIES) {
    const category = await prisma.researchCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categories[c.slug] = category.id;
  }
  console.log(`Seeded ${Object.keys(categories).length} research categories.`);

  // Tags used by sample data
  const tagNames = ['statistics', 'mathematics', 'research', 'methodology', 'biology', 'grammar', 'english', 'probability', 'literature', 'online learning', 'science'];
  for (const name of tagNames) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
  }
  const tagId = async (name: string) => (await prisma.tag.findUnique({ where: { name } }))!.id;

  // Sample learning materials
  const m11 = grades[11].id;
  const m8 = grades[8].id;
  const m7 = grades[7].id;
  const m12 = grades[12].id;
  const subjectId = async (gradeId: number, name: string) =>
    (await prisma.subject.findUnique({ where: { gradeId_name: { gradeId, name } } }))!.id;

  const samples = [
    {
      title: 'Introduction to Statistics',
      description: 'Basics of descriptive and inferential statistics: mean, median, mode, variance, and probability distributions.',
      topic: 'Statistics',
      author: 'J. Santos',
      gradeId: m11,
      subject: 'Mathematics',
      tags: ['statistics', 'mathematics', 'probability'],
    },
    {
      title: 'Research Methodology Basics',
      description: 'Overview of research design, sampling techniques, data gathering, and ethical considerations.',
      topic: 'Research Design',
      author: 'M. Reyes',
      gradeId: m11,
      subject: 'Research',
      tags: ['research', 'methodology'],
    },
    {
      title: 'Cell Structure and Function',
      description: 'Introduction to cell organelles, their functions, and the differences between plant and animal cells.',
      topic: 'Cell Biology',
      author: 'A. Cruz',
      gradeId: m8,
      subject: 'Science',
      tags: ['biology', 'science'],
    },
    {
      title: 'English Grammar Essentials',
      description: 'Parts of speech, sentence structure, and common grammar rules for clear writing.',
      topic: 'Grammar',
      author: 'L. Bautista',
      gradeId: m7,
      subject: 'English',
      tags: ['grammar', 'english'],
    },
    {
      title: 'Statistics in Research',
      description: 'Applying statistical tools to analyze research data: tests, interpretation, and reporting.',
      topic: 'Statistical Analysis',
      author: 'J. Santos',
      gradeId: m12,
      subject: 'Mathematics',
      tags: ['statistics', 'research'],
    },
  ];

  for (const s of samples) {
    const existing = await prisma.learningMaterial.findFirst({ where: { title: s.title } });
    if (existing) continue;
    await prisma.learningMaterial.create({
      data: {
        title: s.title,
        description: s.description,
        topic: s.topic,
        author: s.author,
        gradeId: s.gradeId,
        subjectId: await subjectId(s.gradeId, s.subject),
        tags: { connect: await Promise.all(s.tags.map(async (t) => ({ id: await tagId(t) }))) },
      },
    });
  }
  console.log(`Seeded ${samples.length} sample learning materials.`);

  // Sample research projects with chapters
  const mkChapters = (projectId: number, count: number) => {
    const titles = ['Introduction', 'Review of Related Literature', 'Methodology', 'Results and Discussion', 'Conclusion'];
    return titles.slice(0, count).map((title, i) => ({
      title: `Chapter ${i + 1}: ${title}`,
      content: `Sample content for Chapter ${i + 1} (${title}). Replace with the actual chapter document.`,
      sortOrder: i + 1,
      projectId,
    }));
  };

  const researchSamples = [
    {
      title: 'The Impact of Online Learning on Student Performance',
      abstract: 'This study examines how online learning environments affect the academic performance of senior high school students, focusing on engagement, time management, and assessment outcomes.',
      authors: ['M. Reyes', 'A. Cruz'],
      categorySlug: 'research-project',
      gradeLevel: 'Grade 11',
      strand: 'STEM',
      adviser: 'Dr. L. Mendoza',
      school: 'San Jose National High School',
      year: 2025,
      keywords: ['online learning', 'academic performance', 'engagement'],
      description: 'A quantitative study on the effects of online learning modalities.',
      references: 'Mendoza, L. (2023). Digital Learning in the Philippines. Journal of Education.\nReyes, M. (2024). Remote Instruction and Student Outcomes.',
      chapterCount: 5,
    },
    {
      title: 'Mobile Gaming Habits Among Senior High School Students',
      abstract: 'A qualitative exploration of the gaming habits of senior high school students and their perceived effects on study habits and social interaction.',
      authors: ['K. Garcia'],
      categorySlug: 'practical-research-1',
      gradeLevel: 'Grade 11',
      strand: 'HUMSS',
      adviser: 'Prof. R. Torres',
      school: 'San Jose National High School',
      year: 2024,
      keywords: ['mobile gaming', 'study habits', 'adolescents'],
      description: 'A qualitative study using interviews and focus groups.',
      references: 'Garcia, K. (2024). Gaming and Youth Culture.',
      chapterCount: 3,
    },
    {
      title: 'Factors Affecting Reading Comprehension of Grade 7 Students',
      abstract: 'This correlational study identifies the factors that affect the reading comprehension levels of Grade 7 students, including vocabulary, reading frequency, and home environment.',
      authors: ['S. Fernandez', 'J. dela Cruz'],
      categorySlug: 'practical-research-2',
      gradeLevel: 'Grade 12',
      strand: 'STEM',
      adviser: 'Dr. C. Aquino',
      school: 'San Jose National High School',
      year: 2025,
      keywords: ['reading comprehension', 'vocabulary', 'literacy'],
      description: 'A quantitative correlational study on reading comprehension.',
      references: 'Aquino, C. (2022). Literacy Interventions in Junior High.',
      chapterCount: 5,
    },
    {
      title: 'Development of a Library Management System',
      abstract: 'The capstone project develops a web-based library management system that digitizes borrowing, cataloging, and reporting for a school library.',
      authors: ['D. Ramos', 'E. Lim'],
      categorySlug: 'capstone',
      gradeLevel: 'Grade 12',
      strand: 'ICT',
      adviser: 'Engr. P. Villanueva',
      school: 'San Jose National High School',
      year: 2025,
      keywords: ['library system', 'information system', 'software development'],
      description: 'An information system capstone project with full documentation.',
      references: 'Sommerville, I. (2016). Software Engineering. Pearson.',
      chapterCount: 5,
    },
  ];

  for (const r of researchSamples) {
    const existing = await prisma.researchProject.findFirst({ where: { title: r.title } });
    if (existing) continue;
    const project = await prisma.researchProject.create({
      data: {
        title: r.title,
        abstract: r.abstract,
        authors: JSON.stringify(r.authors),
        categoryId: categories[r.categorySlug],
        gradeLevel: r.gradeLevel,
        strand: r.strand,
        adviser: r.adviser,
        school: r.school,
        year: r.year,
        keywords: JSON.stringify(r.keywords),
        description: r.description,
        references: r.references,
        chapters: { create: mkChapters(0, 0) },
      },
    });
    for (const chapter of mkChapters(project.id, r.chapterCount)) {
      await prisma.researchChapter.create({ data: chapter });
    }
  }
  console.log(`Seeded ${researchSamples.length} sample research projects with chapters.`);

  // Sample stats so "most viewed" / "most downloaded" sorting has data
  const materialCount = await prisma.learningMaterial.count();
  if (materialCount > 0) {
    const materials = await prisma.learningMaterial.findMany({ take: 5, select: { id: true } });
    const researchProjects = await prisma.researchProject.findMany({ take: 4, select: { id: true } });
    for (const [i, m] of materials.entries()) {
      const daysAgo = i * 3;
      await prisma.view.createMany({
        data: Array.from({ length: 8 - i * 2 }, () => ({
          resourceType: 'material',
          resourceId: m.id,
          createdAt: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000),
        })),
      });
      await prisma.download.createMany({
        data: Array.from({ length: 4 - i }, () => ({
          resourceType: 'material',
          resourceId: m.id,
          createdAt: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000),
        })),
      });
    }
    for (const [i, r] of researchProjects.entries()) {
      const daysAgo = i * 4 + 1;
      await prisma.view.createMany({
        data: Array.from({ length: 6 - i }, () => ({
          resourceType: 'research',
          resourceId: r.id,
          createdAt: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000),
        })),
      });
    }
    console.log('Seeded sample view/download statistics.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
