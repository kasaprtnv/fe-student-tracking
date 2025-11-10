'use client';
import { pdfService } from '@/services/pdf.service';
import { useEffect, useState } from 'react';

export default function ViewPdf({
  url,
  filename,
  height = '100%',
  width = '100%',
}: {
  url: string;
  filename: string;
  height?: string;
  width?: string;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      setError(null);
      setPdfUrl(null);
      try {
        const data = await pdfService.fetchPdf(url);
        setPdfUrl(data.data[0].url);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    fetchPdf();
  }, [url]);

  return (
    <div>
      {error && <div>Error: {error}</div>}
      {pdfUrl && (
        <div>
          <h2>{filename}</h2>
          <iframe
            src={pdfUrl}
            style={{ width: width, height: height, border: 'none' }}
            title="PDF Viewer"
          />
        </div>
      )}
    </div>
  );
}
