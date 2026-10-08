import React, { useState, useEffect } from 'react';
import { X, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source URL safely via CDN fallback if needed
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

export default function PdfImageExtractorModal({ isOpen, pdfFile, onClose, onImportPages }) {
  const [pages, setPages] = useState([]); // Array of { pageNum, dataUrl, file }
  const [selectedPages, setSelectedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfFile || !isOpen) return;
    loadPdfPages();
  }, [pdfFile, isOpen]);

  const loadPdfPages = async () => {
    setIsLoading(true);
    setError(null);
    setPages([]);
    setSelectedPages([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const renderedPages = [];
      const numPages = Math.min(pdf.numPages, 10); // Extract up to first 10 pages max

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Convert dataUrl to File
        const blob = await (await fetch(dataUrl)).blob();
        const extractedFile = new File([blob], `pdf-page-${pageNum}-${Date.now()}.jpg`, { type: 'image/jpeg' });

        renderedPages.push({
          pageNum,
          dataUrl,
          file: extractedFile
        });
      }

      setPages(renderedPages);
      // Auto-select page 1 by default
      if (renderedPages.length > 0) {
        setSelectedPages([1]);
      }
    } catch (err) {
      console.error('Error loading PDF pages:', err);
      setError('Unable to parse PDF pages. Please make sure the PDF file is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePageSelection = (pageNum) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleImport = () => {
    const selected = pages.filter((p) => selectedPages.includes(p.pageNum));
    if (selected.length > 0) {
      onImportPages(selected.map((p) => p.file));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full text-white shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Extract Product Photos from PDF</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm">Rendering PDF pages into photos...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Select the pages you want to convert into product photos ({selectedPages.length} selected):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pages.map((p) => {
                  const isSelected = selectedPages.includes(p.pageNum);
                  return (
                    <div
                      key={p.pageNum}
                      onClick={() => togglePageSelection(p.pageNum)}
                      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNum}`}
                        className="w-full h-40 object-contain rounded-lg bg-slate-900"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono font-semibold text-slate-300">
                        Page {p.pageNum}
                      </div>
                      <div
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition ${
                          isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={selectedPages.length === 0 || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Import {selectedPages.length} Photo(s)
          </button>
        </div>
      </div>
    </div>
  );
}
