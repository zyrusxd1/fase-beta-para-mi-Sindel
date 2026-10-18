import React, { useState, useEffect, useRef } from 'react';
import { ScreenType, CoupleSettings, LoveLetter, MemoryPhoto } from '../../types';
import { AudioTrack, soundSynthesizer } from '../../utils/audioPlayer';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  settings: CoupleSettings;
  onSaveSecretNote: (note: string) => void;
  totalSavedNotesCount: number;
  onOpenTrackLibrary: () => void;
  memories: MemoryPhoto[];
  letters: LoveLetter[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  settings,
  onSaveSecretNote,
  totalSavedNotesCount,
  onOpenTrackLibrary,
  memories,
  letters,
}) => {
  // Wax Envelope state
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [featuredLetter, setFeaturedLetter] = useState<LoveLetter | undefined>();
  const [featuredMemory, setFeaturedMemory] = useState<MemoryPhoto | undefined>();

  // Audio state
  const [isPlaying, setIsPlaying] = useState(soundSynthesizer.isPlaying());
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | undefined>(soundSynthesizer.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState(soundSynthesizer.getCurrentTime());
  const [duration, setDuration] = useState(soundSynthesizer.getTotalDuration());
  const [vinylAngle, setVinylAngle] = useState(0);

  // Love Note Input state
  const [noteText, setNoteText] = useState('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Dynamic calculation of relationship duration
  const [daysTogether, setDaysTogether] = useState(0);
  const [hoursTogether, setHoursTogether] = useState(0);

  // Vinyl rotation animation ref
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (letters.length === 0) {
      setFeaturedLetter(undefined);
      setIsLetterOpen(false);
      return;
    }
    setFeaturedLetter(letters[Math.floor(Math.random() * letters.length)]);
    setIsLetterOpen(false);
  }, [letters]);

  useEffect(() => {
    if (memories.length === 0) {
      setFeaturedMemory(undefined);
      return;
    }
    setFeaturedMemory(memories[Math.floor(Math.random() * memories.length)]);
  }, [memories]);

  useEffect(() => {
    const updateDuration = () => {
      const [year, month, day] = settings.startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      if (
        !Number.isFinite(start.getTime()) ||
        start.getFullYear() !== year ||
        start.getMonth() !== month - 1 ||
        start.getDate() !== day
      ) {
        setDaysTogether(0);
        setHoursTogether(0);
        return;
      }

      const now = new Date();
      const startCalendarDay = Date.UTC(year, month - 1, day);
      const currentCalendarDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const elapsedDays = Math.floor((currentCalendarDay - startCalendarDay) / 86_400_000);
      setDaysTogether(Math.max(0, elapsedDays + 1));
      setHoursTogether(Math.max(0, Math.floor((now.getTime() - start.getTime()) / 3_600_000)));
    };

    updateDuration();
    const intervalId = window.setInterval(updateDuration, 60_000);
    window.addEventListener('focus', updateDuration);
    document.addEventListener('visibilitychange', updateDuration);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', updateDuration);
      document.removeEventListener('visibilitychange', updateDuration);
    };
  }, [settings.startDate]);

  // Subscribe to audio state & time
  useEffect(() => {
    const unsubState = soundSynthesizer.subscribeState((playing) => {
      setIsPlaying(playing);
      setCurrentTrack(soundSynthesizer.getCurrentTrack());
    });

    const unsubTime = soundSynthesizer.subscribeTime((curr, total) => {
      setCurrentTime(curr);
      setDuration(total);
    });
    const unsubTracks = soundSynthesizer.subscribeTracks(() => {
      setCurrentTrack(soundSynthesizer.getCurrentTrack());
    });

    return () => {
      unsubState();
      unsubTime();
      unsubTracks();
    };
  }, []);

  // Vinyl continuous rotation loop
  useEffect(() => {
    if (isPlaying) {
      const rotate = () => {
        setVinylAngle((prev) => (prev + 1.2) % 360);
        animRef.current = requestAnimationFrame(rotate);
      };
      animRef.current = requestAnimationFrame(rotate);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const handlePlayToggle = () => {
    if (!currentTrack) return;
    soundSynthesizer.toggle();
    setCurrentTrack(soundSynthesizer.getCurrentTrack());
  };

  const handleNextTrack = () => {
    soundSynthesizer.next();
    setCurrentTrack(soundSynthesizer.getCurrentTrack());
  };

  const handlePrevTrack = () => {
    soundSynthesizer.prev();
    setCurrentTrack(soundSynthesizer.getCurrentTrack());
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    soundSynthesizer.seek(pct);
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onSaveSecretNote(noteText.trim());
    setNoteText('');
    setNoteSavedFeedback(true);
    setTimeout(() => {
      setNoteSavedFeedback(false);
    }, 4500);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col w-full">
      {/* Subtle Ambient Glows */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-secondary-container/30 blur-[110px] pointer-events-none rounded-full"></div>
        <div className="absolute top-96 -left-20 w-80 h-80 bg-tertiary-fixed/30 blur-[90px] pointer-events-none rounded-full"></div>
        <div className="absolute top-[800px] -right-20 w-96 h-96 bg-primary-fixed/20 blur-[120px] pointer-events-none rounded-full"></div>

        {/* Editorial Botanical Hero */}
        <section className="relative w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20 pt-8 pb-16">
          <div className="relative bg-surface-container-lowest/80 rounded-3xl md:rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(108,39,33,0.07)] p-6 md:p-14 lg:p-16 overflow-hidden border border-outline-variant/30">
            {/* Corner Botanical Filigree (Top Left) */}
            <div className="absolute -top-6 -left-6 w-36 h-36 pointer-events-none opacity-40 text-tertiary">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 120 120">
                <path d="M10,90 Q40,40 100,10" strokeWidth="0.8"></path>
                <path d="M40,50 Q25,30 35,15 Q50,25 40,50" fill="#feccc0" fillOpacity="0.3" strokeWidth="0.7"></path>
                <path d="M70,30 Q60,10 75,5 Q85,18 70,30" fill="#d5e7d5" fillOpacity="0.4" strokeWidth="0.7"></path>
                <circle cx="100" cy="10" fill="#6c2721" fillOpacity="0.5" r="3"></circle>
                <circle cx="35" cy="15" fill="#7b554c" fillOpacity="0.4" r="2"></circle>
              </svg>
            </div>

            {/* Corner Botanical Filigree (Bottom Right) */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none opacity-40 text-tertiary rotate-180">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 120 120">
                <path d="M10,90 Q40,40 100,10" strokeWidth="0.8"></path>
                <path d="M40,50 Q25,30 35,15 Q50,25 40,50" fill="#feccc0" fillOpacity="0.3" strokeWidth="0.7"></path>
                <path d="M70,30 Q60,10 75,5 Q85,18 70,30" fill="#d5e7d5" fillOpacity="0.4" strokeWidth="0.7"></path>
                <circle cx="100" cy="10" fill="#6c2721" fillOpacity="0.5" r="3"></circle>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
              {/* Ephemera Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container/50 text-on-secondary-container mb-5 shadow-xs border border-secondary-container">
                <span
                  className="material-symbols-outlined text-[15px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] font-semibold">
                  Para mi preciosa y bella Sindel de mi vida, con todo mi amor y cariño.
                </span>
              </div>

              {/* Main Poetic Headline */}
              <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-serif italic mb-3 selection:bg-primary-fixed">
                “Nuestra bonita página web”
              </h1>

              {/* Heartfelt Subtitle */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8 leading-relaxed font-serif">
                Bienvenid@ a nuestra página web, un espacio especial solo para nosotros.
              </p>

              {/* Interactive Counter Pill (730 Días Juntos) */}
              <div className="w-full max-w-2xl bg-surface-container/70 rounded-full p-2 md:p-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_8px_24px_-6px_rgba(108,39,33,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 border border-outline-variant/30">
                <div className="flex items-center gap-3 pl-4">
                  <span className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                  </span>
                  <div className="text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-headline-md text-headline-md text-primary font-serif font-bold">
                        {daysTogether.toLocaleString()}
                      </span>
                      <span className="font-label-md text-label-md uppercase text-secondary tracking-wider font-semibold">
                        Días Juntos
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1 italic">
                      Nuestra bonita historia de amor Erwin & Sindel
                    </p>
                  </div>
                </div>
                <a
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md uppercase tracking-widest hover:bg-primary transition-all duration-300 shadow-sm text-center cursor-pointer"
                  href="#sorpresas"
                >
                  Explorar Tesoros
                </a>
              </div>

              {/* Hero Portrait Floating Frame (Editorial Asymmetric Stack) */}
              <div className="relative w-full max-w-3xl mt-4">
                <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_48px_-12px_rgba(108,39,33,0.14)] bg-surface-container border border-outline-variant/30">
                  <img
                    className="w-full h-80 sm:h-96 object-cover object-center filter brightness-[0.98] contrast-[1.02]"
                    alt={featuredMemory?.title ?? 'Tender romantic couple holding hands gently walking in flower garden'}
                    src={featuredMemory?.imageUrl ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiyhlhzBFT8xTQ3j_9d6FJd4c0_n8IrNX9kKEeSbCJ7nBxzdGMlEiL9JiwPvOMLZcodlyVtl_b4JzIiLtVCD-uwO6-3tiHlQ0lOcvnxPTL1NBObU8NAdfYjruSt39HHWX0KRSbxtjigmWMzpJgCocSTa9lAQfz5gu-FAu5Eq4zIb51QvQJ4SgaqleoYsoW6jB80u1HW2UKogFhgVTL8yKGIurQOCGX0_vmfsAA_mbrFkth7ecSpCnidQ'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between text-left text-on-primary">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary-container mb-1 block font-semibold">
                        Capítulo Inagotable
                      </span>
                      <p className="font-headline-sm text-headline-sm font-serif italic text-on-primary drop-shadow-sm">
                        {featuredMemory?.title ?? 'Tú, hoy, mañana y todas las vidas que vengan.'}
                      </p>
                      {featuredMemory && (
                        <p className="mt-1 max-w-xl font-body-sm text-body-sm text-on-primary/90 drop-shadow-sm">
                          {featuredMemory.caption.length > 150
                            ? `${featuredMemory.caption.slice(0, 150).trimEnd()}…`
                            : featuredMemory.caption}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center gap-1.5 text-secondary-fixed bg-surface/20 backdrop-blur-md px-3 py-1 rounded-full border border-surface/20">
                      <span className="material-symbols-outlined text-[14px]">local_florist</span>
                      <span className="font-label-sm text-label-sm uppercase font-semibold">
                        {featuredMemory?.category ?? 'Nuestra Promesa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Stamp Ephemera */}
                <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:left-8 bg-surface-container-lowest p-3 rounded-xl shadow-[0_12px_28px_rgba(108,39,33,0.12)] flex items-center gap-3 border border-outline-variant/30">
                  <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </div>
                  <div className="text-left pr-2">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block font-semibold">
                      {hoursTogether.toLocaleString()} Horas
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface italic">
                      Sintiéndome el más afortunado
                    </span>
                  </div>
                </div>

                {/* Floating Botanical Vellum Note */}
                <div className="hidden sm:flex absolute -top-6 -right-4 bg-surface-bright/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-[0_10px_24px_rgba(44,34,33,0.08)] items-center gap-2 max-w-xs text-left border border-outline-variant/40">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">spa</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant italic leading-snug">
                    “Amarte no es una elección de un día, sino el latido natural de mi existencia.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Section: Vintage Vinyl Audio Player & Love Letter Sealed Envelope */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
            {/* Left: Vintage Vinyl Player Widget (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-surface-container-low rounded-[1.75rem] p-6 sm:p-8 shadow-[0_10px_30px_-5px_rgba(108,39,33,0.06)] relative overflow-hidden border border-outline-variant/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">graphic_eq</span>
                  <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-secondary font-semibold">
                    Nuestra Melodía
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest font-medium border border-outline-variant/30">
                  {currentTrack?.side ?? 'Sin canciones'}
                </span>
              </div>

              {/* Rotating Vinyl Disc Visual */}
              <div className="relative my-4 flex items-center justify-center">
                {/* Vinyl Disc Outer Ring */}
                <div
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-inverse-surface flex items-center justify-center shadow-[0_16px_36px_rgba(0,0,0,0.22)] relative"
                  style={{ transform: `rotate(${vinylAngle}deg)` }}
                >
                  {/* Grooves effect */}
                  <div className="absolute inset-2 rounded-full border border-surface/10 opacity-60 pointer-events-none"></div>
                  <div className="absolute inset-6 rounded-full border border-surface/10 opacity-40 pointer-events-none"></div>
                  <div className="absolute inset-10 rounded-full border border-surface/10 opacity-30 pointer-events-none"></div>
                  <div className="absolute inset-14 rounded-full border border-surface/10 opacity-40 pointer-events-none"></div>
                  {/* Center Label */}
                  <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex flex-col items-center justify-center shadow-inner text-center p-2">
                    <span
                      className="material-symbols-outlined text-[16px] text-on-primary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                    <span className="font-label-sm text-[8px] uppercase tracking-tighter text-on-primary font-bold mt-0.5">
                      {currentTrack ? 'Tú & Yo' : 'MP3'}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-inverse-surface mt-1"></div>
                  </div>
                </div>

                {/* Stylus Arm Graphic */}
                <div
                  className={`absolute -top-2 right-10 sm:right-16 w-12 h-28 pointer-events-none origin-top transition-transform duration-500 ease-out ${
                    isPlaying ? 'rotate-[12deg]' : 'rotate-[-15deg]'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-outline"></div>
                  <div className="w-1 h-20 bg-outline mx-auto shadow-sm"></div>
                  <div className="w-3 h-6 bg-primary mx-auto rounded-sm -mt-1 shadow-sm"></div>
                </div>
              </div>

              {/* Track Info & Controls */}
              <div className="mt-6 text-center">
                <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                  {currentTrack?.title ?? 'Agrega tus canciones'}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-4">
                  {currentTrack?.subtitle ?? 'Añade archivos MP3 para escucharlos aquí.'}
                </p>

                {/* Custom Playback Bar with Interactive Seek */}
                <div
                  onClick={handleSeek}
                  className={`w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden mb-2 relative group ${
                    currentTrack ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  title={currentTrack ? 'Haz clic para saltar a cualquier punto' : 'Agrega una canción para reproducirla'}
                >
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm mb-4">
                  <span>{soundSynthesizer.formatTime(currentTime)}</span>
                  <span className="text-primary italic font-serif text-body-sm">
                    {isPlaying ? 'Amándote en cada compás ♪' : 'En pausa'}
                  </span>
                  <span>{soundSynthesizer.formatTime(duration)}</span>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    aria-label="Anterior"
                    onClick={handlePrevTrack}
                    className="w-9 h-9 rounded-full bg-surface text-secondary hover:text-primary hover:bg-secondary-container transition-colors flex items-center justify-center cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!currentTrack}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">skip_previous</span>
                  </button>
                  <button
                    aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                    onClick={handlePlayToggle}
                    className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_16px_rgba(108,39,33,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!currentTrack}
                    type="button"
                  >
                    <span
                      className="material-symbols-outlined text-[28px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <button
                    aria-label="Siguiente"
                    onClick={handleNextTrack}
                    className="w-9 h-9 rounded-full bg-surface text-secondary hover:text-primary hover:bg-secondary-container transition-colors flex items-center justify-center cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!currentTrack}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">skip_next</span>
                  </button>
                  <button
                    aria-label="Modo Repetir Infinito"
                    className="w-9 h-9 rounded-full bg-surface text-primary hover:bg-secondary-container transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                    type="button"
                    title="Repetir infinitamente"
                  >
                    <span className="material-symbols-outlined text-[18px]">all_inclusive</span>
                  </button>
                </div>
                {!currentTrack && (
                  <button
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
                    onClick={onOpenTrackLibrary}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">library_add</span>
                    Agregar canciones MP3
                  </button>
                )}
              </div>
            </div>

            {/* Right: Sealed Wax Envelope Interactive Experience (7 cols) */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-[1.75rem] p-6 sm:p-10 shadow-[0_12px_36px_-6px_rgba(108,39,33,0.07)] flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-secondary font-semibold">
                    Correspondencia Privada
                  </span>
                  <h2 className="font-headline-md text-headline-md text-primary font-serif italic mt-0.5">
                    Una Carta Sellada Con Mi Alma
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary-container/60 text-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
              </div>

              {/* Envelope Metaphor Card */}
              <div className="relative my-4 bg-surface-container-low rounded-2xl p-6 sm:p-8 transition-all duration-500 shadow-[inset_0_2px_8px_rgba(108,39,33,0.03),0_6px_20px_rgba(108,39,33,0.04)] border border-outline-variant/30">
                {!isLetterOpen ? (
                  /* Sealed State View */
                  <div className="flex flex-col items-center text-center py-6 animate-fadeIn">
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto italic mb-6">
                      {featuredLetter
                        ? `Este sobre guarda “${featuredLetter.title}”. Haz clic sobre el sello de cera para abrirla.`
                        : 'Aún no hay cartas guardadas. Escribe una en la sección Cartas de Amor y aparecerá aquí.'}
                    </p>

                    {/* Wax Seal Button (Level 3 tactile depth) */}
                    <button
                      onClick={() => setIsLetterOpen(true)}
                      className="group relative cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300 select-none"
                      disabled={!featuredLetter}
                      type="button"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),inset_0_-3px_4px_rgba(0,0,0,0.35),0_10px_25px_rgba(108,39,33,0.35)] relative overflow-hidden border border-primary-fixed/20 group-disabled:opacity-50">
                        {/* Monogram / Tulip in wax */}
                        <div className="flex flex-col items-center justify-center">
                          <span className="material-symbols-outlined text-[28px] text-secondary-fixed transition-transform duration-300 group-hover:rotate-12">
                            local_florist
                          </span>
                          <span className="font-label-sm text-[8px] tracking-widest text-secondary-fixed uppercase font-bold mt-0.5">
                            AMOR
                          </span>
                        </div>
                      </div>
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-outline-variant/30">
                            {featuredLetter ? 'Tocar para abrir' : 'Sin cartas'}
                        </span>
                      </div>
                    </button>
                  </div>
                ) : (
                  /* Unsealed State View */
                  <div className="flex flex-col text-left transition-all duration-700 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/30">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                        {featuredLetter?.date ?? ''}
                      </span>
                      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    </div>
                    <p className="font-headline-sm text-headline-sm text-primary font-serif italic mb-3">
                      {featuredLetter?.title}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed font-serif italic mb-4 whitespace-pre-line">
                      {featuredLetter?.content}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                      <span className="font-headline-sm text-headline-sm text-secondary font-serif italic">
                        {featuredLetter?.author ?? 'Por siempre tuyo.'}
                      </span>
                      <button
                        onClick={() => setIsLetterOpen(false)}
                        className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-sm text-label-sm uppercase tracking-wider transition-colors cursor-pointer border border-outline-variant/30"
                        type="button"
                      >
                        Cerrar sobre
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Prompt */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-t border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant italic">
                  ¿Deseas dejarme un mensaje secreto para esta noche?
                </span>
                <button
                  onClick={() => onNavigate('cartas-de-amor')}
                  className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary uppercase tracking-wider font-semibold hover:text-primary-container transition-colors cursor-pointer"
                >
                  <span>Ver todas mis cartas</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Botanical Divider */}
        <div className="w-full max-w-3xl mx-auto my-4 flex items-center justify-center gap-4 text-secondary/60">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-outline-variant"></span>
          <span className="material-symbols-outlined text-[20px] text-primary">spa</span>
          <span className="font-label-sm text-label-sm uppercase tracking-[0.3em] text-secondary font-semibold">
            Nuestra Antología
          </span>
          <span className="material-symbols-outlined text-[20px] text-primary">spa</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-outline-variant"></span>
        </div>

        {/* Quick Access Bento to the Surprises of the Page */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-12 md:py-16" id="sorpresas">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-secondary font-semibold">
              Tesoros Guardados
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary font-serif italic mt-1">
              Los Rincones de Nuestro Amor
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant italic mt-2">
              He preparado cada uno de estos espacios para celebrar nuestra magia. Elige a dónde ir primero.
            </p>
          </div>

          {/* Bento Grid (3 Pillars) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Galería de Recuerdos */}
            <div
              onClick={() => onNavigate('galeria-de-recuerdos')}
              className="group bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(108,39,33,0.04)] hover:shadow-[0_16px_36px_rgba(108,39,33,0.1)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer border border-outline-variant/30 hover:border-primary/40"
            >
              <div className="relative w-full h-48 rounded-xl overflow-hidden mb-5 bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Polaroid couple sunset bluff"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-woEUmRVCdxmB9qc_TEJj5niwVM1xJQwqTF158-Tn29XCWQCpFGSrtA9YMuWZmbv0alMmYw6EfY4W926dyvIN7dF47sJfHOOcGHDqXbxyeggXqRCNcQiY5fRmilcfnJyRcABw_54B5Q9wO6Q5HFh1GUqw7Q_wB1Xxwz9lxiSGDeLT7FIkQNKnJ1rjpslnlz-npfz-gC1ev3N06RFEBoymz9LJd_wlrrJaKp5CYx4Yis93TIH2Xls2RQ"
                />
                <div className="absolute top-3 left-3 bg-surface-bright/90 backdrop-blur-md px-3 py-1 rounded-full text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold border border-outline-variant/20">
                  Álbum Privado
                </div>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic mb-2 group-hover:text-primary-container transition-colors">
                  Galería de Recuerdos
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-4">
                  Instantáneas, viajes y esas miradas cómplices que el tiempo no podrá borrar jamás.
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold pt-2">
                <span>Revivir Momentos</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </div>
            </div>

            {/* Pillar 2: 100 Razones Por Las Que Te Amo */}
            <div
              onClick={() => onNavigate('razones-por-las-que-te-amo')}
              className="group bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(108,39,33,0.04)] hover:shadow-[0_16px_36px_rgba(108,39,33,0.1)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer border border-outline-variant/30 hover:border-primary/40"
            >
              <div className="relative w-full h-48 rounded-xl overflow-hidden mb-5 bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Vintage stationery and calligraphy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDusAcEV_vmKmrNQDY7cGxtuTbM7alYz3g0Olv0P1ceSRu7OxU_KLDWqbzK2ex-bV74Jnm1RULL-Yd0XfgBbBvltFrmlnv4VwYdAh6KJVuyg5SZ4np64PTHG3b3KXwBI-JHKNr5Yku4cf1hdXGZ-1LBCvQIwlayK5pntLFMuHE-E19C2IeqH6wMrgNETyQuqpU1FvURu6LHEmJnY_X2-aRT5hX21wABm3mCtK-xUd9MSjytIg3SQdelFQ"
                />
                <div className="absolute top-3 left-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold border border-secondary-container">
                  Incontables Motivos
                </div>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic mb-2 group-hover:text-primary-container transition-colors">
                  Por Qué Te Amo
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-4">
                  Desde tu risa matutina hasta la ternura incondicional de tus abrazos. Una lista infinita.
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold pt-2">
                <span>Leer las Razones</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </div>
            </div>

            {/* Pillar 3: Cuenta Regresiva & Nuestro Futuro */}
            <div
              onClick={() => onNavigate('cuenta-regresiva')}
              className="group bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(108,39,33,0.04)] hover:shadow-[0_16px_36px_rgba(108,39,33,0.1)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer border border-outline-variant/30 hover:border-primary/40"
            >
              <div className="relative w-full h-48 rounded-xl overflow-hidden mb-5 bg-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Romantic night scene with lanterns"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOMl3a2FwkZhUFvHn0iuf7BIiJ62KL2LVKFptykMoOAU5xGPkm7pVaIhILL-ayXiYhHYlQhtTkmx9UBo-Vcj1gpT_Hm1ou_U6P4aMMCkA42ERMxEqgDYQ0k_tWn8TiHFhAKDJ4-ols5bvyztR7qYwTyzF6z9XEznjGpPjGQ27Y8bJp6LDGA0EhAVnP6nGQQxWxSF0uBWtQIKSDBN7e1Lw48_lbA6a7J2C6sXquuPR3BU17ebwuSZJNzw"
                />
                <div className="absolute top-3 left-3 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold border border-tertiary-fixed">
                  Próximo Destino
                </div>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic mb-2 group-hover:text-primary-container transition-colors">
                  Próximo Encuentro
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic mb-4">
                  El reloj no se detiene y cada segundo nos acerca a nuestra siguiente gran aventura juntos.
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold pt-2">
                <span>Ver Cuenta Regresiva</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Intimate Secret Message Prompt Banner */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-10 lg:px-20 pb-16">
          <div className="bg-surface-container rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-sm border border-outline-variant/30">
            <div className="max-w-xl mx-auto">
              <span className="w-12 h-12 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center mb-4 shadow-sm">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
              </span>
              <h3 className="font-headline-md text-headline-md text-primary font-serif italic mb-2">
                ¿Una nota para mi corazón?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant italic mb-6">
                Escribe un suspiro, un deseo o una pequeña promesa para guardarla en nuestra caja fuerte digital.
              </p>
              <form onSubmit={handleSubmitNote} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 bg-surface-container-lowest px-5 py-3.5 rounded-full font-body-md text-on-surface placeholder:text-outline placeholder:italic focus:outline-none focus:ring-1 focus:ring-primary shadow-inner border border-outline-variant/40"
                  placeholder="Escribe aquí tu pensamiento más tierno..."
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest hover:bg-primary-container transition-all shadow-[0_6px_16px_rgba(108,39,33,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Guardar</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>

              {noteSavedFeedback && (
                <div className="mt-4 p-3 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-body-sm italic shadow-sm animate-fadeIn">
                  ♥ ¡Mensaje guardado para siempre en el alma de quien te ama!
                </div>
              )}

              {totalSavedNotesCount > 0 && (
                <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-center justify-center gap-2 text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>{totalSavedNotesCount} {totalSavedNotesCount === 1 ? 'nota secreta guardada' : 'notas secretas guardadas'} en el archivo</span>
                  <button
                    onClick={() => onNavigate('cartas-de-amor')}
                    className="ml-2 text-primary underline hover:text-primary-container cursor-pointer lowercase first-letter:uppercase font-serif italic"
                  >
                    leerlas aquí →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
