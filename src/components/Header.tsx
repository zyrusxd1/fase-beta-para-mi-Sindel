import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { AudioTrack, soundSynthesizer } from '../utils/audioPlayer';
import { TrackLibraryModal } from './TrackLibraryModal';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  romanticMode: boolean;
  onToggleRomanticMode: () => void;
  onOpenSettings: () => void;
  isTrackLibraryOpen: boolean;
  onOpenTrackLibrary: () => void;
  onCloseTrackLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  romanticMode,
  onToggleRomanticMode,
  onOpenSettings,
  isTrackLibraryOpen,
  onOpenTrackLibrary,
  onCloseTrackLibrary,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(soundSynthesizer.isPlaying());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>(soundSynthesizer.getTracks());
  const [currentTrack, setCurrentTrack] = useState(soundSynthesizer.getCurrentTrack());
  const [playerError, setPlayerError] = useState('');

  useEffect(() => {
    const unsubscribe = soundSynthesizer.subscribeState((playing) => {
      setIsPlaying(playing);
      setCurrentTrack(soundSynthesizer.getCurrentTrack());
    });
    const unsubscribeTracks = soundSynthesizer.subscribeTracks((updatedTracks) => {
      setTracks(updatedTracks);
      setCurrentTrack(soundSynthesizer.getCurrentTrack());
    });
    const unsubscribeErrors = soundSynthesizer.subscribeError(setPlayerError);
    void soundSynthesizer.loadSavedTracks().catch((cause: unknown) => {
      setPlayerError(cause instanceof Error ? cause.message : 'No se pudo cargar la biblioteca.');
    });
    return () => {
      unsubscribe();
      unsubscribeTracks();
      unsubscribeErrors();
    };
  }, []);

  const handleToggleMusic = () => {
    setPlayerError('');
    soundSynthesizer.toggle();
  };

  const handleOpenTrackLibrary = async () => {
    setPlayerError('');
    try {
      await soundSynthesizer.loadSavedTracks();
      setTracks(soundSynthesizer.getTracks());
      setCurrentTrack(soundSynthesizer.getCurrentTrack());
      onOpenTrackLibrary();
    } catch (cause) {
      setPlayerError(cause instanceof Error ? cause.message : 'No se pudo abrir la biblioteca.');
      onOpenTrackLibrary();
    }
  };

  const navItems: { id: ScreenType; label: string }[] = [
    { id: 'inicio', label: 'Inicio :3' },
    { id: 'cartas-de-amor', label: 'Cartas de Amor ❤️' },
    { id: 'galeria-de-recuerdos', label: 'Galería 🎞️' },
    { id: 'razones-por-las-que-te-amo', label: 'Por Qué Te Amo 💖' },
    { id: 'cuenta-regresiva', label: 'Cuenta Regresiva ⏳' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_12px_rgba(138,61,54,0.06)] border-b border-outline-variant/30 transition-all">
      <div className="h-20 max-w-7xl mx-auto px-4 md:px-10 lg:px-20 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => {
            onNavigate('inicio');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <span className="material-symbols-outlined text-primary text-[24px] group-hover:scale-110 transition-transform">
            local_florist
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-serif italic">
              Para Mi Amor
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em] -mt-1 font-semibold">
              Nuestra Historia
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-surface-container/60 border border-outline-variant/20 shadow-sm">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Player Pill */}
          <div className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high/70 px-3 py-1.5 shadow-[0_2px_8px_rgba(138,61,54,0.04)] transition-colors hover:bg-surface-container-high">
            <button
              aria-label={
                currentTrack
                  ? isPlaying
                    ? 'Pausar Nuestra Canción'
                    : 'Reproducir Nuestra Canción'
                  : 'No hay canciones agregadas'
              }
              onClick={handleToggleMusic}
              className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!currentTrack}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div className="hidden sm:flex flex-col pr-1 text-left select-none">
              <span className="font-label-sm text-[9px] text-on-surface uppercase tracking-wider font-semibold">
                Nuestra Canción
              </span>
              <span className="font-body-sm text-[13px] text-on-surface-variant italic leading-tight">
                {currentTrack?.title ?? 'Agrega canciones MP3'}
              </span>
            </div>
            {/* Animated Equalizer Wave Bars */}
            <div className="flex items-center gap-0.5 ml-1 h-4">
              <span
                className={`w-0.5 rounded-full bg-primary transition-all duration-300 ${
                  isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-50'
                }`}
              ></span>
              <span
                className={`w-0.5 rounded-full bg-primary transition-all duration-300 delay-100 ${
                  isPlaying ? 'h-4 animate-bounce' : 'h-2.5 opacity-50'
                }`}
              ></span>
              <span
                className={`w-0.5 rounded-full bg-primary transition-all duration-300 delay-200 ${
                  isPlaying ? 'h-2.5 animate-pulse' : 'h-1.5 opacity-50'
                }`}
              ></span>
            </div>
          </div>

          <button
            aria-label="Abrir biblioteca de canciones"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-primary transition-colors hover:bg-secondary-container"
            onClick={() => void handleOpenTrackLibrary()}
            title="Agregar y administrar canciones MP3"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">library_music</span>
          </button>

          {/* Romantic Atmosphere Toggle */}
          <button
            aria-label="Ambiente Romántico"
            onClick={onToggleRomanticMode}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              romanticMode
                ? 'bg-secondary-container text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] ring-1 ring-primary/30 scale-105'
                : 'bg-surface-container text-primary hover:bg-secondary-container hover:text-on-secondary-container'
            }`}
            title={romanticMode ? 'Desactivar lluvia de pétalos y corazones' : 'Activar ambiente romántico con pétalos'}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={romanticMode ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>

          {/* Profile / Couple Settings */}
          <button
            aria-label="Nuestra Historia - Ajustes de Pareja"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-primary text-on-primary hover:bg-primary-container flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Personalizar nuestros nombres y fechas"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded-full bg-surface-container text-on-surface flex items-center justify-center"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-low border-b border-outline-variant/30 px-6 py-4 flex flex-col gap-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2.5 rounded-xl font-label-md text-label-md uppercase text-left transition-colors ${
                currentScreen === item.id
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {isTrackLibraryOpen && (
        <TrackLibraryModal
          currentTrackId={currentTrack?.id ?? ''}
          error={playerError}
          isPlaying={isPlaying}
          onClose={onCloseTrackLibrary}
          onError={setPlayerError}
          tracks={tracks}
        />
      )}
    </header>
  );
};
