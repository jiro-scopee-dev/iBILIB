import prisma from '../models/db';

export const gradeRepository = {
  findAll() {
    return prisma.grade.findMany({
      orderBy: { level: 'asc' },
      include: { _count: { select: { subjects: true, materials: true } } },
    });
  },

  findById(id: number) {
    return prisma.grade.findUnique({
      where: { id },
      include: {
        subjects: { orderBy: { name: 'asc' } },
        _count: { select: { subjects: true, materials: true } },
      },
    });
  },

  findByLevel(level: number) {
    return prisma.grade.findUnique({ where: { level } });
  },

  create(data: { name: string; level: number }) {
    return prisma.grade.create({ data });
  },

  update(id: number, data: Partial<{ name: string; level: number }>) {
    return prisma.grade.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.grade.delete({ where: { id } });
  },
};
