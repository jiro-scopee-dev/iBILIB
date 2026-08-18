import prisma from '../models/db';

export const subjectRepository = {
  findAll(opts: { gradeId?: number } = {}) {
    return prisma.subject.findMany({
      where: opts.gradeId ? { gradeId: opts.gradeId } : undefined,
      orderBy: [{ gradeId: 'asc' }, { name: 'asc' }],
      include: {
        grade: true,
        _count: { select: { materials: true } },
      },
    });
  },

  findById(id: number) {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        grade: true,
        materials: {
          orderBy: { createdAt: 'desc' },
          include: { tags: true, file: true },
        },
      },
    });
  },

  create(data: { name: string; gradeId: number }) {
    return prisma.subject.create({ data });
  },

  update(id: number, data: Partial<{ name: string; gradeId: number }>) {
    return prisma.subject.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.subject.delete({ where: { id } });
  },
};
