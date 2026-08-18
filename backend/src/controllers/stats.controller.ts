import { recordDownload, recordView } from '../services/stats.service';

export const statsController = {
  async view(req: any, res: any) {
    const { resourceType, resourceId } = req.validatedBody;
    await recordView(resourceType, resourceId);
    res.status(201).json({ ok: true });
  },

  async download(req: any, res: any) {
    const { resourceType, resourceId } = req.validatedBody;
    await recordDownload(resourceType, resourceId);
    res.status(201).json({ ok: true });
  },
};
