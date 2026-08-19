'use client';

import { FileInfo, ResourceType } from '../types';
import { filesService } from '../services/files.service';
import DownloadButton from './DownloadButton';
import { formatBytes } from '../utils/format';

export default function FileViewer({
  file,
  resourceType,
  resourceId,
  downloadLabel = 'Download file',
}: {
  file: FileInfo | null;
  resourceType: ResourceType;
  resourceId: number | string;
  downloadLabel?: string;
}) {
  if (!file) return null;

  const url = filesService.rawUrl(file.id);
  const isPdf = file.fileType === 'application/pdf';
  const isImage = file.fileType.startsWith('image/');
  const previewable = isPdf || isImage;

  return (
    <section className="file-viewer">
      <div className="file-viewer-head">
        <div>
          <h2>{isPdf ? 'Preview' : isImage ? 'Image preview' : 'File preview'}</h2>
          <p className="muted file-meta">
            {file.originalFilename} · {formatBytes(file.fileSize)} · {file.fileType}
          </p>
        </div>
        <div className="file-viewer-actions">
          {previewable && (
            <a className="btn btn-secondary" href={url} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          )}
          <DownloadButton resourceType={resourceType} resourceId={resourceId} file={file} label={downloadLabel} />
        </div>
      </div>

      {isPdf ? (
        <div className="file-viewer-frame">
          <iframe src={url} title={`Preview of ${file.originalFilename}`} allowFullScreen />
        </div>
      ) : isImage ? (
        <div className="file-viewer-frame is-image">
          <img src={url} alt={file.originalFilename} />
        </div>
      ) : (
        <div className="file-viewer-unavailable">
          <p className="muted">
            This file type ({file.fileType}) cannot be previewed inside the browser. Use the download button to open
            it with the right application.
          </p>
        </div>
      )}
    </section>
  );
}
