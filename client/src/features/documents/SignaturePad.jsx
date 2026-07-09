import { useRef, useEffect, useState, useCallback } from "react";

// A small canvas you draw a signature on. Emits a PNG data URL via onChange
// (null when cleared). If `value` is provided it is shown as the starting mark.
export const SignaturePad = ({ label = "Signature", value, onChange, height = 160 }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [hasInk, setHasInk] = useState(Boolean(value));

  // Set up the canvas backing store for crisp lines on high-DPI screens.
  const prepare = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * ratio) {
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#12303a";
    return ctx;
  }, []);

  // Paint an existing signature (edit mode) once the canvas is laid out.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx = prepare();
    const img = new Image();
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHasInk(true);
    };
    img.src = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    prepare();
    drawing.current = true;
    last.current = pos(e);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) setHasInk(true);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (onChange) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    if (onChange) onChange(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-dim">{label}</span>
        {hasInk ? (
          <button type="button" onClick={clear} className="text-xs text-red-300 hover:text-red-200">
            Clear
          </button>
        ) : null}
      </div>
      <div className="rounded-lg border border-line bg-white overflow-hidden" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair block"
          style={{ height }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <span className="text-xs text-faint">Draw your signature with the mouse or finger.</span>
    </div>
  );
};
