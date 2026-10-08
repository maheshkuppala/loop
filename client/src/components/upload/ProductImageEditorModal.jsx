import React, { useState, useRef, useEffect } from 'react';
import {
  X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Check, RefreshCw, Sliders, Crop as CropIcon
} from 'lucide-react';

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1 Square', value: 1 / 1 },
  { label: '4:5 Portrait', value: 4 / 5 },
  { label: '3:4 Standard', value: 3 / 4 },
  { label: '16:9 Landscape', value: 16 / 9 }
];

export default function ProductImageEditorModal({ isOpen, imageSrc, onClose, onSave }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[1].value); // Default 1:1
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      resetEditor();
    };
  }, [imageSrc]);

  const resetEditor = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio(ASPECT_RATIOS[1].value);
  };

  const handleRotate = (deg) => {
    setRotation((prev) => (prev + deg + 360) % 360);
  };

  const handleSave = () => {
    if (!imgRef.current) return;
    setIsProcessing(true);

    try {
      const img = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const is90or270 = rotation % 180 !== 0;
      const origW = is90or270 ? img.height : img.width;
      const origH = is90or270 ? img.width : img.height;

      let targetW = origW;
      let targetH = origH;

      if (aspectRatio) {
        if (targetW / targetH > aspectRatio) {
          targetW = targetH * aspectRatio;
        } else {
          targetH = targetW / aspectRatio;
        }
      }

      canvas.width = targetW;
      canvas.height = targetH;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.scale(zoom, zoom);

      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) {
            const file = new File([blob], `edited-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const previewUrl = URL.createObjectURL(blob);
            onSave({ file, url: previewUrl });
            onClose();
          }
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Error saving edited image:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full text-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CropIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Product Image Editor & Cropper</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Preview Canvas */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden min-h-[300px]">
          <div
            className="relative transition-transform duration-200 flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
              maxHeight: '420px'
            }}
          >
            <img
              src={imageSrc}
              alt="Editor preview"
              className="max-h-[380px] max-w-full object-contain rounded border border-slate-800 shadow-lg"
            />
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="bg-slate-900 p-6 space-y-4 border-t border-slate-800">
          {/* Aspect Ratios */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-400">Aspect Ratio:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    aspectRatio === ratio.value
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transform Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
            </div>

            {/* Rotation Buttons */}
            <div className="flex items-center justify-center gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <button
                onClick={() => handleRotate(-90)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 transition"
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-emerald-400 font-medium px-1">{rotation}°</span>
              <button
                onClick={() => handleRotate(90)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 transition"
                title="Rotate 90° Right"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Flip Buttons */}
            <div className="flex items-center justify-center gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`p-2 rounded-lg transition ${flipH ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-700 text-slate-300'}`}
                title="Flip Horizontally"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`p-2 rounded-lg transition ${flipV ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-700 text-slate-300'}`}
                title="Flip Vertically"
              >
                <FlipVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={resetEditor}
              className="flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl border border-slate-700/50 text-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Reset All
            </button>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Processing Image...' : 'Apply & Save Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
