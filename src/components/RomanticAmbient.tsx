import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'heart' | 'petal';
  color: string;
}

interface RomanticAmbientProps {
  active: boolean;
}

export const RomanticAmbient: React.FC<RomanticAmbientProps> = ({ active }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colors = ['#6c2721', '#8a3d36', '#ffdad6', '#feccc0', '#d5e7d5', '#ffb4ab'];
    
    // Spawn initial particles
    const initial: Particle[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 14 + 10,
      speedY: Math.random() * 0.9 + 0.4,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.5 + 0.3,
      type: Math.random() > 0.4 ? 'petal' : 'heart',
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(initial);

    let animationFrameId: number;

    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => {
          let newY = p.y + p.speedY;
          let newX = p.x + p.speedX;
          let newRot = p.rotation + p.rotationSpeed;

          if (newY > window.innerHeight + 20) {
            newY = -20;
            newX = Math.random() * window.innerWidth;
          }
          if (newX < -20) newX = window.innerWidth + 20;
          if (newX > window.innerWidth + 20) newX = -20;

          return {
            ...p,
            y: newY,
            x: newX,
            rotation: newRot,
          };
        })
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transition-transform select-none"
          style={{
            transform: `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            color: p.color,
          }}
        >
          {p.type === 'heart' ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="drop-shadow-[0_2px_4px_rgba(108,39,33,0.15)]"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            // Delicate organic rose petal SVG
            <svg
              width={p.size * 1.2}
              height={p.size * 1.5}
              viewBox="0 0 30 40"
              fill={p.color}
              className="drop-shadow-[0_2px_6px_rgba(108,39,33,0.1)]"
            >
              <path
                d="M15,2 Q28,12 26,26 Q23,38 15,38 Q7,38 4,26 Q2,12 15,2 Z"
                fillOpacity="0.85"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};
