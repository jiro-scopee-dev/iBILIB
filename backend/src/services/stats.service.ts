import { ApiError } from '../middleware/errorHandler';
import prisma from '../models/db';
import { statsRepository, ResourceType } from '../repositories/stats.repository';

export async function recordView(resourceType: ResourceType, resourceId: number) {
  await assertResourceExists(resourceType, resourceId);
  return statsRepository.recordView(resourceType, resourceId);
}

export async function recordDownload(resourceType: ResourceType, resourceId: number) {
  await assertResourceExists(resourceType, resourceId);
  return statsRepository.recordDownload(resourceType, resourceId);
}

async function assertResourceExists(resourceType: ResourceType, resourceId: number) {
  const found =
    resourceType === 'material'
      ? await prisma.learningMaterial.findUnique({ where: { id: resourceId } })
      : resourceType === 'research'
        ? await prisma.researchProject.findUnique({ where: { id: resourceId } })
        : await prisma.researchChapter.findUnique({ where: { id: resourceId } });
  if (!found) throw new ApiError(404, `${resourceType} with id ${resourceId} not found`);
}

export async function resourceStats(resourceType: ResourceType, resourceId: number) {
  return statsRepository.countForResource(resourceType, resourceId);
}
