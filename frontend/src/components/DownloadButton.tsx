'use client';

import { useState } from 'react';
import { FileInfo, ResourceType } from '../types';
import { filesService } from '../services/files.service';
import { statsService } from '../services/stats.service';
import { formatBytes } from '../utils/format';

export default function DownloadButton({
  resourceType,
  resourceId,
  file,
  label,
}: {
  resourceType: ResourceType;
  resourceId: number | string;
  file: FileInfo | null;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!file) return <span className="muted">No file attached</span>;

  const handleDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      await statsService.recordDownload(resourceType, resourceId);
      window.open(filesService.downloadUrl(file.id), '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="download-row">
      <button className="btn btn-primary" onClick={handleDownload} disabled={busy}>
        {busy ? 'Opening...' : label ?? `Download ${file.originalFilename}`}
      </button>
      <span className="muted file-meta">
        {formatBytes(file.fileSize)} · {file.fileType}
      </span>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
