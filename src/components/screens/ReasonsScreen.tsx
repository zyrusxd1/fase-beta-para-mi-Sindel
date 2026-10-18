import React, { useState } from 'react';
import { LoveReason } from '../../types';

interface ReasonsScreenProps {
  reasons: LoveReason[];
  onToggleFavorite: (id: string) => void;
  onAddReason: (reason: Omit<LoveReason, 'id' | 'number'>) => void;
  onEditReason: (id: string, reason: Pick<LoveReason, 'text' | 'category'>) => void;
  onDeleteReason: (id: string) => void;
}

export const ReasonsScreen: React.FC<ReasonsScreenProps> = ({
  reasons,
  onToggleFavorite,
  onAddReason,
  onEditReason,
  onDeleteReason,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [randomReason, setRandomReason] = useState<LoveReason>(
    reasons[Math.floor(Math.random() * reasons.length)] || reasons[0]
  );
  const [isFlipping, setIsFlipping] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<LoveReason | null>(null);
  const [reasonToDelete, setReasonToDelete] = useState<LoveReason | null>(null);

  // New reason form state
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'sonrisa' | 'detalles' | 'recuerdos' | 'paz' | 'futuro'>('detalles');

  const filtered = reasons.filter((r) => {
    if (selectedFilter === 'favoritos') return r.isFavorite;
    if (selectedFilter === 'todos') return true;
    return r.category === selectedFilter;
  });

  React.useEffect(() => {
    const currentReason = reasons.find((reason) => reason.id === randomReason?.id);
    if (currentReason && currentReason !== randomReason) setRandomReason(currentReason);
    else if (!currentReason && reasons.length > 0) {
      setRandomReason(reasons[Math.floor(Math.random() * reasons.length)]);
    }
  }, [reasons, randomReason]);

  const openAddModal = () => {
    setEditingReason(null);
    setNewText('');
    setNewCategory('detalles');
    setIsAddModalOpen(true);
  };

  const openEditModal = (reason: LoveReason) => {
    setEditingReason(reason);
    setNewText(reason.text);
    setNewCategory(reason.category);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingReason(null);
    setNewText('');
    setNewCategory('detalles');
  };

  const handleDrawRandom = () => {
    setIsFlipping(true);
    setTimeout(() => {
      let next = reasons[Math.floor(Math.random() * reasons.length)];
      if (reasons.length > 1 && next.id === randomReason.id) {
        next = reasons.find((r) => r.id !== randomReason.id) || next;
      }
      setRandomReason(next);
      setIsFlipping(false);
    }, 300);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    if (editingReason) {
      onEditReason(editingReason.id, { text: newText.trim(), category: newCategory });
    } else {
      onAddReason({
        text: newText.trim(),
        category: newCategory,
        isFavorite: true,
      });
    }
    closeModal();
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sonrisa':
        return 'Tu Sonrisa';
      case 'detalles':
        return 'Pequeños Detalles';
      case 'recuerdos':
        return 'Nuestros Recuerdos';
      case 'paz':
        return 'Mi Refugio & Paz';
      case 'futuro':
        return 'Futuro Juntos';
      default:
        return category;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container mb-3 border border-secondary-container">
          <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] font-semibold">
            Incontables Motivos
          </span>
        </div>
        <h1 className="font-display-lg text-display-lg text-primary font-serif italic mb-3">
          Por Qué Te Amo
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-serif italic max-w-xl mx-auto">
          Desde tu risa matutina hasta la ternura incondicional de tus abrazos. Una lista infinita que sigue creciendo cada día.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Añadir un Nuevo Motivo</span>
          </button>
        </div>
      </div>

      {/* Featured: Interactive "Razón del Momento" Deck Card */}
      {randomReason && (
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative bg-surface-container rounded-3xl p-8 sm:p-12 shadow-[0_12px_40px_rgba(108,39,33,0.08)] border border-outline-variant/40 text-center overflow-hidden">
            <div className="absolute top-4 left-6 flex items-center gap-2 text-secondary font-label-sm text-[11px] uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined text-[15px] text-primary">auto_awesome</span>
              <span>Razón #{randomReason.number}</span>
            </div>

            <div className="absolute top-4 right-6">
              <button
                onClick={() => onToggleFavorite(randomReason.id)}
                className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-xs hover:scale-110 transition-transform cursor-pointer"
                title="Marcar como favorito"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={randomReason.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  favorite
                </span>
              </button>
            </div>

            <div
              className={`my-6 pt-4 transition-all duration-300 ${
                isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-container/70 text-on-secondary-container font-label-sm text-[10px] uppercase tracking-wider font-semibold mb-4">
                {getCategoryLabel(randomReason.category)}
              </span>
              <p className="font-headline-md text-headline-md text-primary font-serif italic leading-relaxed px-4">
                “{randomReason.text}”
              </p>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-center">
              <button
                onClick={handleDrawRandom}
                className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary hover:bg-primary font-label-sm text-label-sm uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">casino</span>
                <span>Descubrir otra razón al azar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {[
          { id: 'todos', label: 'Todos los Motivos' },
          { id: 'favoritos', label: 'Mis Favoritos ♥' },
          { id: 'sonrisa', label: 'Tu Sonrisa' },
          { id: 'detalles', label: 'Pequeños Detalles' },
          { id: 'recuerdos', label: 'Nuestros Recuerdos' },
          { id: 'paz', label: 'Mi Refugio' },
          { id: 'futuro', label: 'Futuro Juntos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider transition-all cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reasons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filtered.map((reason) => (
          <div
            key={reason.id}
            className="deckle-border bg-surface-container-lowest p-6 rounded-2xl shadow-[0_4px_16px_rgba(108,39,33,0.04)] hover:shadow-[0_12px_28px_rgba(108,39,33,0.09)] transition-all duration-300 flex flex-col justify-between group relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
              <span className="font-headline-sm text-[16px] text-primary font-serif font-bold">
                #{reason.number.toString().padStart(2, '0')}
              </span>
              <span className="font-label-sm text-[9px] uppercase tracking-wider text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                {getCategoryLabel(reason.category)}
              </span>
            </div>

            <p className="font-body-lg text-body-lg text-on-surface font-serif italic my-3 leading-relaxed">
              “{reason.text}”
            </p>

            <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2 text-secondary">
              <span className="whitespace-nowrap font-label-sm text-[10px] uppercase tracking-widest italic font-serif">
                Por siempre tú
              </span>
              <div className="flex w-full items-center justify-between gap-1">
                <button
                  aria-label={`Editar motivo: ${reason.text}`}
                  onClick={() => openEditModal(reason)}
                  className="inline-flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-full px-2 py-1 text-primary hover:bg-secondary-container transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined shrink-0 text-[17px]">edit</span>
                  <span className="font-label-sm text-[10px] uppercase tracking-wider">Editar</span>
                </button>
                <button
                  aria-label={`Borrar motivo: ${reason.text}`}
                  onClick={() => setReasonToDelete(reason)}
                  className="inline-flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-full px-2 py-1 text-error hover:bg-error-container transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined shrink-0 text-[17px]">delete</span>
                  <span className="font-label-sm text-[10px] uppercase tracking-wider">Borrar</span>
                </button>
                <button
                  aria-label={`${reason.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}: ${reason.text}`}
                  onClick={() => onToggleFavorite(reason.id)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary hover:bg-secondary-container hover:text-primary-container transition-colors cursor-pointer"
                  title={reason.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  type="button"
                >
                  <span
                    className="material-symbols-outlined block text-[20px] leading-none"
                    style={reason.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    favorite
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reason Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                  {editingReason ? 'Editar Motivo de Amor' : 'Añadir Motivo de Amor'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Categoría
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="sonrisa">Tu Sonrisa</option>
                  <option value="detalles">Pequeños Detalles</option>
                  <option value="recuerdos">Nuestros Recuerdos</option>
                  <option value="paz">Mi Refugio & Paz</option>
                  <option value="futuro">Futuro Juntos</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  ¿Por qué la amas?
                </label>
                <textarea
                  rows={4}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary font-serif italic"
                  placeholder="Ej. Por la forma en que siempre me guardas el último bocado de postre..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>{editingReason ? 'Guardar Cambios' : 'Guardar Motivo'}</span>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reasonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-reason-title"
            className="relative w-full max-w-md rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
                <span className="material-symbols-outlined block text-center leading-none">delete</span>
              </span>
              <h3 id="delete-reason-title" className="font-headline-sm text-headline-sm text-primary font-serif italic">
                ¿Borrar este motivo?
              </h3>
            </div>
            <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
              “{reasonToDelete.text}” se quitará de tu lista. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4">
              <button
                type="button"
                onClick={() => setReasonToDelete(null)}
                className="rounded-full bg-surface-container px-5 py-2.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteReason(reasonToDelete.id);
                  setReasonToDelete(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-sm text-label-sm uppercase tracking-wider text-on-error transition-colors hover:opacity-90"
              >
                <span className="material-symbols-outlined inline-flex h-5 w-5 shrink-0 items-center justify-center text-center text-[17px] leading-none">
                  delete
                </span>
                Borrar motivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
