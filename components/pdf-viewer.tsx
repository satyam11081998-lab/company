'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Next.js standard setup for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  userEmail: string;
  userId: string;
}

export default function PDFViewer({ url, userEmail, userId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [width, setWidth] = useState<number>(1000);
  const [isBlackedOut, setIsBlackedOut] = useState(false);

  // 1. Aggressive Window Focus/Blur Blackout
  useEffect(() => {
    const handleBlur = () => setIsBlackedOut(true);
    // We intentionally do NOT auto-recover on focus. 
    // Snipping tools can trigger weird focus events when dragging. 
    // The user must explicitly click "Resume Reading".

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // 2. Hostile Keyboard Hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerBlackout('Screenshots are disabled for copyrighted material.');
        return;
      }
      // Windows Snipping Tool (Meta/Windows + Shift + S)
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerBlackout('Screenshots are disabled for copyrighted material.');
        return;
      }
      // Mac Screenshot (Meta + Shift + 3/4/5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        triggerBlackout('Screenshots are disabled for copyrighted material.');
        return;
      }
      // Printing (Ctrl/Cmd + P)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerBlackout('Printing is disabled.');
        return;
      }
      // Saving (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerBlackout('Saving is disabled.');
        return;
      }
      // F12 / DevTools
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        triggerBlackout('Developer tools are disabled in the viewer.');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerBlackout = (message: string) => {
    setIsBlackedOut(true);
    toast.error(message);
  };

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

  // 3. Forensic Watermarking overlay
  const watermarkText = `MECE — ${userEmail} — ${userId}`;

  return (
    <div 
      className="flex flex-col items-center select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        toast.error('Right-click is disabled.');
      }}
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

      <div className="relative shadow-2xl ring-1 ring-border bg-white overflow-hidden" style={{ minHeight: '600px', minWidth: '800px' }}>
        
        {/* The Blackout Overlay */}
        {isBlackedOut && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-8">
            <AlertTriangle className="h-16 w-16 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Viewing Paused</h2>
            <p className="text-white/70 text-center max-w-md mb-6">
              The document has been hidden because the window lost focus or a screenshot shortcut was detected.
            </p>
            <Button 
              variant="outline" 
              className="bg-white text-black hover:bg-gray-200"
              onClick={() => setIsBlackedOut(false)}
            >
              Resume Reading
            </Button>
          </div>
        )}

        {/* The Forensic Watermark Overlay */}
        {!isBlackedOut && (
          <div className="absolute inset-0 z-40 pointer-events-none opacity-[0.04] overflow-hidden flex flex-wrap content-start items-start mix-blend-multiply">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                className="text-black font-bold text-2xl whitespace-nowrap -rotate-45 m-8 select-none"
              >
                {watermarkText}
              </div>
            ))}
          </div>
        )}

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
