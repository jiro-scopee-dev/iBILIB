import prisma from '../models/db';

export const fileRepository = {
  findById(id: number) {
    return prisma.file.findUnique({ where: { id } });
  },

  findAll() {
    return prisma.file.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        material: { select: { id: true, title: true } },
        researchProject: { select: { id: true, title: true } },
        researchChapter: { select: { id: true, title: true } },
      },
    });
  },

  create(data: {
    filename: string;
    originalFilename: string;
    fileType: string;
    fileSize: number;
    path: string;
  }) {
    return prisma.file.create({ data });
  },

  delete(id: number) {
    return prisma.file.delete({ where: { id } });
  },
};
