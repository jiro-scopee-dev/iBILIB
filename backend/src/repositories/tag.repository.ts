import prisma from '../models/db';

export const tagRepository = {
  findAll() {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { materials: true } } },
    });
  },

  findById(id: number) {
    return prisma.tag.findUnique({ where: { id } });
  },

  findByName(name: string) {
    return prisma.tag.findUnique({ where: { name } });
  },

  create(name: string) {
    return prisma.tag.create({ data: { name } });
  },

  update(id: number, name: string) {
    return prisma.tag.update({ where: { id }, data: { name } });
  },

  delete(id: number) {
    return prisma.tag.delete({ where: { id } });
  },

  /** Returns existing tags and creates any missing ones. Returns tag records. */
  async findOrCreateMany(names: string[]): Promise<{ id: number; name: string }[]> {
    const uniqueNames = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
    if (uniqueNames.length === 0) return [];

    const tags = await prisma.tag.findMany({ where: { name: { in: uniqueNames } } });
    const found = new Set(tags.map((t) => t.name));
    const missing = uniqueNames.filter((n) => !found.has(n));
    if (missing.length > 0) {
      await prisma.tag.createMany({ data: missing.map((name) => ({ name })) });
    }
    return prisma.tag.findMany({ where: { name: { in: uniqueNames } }, select: { id: true, name: true } });
  },
};
