import { useEffect, useRef, type RefObject } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

// Definimos la interfaz para las props esperadas
interface ProgressCursorProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export const ProgressCursor = ({ containerRef }: ProgressCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      
      // OBTENEMOS EL VALOR SIN SUSCRIBIRNOS A CAMBIOS DE ESTADO
      const { currentTime, duration } = usePlayerStore.getState();

      if (cursor && container && duration > 0) {
        const progress = currentTime / duration;
        const containerWidth = container.clientWidth;
        // Usamos transform para máxima fluidez (GPU)
        cursor.style.transform = `translateX(${progress * containerWidth}px)`;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [containerRef]); // YA NO DEPENDE DE CURRENTTIME NI DURATION

  return (
    <div
      ref={cursorRef}
      className="absolute top-0 bottom-0 z-20 w-0.5 bg-red-500 pointer-events-none"
      style={{ willChange: 'transform' }}
    />
  );
};