import React, { useState, useEffect } from 'react';
import { CoupleSettings, Milestone, BucketItem } from '../../types';

interface CountdownScreenProps {
  settings: CoupleSettings;
  milestones: Milestone[];
  bucketList: BucketItem[];
  onToggleBucketItem: (id: string) => void;
  onAddBucketItem: (item: Omit<BucketItem, 'id'>) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  settings,
  milestones,
  bucketList,
  onToggleBucketItem,
  onAddBucketItem,
  onAddMilestone,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isAddBucketOpen, setIsAddBucketOpen] = useState(false);
  const [newBucketTitle, setNewBucketTitle] = useState('');
  const [newBucketCategory, setNewBucketCategory] = useState<'viajes' | 'experiencias' | 'cotidiano'>('viajes');

  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [newMDate, setNewMDate] = useState('');
  const [newMTitle, setNewMTitle] = useState('');
  const [newMDesc, setNewMDesc] = useState('');

  // Target event date
  const targetDateStr = settings.nextEventDate || '2026-11-20';

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketTitle.trim()) return;
    onAddBucketItem({
      title: newBucketTitle.trim(),
      category: newBucketCategory,
      completed: false,
    });
    setNewBucketTitle('');
    setIsAddBucketOpen(false);
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMTitle.trim() || !newMDate.trim()) return;
    onAddMilestone({
      title: newMTitle.trim(),
      date: newMDate.trim(),
      description: newMDesc.trim() || 'Un momento guardado para la posteridad.',
      icon: 'auto_awesome',
      isCompleted: false,
    });
    setNewMTitle('');
    setNewMDate('');
    setNewMDesc('');
    setIsAddMilestoneOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed mb-3 border border-tertiary-fixed font-semibold">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span className="font-label-sm text-label-sm uppercase tracking-[0.25em]">
            Próximo Encuentro & Destino
          </span>
        </div>
        <h1 className="font-display-lg text-display-lg text-primary font-serif italic mb-3">
          Cuenta Regresiva
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-serif italic max-w-xl mx-auto">
          El reloj no se detiene y cada segundo nos acerca a nuestra siguiente gran aventura juntos.
        </p>
      </div>

      {/* Hero Countdown Clock Container */}
      <div className="relative max-w-4xl mx-auto bg-surface-container-lowest rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(108,39,33,0.08)] border border-outline-variant/40 text-center mb-16 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-secondary-container/30 blur-[70px] pointer-events-none rounded-full"></div>

        <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-secondary font-semibold block mb-2">
          Hacia Nuestro Momento
        </span>
        <h2 className="font-headline-lg text-headline-lg text-primary font-serif italic mb-8">
          {settings.nextEventTitle}
        </h2>

        {/* 4 Clock Digits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
          {/* Days */}
          <div className="bg-surface-container-low p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
            <span className="font-display-lg text-[44px] sm:text-[54px] text-primary font-serif font-bold block leading-none">
              {timeLeft.days}
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold mt-2 block">
              Días
            </span>
          </div>

          {/* Hours */}
          <div className="bg-surface-container-low p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
            <span className="font-display-lg text-[44px] sm:text-[54px] text-primary font-serif font-bold block leading-none">
              {timeLeft.hours.toString().padStart(2, '0')}
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold mt-2 block">
              Horas
            </span>
          </div>

          {/* Minutes */}
          <div className="bg-surface-container-low p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
            <span className="font-display-lg text-[44px] sm:text-[54px] text-primary font-serif font-bold block leading-none">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold mt-2 block">
              Minutos
            </span>
          </div>

          {/* Seconds */}
          <div className="bg-surface-container-low p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
            <span className="font-display-lg text-[44px] sm:text-[54px] text-primary font-serif font-bold block leading-none">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold mt-2 block">
              Segundos
            </span>
          </div>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant font-serif italic max-w-md mx-auto">
          Fecha señalada: {new Date(targetDateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}. Contando cada latido con ilusión.
        </p>
      </div>

      {/* Grid: Milestones Timeline + Bucket List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left: Milestones Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-6 sm:p-10 shadow-[0_10px_30px_rgba(108,39,33,0.06)] border border-outline-variant/30">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-8">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold">
                Nuestra Historia en el Tiempo
              </span>
              <h3 className="font-headline-md text-headline-md text-primary font-serif italic mt-0.5">
                Línea de Vida & Hitos
              </h3>
            </div>
            <button
              onClick={() => setIsAddMilestoneOpen(true)}
              className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container hover:bg-primary hover:text-on-primary flex items-center justify-center transition-colors cursor-pointer"
              title="Añadir hito a la historia"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>

          {/* Timeline steps */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-outline-variant/40 space-y-8 ml-3">
            {milestones.map((m) => (
              <div key={m.id} className="relative group">
                {/* Node icon dot */}
                <div
                  className={`absolute -left-[35px] sm:-left-[43px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${
                    m.isCompleted
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-secondary border border-outline-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold">
                      {m.date}
                    </span>
                    {m.isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[9px] uppercase font-bold">
                        Vivido ♥
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[9px] uppercase font-bold">
                        Por venir
                      </span>
                    )}
                  </div>
                  <h4 className="font-headline-sm text-[19px] text-primary font-serif italic mb-1">
                    {m.title}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant font-serif italic leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Romantic Bucket List / Caja de Deseos (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(108,39,33,0.06)] border border-outline-variant/30">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold">
                Sueños Compartidos
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic mt-0.5">
                Caja de Deseos
              </h3>
            </div>
            <button
              onClick={() => setIsAddBucketOpen(true)}
              className="w-8 h-8 rounded-full bg-primary text-on-primary hover:bg-primary-container flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Añadir deseo a la lista"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          <div className="space-y-3">
            {bucketList.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleBucketItem(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.completed
                    ? 'bg-surface-container-lowest/60 border-outline-variant/30 opacity-75'
                    : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary/40 shadow-xs'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${
                    item.completed ? 'bg-primary text-on-primary' : 'border border-outline'
                  }`}
                >
                  {item.completed && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-body-md text-body-md font-serif italic leading-snug ${
                      item.completed ? 'line-through text-outline' : 'text-on-surface'
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="font-label-sm text-[9px] uppercase tracking-wider text-secondary mt-1 block">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Bucket Item Modal */}
      {isAddBucketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                Añadir un Deseo Juntos
              </h3>
              <button
                onClick={() => setIsAddBucketOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddBucket} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  ¿Qué aventura o sueño deseas cumplir?
                </label>
                <input
                  type="text"
                  value={newBucketTitle}
                  onChange={(e) => setNewBucketTitle(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary font-serif italic"
                  placeholder="Ej. Viajar juntos a Japón en primavera"
                  required
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Tipo de Deseo
                </label>
                <select
                  value={newBucketCategory}
                  onChange={(e) => setNewBucketCategory(e.target.value as typeof newBucketCategory)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="viajes">Viajes & Destinos</option>
                  <option value="experiencias">Experiencias Románticas</option>
                  <option value="cotidiano">Planes Cotidianos</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBucketOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Guardar Deseo</span>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                Añadir Hito a Nuestra Línea del Tiempo
              </h3>
              <button
                onClick={() => setIsAddMilestoneOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMilestoneSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Título del Hito
                </label>
                <input
                  type="text"
                  value={newMTitle}
                  onChange={(e) => setNewMTitle(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Ej. El día que adoptamos a nuestro perrito"
                  required
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Fecha o Época
                </label>
                <input
                  type="text"
                  value={newMDate}
                  onChange={(e) => setNewMDate(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Ej. Mayo 2025"
                  required
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Breve Reseña
                </label>
                <textarea
                  rows={3}
                  value={newMDesc}
                  onChange={(e) => setNewMDesc(e.target.value)}
                  className="w-full bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary font-serif italic"
                  placeholder="Escribe lo que hizo este día tan especial..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Guardar Hito</span>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
