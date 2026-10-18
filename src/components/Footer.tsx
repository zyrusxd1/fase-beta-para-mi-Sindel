import React from 'react';
import { ScreenType } from '../types';

interface FooterProps {
  onNavigate?: (screen: ScreenType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-2px_12px_rgba(138,61,54,0.03)] py-12 md:py-16 relative overflow-hidden border-t border-outline-variant/30">
      {/* Decorative ambient background blur */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-secondary-container/20 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto">
          {/* Dimensional Mailbox Keepsake Icon */}
          <div className="relative mb-5 group cursor-pointer transition-transform hover:scale-105">
            <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_3px_rgba(0,0,0,0.25),0_6px_16px_rgba(138,61,54,0.25)]">
              <span className="material-symbols-outlined text-[24px]">markunread_mailbox</span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary-container text-on-secondary-container items-center justify-center shadow-sm">
                <span
                  className="material-symbols-outlined text-[10px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
              </span>
            </span>
          </div>

          <h2 className="font-headline-md text-headline-md text-primary font-serif italic mb-2">
            Guardado en Mi Corazón
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-5 italic max-w-md">
            Cada latido, cada recuerdo y cada instante compartido escrito para la eternidad.
          </p>

          {/* Quick Screen links */}
          {onNavigate && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              <button
                onClick={() => onNavigate('inicio')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Inicio :3
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('cartas-de-amor')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Cartas de Amor ❤️
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('galeria-de-recuerdos')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Galería 🎞️
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('razones-por-las-que-te-amo')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Por Qué Te Amo 💖
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('cuenta-regresiva')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Cuenta Regresiva ⏳
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mb-5 text-primary/70">
            <span className="h-px w-16 bg-outline-variant"></span>
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span className="h-px w-16 bg-outline-variant"></span>
          </div>

          <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold">
            Hecho con amor infinito • Siempre tuyo
          </p>
        </div>
      </div>
    </footer>
  );
};
