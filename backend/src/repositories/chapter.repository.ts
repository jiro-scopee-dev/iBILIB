import prisma from '../models/db';

export const chapterRepository = {
  findManyByProject(projectId: number) {
    return prisma.researchChapter.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
      include: { file: true },
    });
  },

  findById(id: number) {
    return prisma.researchChapter.findUnique({
      where: { id },
      include: { file: true, project: { select: { id: true, title: true } } },
    });
  },

  /** Highest sortOrder for a project, or 0 when empty. */
  async maxSortOrder(projectId: number): Promise<number> {
    const agg = await prisma.researchChapter.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    return agg._max.sortOrder ?? 0;
  },

  create(data: {
    title: string;
    content?: string | null;
    sortOrder?: number;
    projectId: number;
    fileId?: number | null;
  }) {
    return prisma.researchChapter.create({
      data: {
        title: data.title,
        content: data.content ?? null,
        sortOrder: data.sortOrder ?? 1,
        projectId: data.projectId,
        ...(data.fileId ? { file: { connect: { id: data.fileId } } } : {}),
      },
      include: { file: true },
    });
  },

  update(id: number, data: {
    title?: string;
    content?: string | null;
    sortOrder?: number;
    fileId?: number | null;
  }) {
    const update: any = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.content !== undefined) update.content = data.content;
    if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;
    if (data.fileId !== undefined) {
      update.file = data.fileId ? { connect: { id: data.fileId } } : { disconnect: true };
    }
    return prisma.researchChapter.update({ where: { id }, data: update, include: { file: true } });
  },

  disconnectFile(chapterId: number) {
    return prisma.researchChapter.update({
      where: { id: chapterId },
      data: { file: { disconnect: true } },
    });
  },

  delete(id: number) {
    return prisma.researchChapter.delete({ where: { id } });
  },
};
