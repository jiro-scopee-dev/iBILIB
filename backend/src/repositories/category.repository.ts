import prisma from '../models/db';

export const categoryRepository = {
  findAll() {
    return prisma.researchCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { projects: true } } },
    });
  },

  findById(id: number) {
    return prisma.researchCategory.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.researchCategory.findUnique({ where: { slug } });
  },

  create(data: { name: string; slug: string }) {
    return prisma.researchCategory.create({ data });
  },

  update(id: number, data: Partial<{ name: string; slug: string }>) {
    return prisma.researchCategory.update({ where: { id }, data });
  },

  delete(id: number) {
    return prisma.researchCategory.delete({ where: { id } });
  },
};
