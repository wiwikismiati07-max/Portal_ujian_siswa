import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PenTool, RotateCcw, Check, X, Eraser, Palette, Smartphone, Laptop } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  title: string;
  signerRole: 'kepala_sekolah' | 'guru';
  signerName: string;
  initialSignature?: string | null;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  signerRole,
  signerName,
  initialSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const hasDrawn = useRef(false);

  const [strokeColor, setStrokeColor] = useState<'#0f172a' | '#1e3a8a'>('#0f172a'); // Hitam atau Biru Resmi
  const [strokeWidth, setStrokeWidth] = useState<number>(2.8);
  const [canvasEmpty, setCanvasEmpty] = useState<boolean>(true);

  // Initialize and resize canvas with Retina / High-DPI support
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Use actual CSS pixels
    const width = Math.max(300, Math.floor(rect.width));
    const height = 220;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    // Clear transparent background
    ctx.clearRect(0, 0, width, height);

    // If initial signature provided and canvas is empty, load it
    if (initialSignature && !hasDrawn.current) {
      const img = new Image();
      img.onload = () => {
        // Draw centered
        const hRatio = (height * 0.8) / img.height;
        const wRatio = (width * 0.8) / img.width;
        const ratio = Math.min(hRatio, wRatio, 1);
        const drawW = img.width * ratio;
        const drawH = img.height * ratio;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        setCanvasEmpty(false);
      };
      img.src = initialSignature;
    }
  }, [strokeColor, strokeWidth, initialSignature]);

  useEffect(() => {
    if (isOpen) {
      hasDrawn.current = false;
      setCanvasEmpty(!initialSignature);
      // Wait for layout animation
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initCanvas, initialSignature]);

  // Explicitly prevent page scrolling on touch devices during signature gestures
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('touchstart', preventScroll, { passive: false });
    canvas.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventScroll);
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);

  // Update stroke properties when color/width changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [strokeColor, strokeWidth]);

  // Coordinates extraction supporting Touch & Pointer events
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    isDrawing.current = true;
    hasDrawn.current = true;
    const coord = getCoordinates(e);
    points.current = [coord];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(coord.x, coord.y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(coord.x, coord.y);

    setCanvasEmpty(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coord = getCoordinates(e);
    points.current.push(coord);

    if (points.current.length >= 3) {
      const p1 = points.current[points.current.length - 2];
      const p2 = points.current[points.current.length - 1];
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };

      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midPoint.x, midPoint.y);
    } else {
      ctx.lineTo(coord.x, coord.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (canvas && e.pointerId) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    isDrawing.current = false;
    points.current = [];
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    hasDrawn.current = true;
    setCanvasEmpty(true);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvasEmpty) return;

    // Export transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {signerRole === 'kepala_sekolah' ? 'Kepala UPT SMP Negeri 7' : 'Guru Mata Pelajaran'}: <strong className="text-slate-700">{signerName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Banner */}
        <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100/60 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-indigo-700">
              <Smartphone className="w-3.5 h-3.5" /> Touchscreen HP
            </span>
            <span>&amp;</span>
            <span className="flex items-center gap-1 font-semibold text-indigo-700">
              <Laptop className="w-3.5 h-3.5" /> Touchpad / Mouse Laptop
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">Goreskan tanda tangan di bawah</span>
        </div>

        {/* Canvas Area Container */}
        <div className="p-5 flex flex-col items-center">
          <div
            ref={containerRef}
            className="w-full h-[220px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl relative overflow-hidden flex items-center justify-center select-none shadow-inner"
            style={{ touchAction: 'none' }}
          >
            {/* Background Guideline for Signature Baseline */}
            <div className="absolute inset-x-8 bottom-12 border-b border-slate-300/70 pointer-events-none flex justify-between text-[10px] text-slate-400 font-serif tracking-wider">
              <span>Tanda Tangan Di Atas Garis Ini</span>
              <span>UPT SMPN 7 PASURUAN</span>
            </div>

            {canvasEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                <PenTool className="w-8 h-8 opacity-30 mb-1" />
                <span className="text-xs font-medium">Gunakan jari tangan, stylus pen, atau mouse untuk bertanda tangan</span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="cursor-crosshair w-full h-full relative z-10"
              style={{ touchAction: 'none' }}
            />
          </div>

          {/* Canvas Toolbar: Ink Color & Thickness & Clear */}
          <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Ink Color */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Palette className="w-3.5 h-3.5" /> Tinta:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStrokeColor('#0f172a')}
                  className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    strokeColor === '#0f172a'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-950 inline-block border border-white"></span>
                  <span>Hitam</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStrokeColor('#1e3a8a')}
                  className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    strokeColor === '#1e3a8a'
                      ? 'bg-blue-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-800 inline-block border border-white"></span>
                  <span>Biru Resmi</span>
                </button>
              </div>
            </div>

            {/* Thickness */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Tebal:</span>
              <button
                type="button"
                onClick={() => setStrokeWidth(2.0)}
                className={`px-2 py-1 rounded-lg cursor-pointer ${strokeWidth === 2.0 ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Halus
              </button>
              <button
                type="button"
                onClick={() => setStrokeWidth(2.8)}
                className={`px-2 py-1 rounded-lg cursor-pointer ${strokeWidth === 2.8 ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Sedang
              </button>
              <button
                type="button"
                onClick={() => setStrokeWidth(4.0)}
                className={`px-2 py-1 rounded-lg cursor-pointer ${strokeWidth === 4.0 ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Tebal
              </button>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Hapus &amp; Ulangi</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            Tanda tangan tersimpan permanen dan otomatis tampil di seluruh berkas laporan.
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={canvasEmpty}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                canvasEmpty
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Simpan Tanda Tangan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
