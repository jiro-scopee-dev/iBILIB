import prisma from '../models/db';

export type ResourceType = 'material' | 'research' | 'chapter';

export const statsRepository = {
  recordView(resourceType: ResourceType, resourceId: number) {
    return prisma.view.create({ data: { resourceType, resourceId } });
  },

  recordDownload(resourceType: ResourceType, resourceId: number) {
    return prisma.download.create({ data: { resourceType, resourceId } });
  },

  /** Counts per (resourceType, resourceId) for a given set of ids. */
  async countViews(resourceType: ResourceType, resourceIds: number[]) {
    const rows = await prisma.view.groupBy({
      by: ['resourceId'],
      where: { resourceType, resourceId: { in: resourceIds } },
      _count: { _all: true },
    });
    const map = new Map<number, number>();
    for (const r of rows) map.set(r.resourceId, r._count._all);
    return map;
  },

  async countDownloads(resourceType: ResourceType, resourceIds: number[]) {
    const rows = await prisma.download.groupBy({
      by: ['resourceId'],
      where: { resourceType, resourceId: { in: resourceIds } },
      _count: { _all: true },
    });
    const map = new Map<number, number>();
    for (const r of rows) map.set(r.resourceId, r._count._all);
    return map;
  },

  async countForResource(resourceType: ResourceType, resourceId: number) {
    const [views, downloads] = await Promise.all([
      prisma.view.count({ where: { resourceType, resourceId } }),
      prisma.download.count({ where: { resourceType, resourceId } }),
    ]);
    return { views, downloads };
  },

  async countForResources(resourceType: ResourceType, resourceIds: number[]) {
    const [views, downloads] = await Promise.all([
      this.countViews(resourceType, resourceIds),
      this.countDownloads(resourceType, resourceIds),
    ]);
    return {
      viewsOf(id: number) {
        return views.get(id) ?? 0;
      },
      downloadsOf(id: number) {
        return downloads.get(id) ?? 0;
      },
    };
  },

  async deleteForResource(resourceType: ResourceType, resourceId: number) {
    await Promise.all([
      prisma.view.deleteMany({ where: { resourceType, resourceId } }),
      prisma.download.deleteMany({ where: { resourceType, resourceId } }),
    ]);
  },
};
