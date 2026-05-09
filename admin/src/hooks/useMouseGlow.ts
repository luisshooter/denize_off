import { useEffect } from 'react';

/**
 * Rastreia a posição do mouse e atualiza as CSS custom properties
 * --mouse-x e --mouse-y em todos os elementos .glow-card.
 * Só ativo em dispositivos com hover real (desktop) — não afeta mobile.
 */
export function useMouseGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cards = document.querySelectorAll<HTMLElement>('.glow-card');
        for (const card of cards) {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
      });
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);
}
