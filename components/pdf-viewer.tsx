'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Next.js standard setup for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [width, setWidth] = useState<number>(1000);

  useEffect(() => {
    // Basic responsive width handling
    const handleResize = () => {
      setWidth(Math.min(window.innerWidth - 64, 1200));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div 
      className="flex flex-col items-center select-none"
      onContextMenu={(e) => e.preventDefault()} // Disable right-click globally on the viewer
    >
      <div className="flex items-center gap-4 bg-background/95 backdrop-blur z-10 sticky top-16 p-4 rounded-xl border border-border shadow-sm mb-6 mt-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setPageNumber(p => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium tabular-nums text-foreground">
          Page {pageNumber} of {numPages || '--'}
        </span>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
          disabled={pageNumber >= (numPages || 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium tabular-nums w-12 text-center text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setScale(s => Math.min(3, s + 0.2))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative shadow-2xl ring-1 ring-border bg-white" style={{ minHeight: '600px', minWidth: '800px' }}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full w-full min-h-[600px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
          error={
            <div className="flex items-center justify-center h-full w-full min-h-[600px] text-destructive p-8 text-center bg-destructive/5">
              Could not load the deck. The file might be corrupted or in an unsupported format (like PPTX).
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            width={width}
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            className="pointer-events-none" // Prevents dragging images out
          />
        </Document>
      </div>
    </div>
  );
}
