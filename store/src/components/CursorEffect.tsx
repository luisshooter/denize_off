import { useEffect } from 'react';

export default function CursorEffect() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    if (!fine || hasTouch) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');

    const BASE = 'position:fixed;pointer-events:none;border-radius:50%;transform:translate(-50%,-50%);left:-200px;top:-200px;mix-blend-mode:difference;';
    dot.style.cssText  = `${BASE}width:12px;height:12px;background:#fff;z-index:99999;transition:width .18s ease,height .18s ease;`;
    ring.style.cssText = `${BASE}width:36px;height:36px;border:2px solid #fff;z-index:99998;opacity:0.75;transition:width .3s cubic-bezier(.34,1.56,.64,1),height .3s cubic-bezier(.34,1.56,.64,1);`;

    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add('cursor-hidden');

    let x = -200, y = -200, rx = -200, ry = -200, raf: number;

    const onMove = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };

    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a,button,[role="button"]')) {
        dot.style.width   = '6px';
        dot.style.height  = '6px';
        ring.style.width  = '54px';
        ring.style.height = '54px';
        ring.style.opacity = '0.95';
      }
    };
    const onOut = (e: MouseEvent) => {
      const rel = e.relatedTarget as HTMLElement | null;
      if (!rel?.closest('a,button,[role="button"]')) {
        dot.style.width   = '12px';
        dot.style.height  = '12px';
        ring.style.width  = '36px';
        ring.style.height = '36px';
        ring.style.opacity = '0.75';
      }
    };

    const tick = () => {
      dot.style.left  = `${x}px`;
      dot.style.top   = `${y}px`;
      rx += (x - rx) * 0.13;
      ry += (y - ry) * 0.13;
      ring.style.left = `${rx}px`;
      ring.style.top  = `${ry}px`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout',  onOut,  { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('cursor-hidden');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout',  onOut);
      cancelAnimationFrame(raf);
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
}
