import React, { useState } from 'react';
import { LoveLetter } from '../../types';

interface LettersScreenProps {
  letters: LoveLetter[];
  onAddLetter: (letter: Omit<LoveLetter, 'id'>) => void;
  onDeleteLetter: (id: string) => void;
  secretNotes: string[];
}

export const LettersScreen: React.FC<LettersScreenProps> = ({
  letters,
  onAddLetter,
  onDeleteLetter,
  secretNotes,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [letterToDelete, setLetterToDelete] = useState<LoveLetter | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'todas' | 'aniversarios' | 'primeras' | 'promesas' | 'secretas'>('todas');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // New letter form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'primeras' | 'aniversarios' | 'promesas' | 'secretas'>('promesas');
  const [newSealColor, setNewSealColor] = useState<'terracotta' | 'rose' | 'sage' | 'gold'>('terracotta');

  // Filter letters
  const filteredLetters = letters.filter((letter) => {
    if (selectedFilter === 'todas') return true;
    return letter.category === selectedFilter;
  });

  const handleOpenWriteModal = () => {
    setIsWriteModalOpen(true);
  };

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddLetter({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Escrito desde el corazón',
      date: new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      category: newCategory,
      sealColor: newSealColor,
      content: newContent.trim(),
      author: 'Siempre tuyo',
      isRead: false,
    });

    setNewTitle('');
    setNewSubtitle('');
    setNewContent('');
    setIsWriteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!letterToDelete) return;
    onDeleteLetter(letterToDelete.id);
    if (selectedLetter?.id === letterToDelete.id) setSelectedLetter(null);
    setLetterToDelete(null);
  };

  const getSealBg = (color: 'terracotta' | 'rose' | 'sage' | 'gold') => {
    switch (color) {
      case 'rose':
        return 'bg-[#7b554c] text-white';
      case 'sage':
        return 'bg-[#324234] text-white';
      case 'gold':
        return 'bg-[#b8860b] text-white';
      case 'terracotta':
      default:
        return 'bg-[#6c2721] text-white';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container/50 text-on-secondary-container mb-3 border border-secondary-container">
          <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] font-semibold">
            Correspondencia Privada & Secreta
          </span>
        </div>
        <h1 className="font-display-lg text-display-lg text-primary font-serif italic mb-3">
          Cartas de Amor
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-serif italic max-w-xl mx-auto">
          Palabras selladas con cera y grabadas en el tiempo. Cada sobre guarda un suspiro sincero y un juramento de amor.
        </p>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={handleOpenWriteModal}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Escribir y Sellar Nueva Carta</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {[
          { id: 'todas', label: 'Todas las Cartas' },
          { id: 'aniversarios', label: 'Aniversarios' },
          { id: 'primeras', label: 'Primeras Memorias' },
          { id: 'promesas', label: 'Promesas' },
          { id: 'secretas', label: 'Notas Secretas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as typeof selectedFilter)}
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

      {/* Letters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredLetters.map((letter) => (
          <div
            key={letter.id}
            onClick={() => setSelectedLetter(letter)}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_6px_24px_rgba(108,39,33,0.05)] hover:shadow-[0_16px_36px_rgba(108,39,33,0.12)] transition-all duration-300 flex flex-col justify-between border border-outline-variant/30 hover:border-primary/40 cursor-pointer group relative overflow-hidden"
          >
            {/* Top row with stamp date */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-outline-variant/20">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  {letter.date}
                </span>
                <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-0.5 font-label-sm text-[9px] uppercase tracking-wider text-on-surface-variant">
                  {letter.category}
                </span>
              </div>
              <button
                aria-label={`Borrar carta: ${letter.title}`}
                className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-secondary transition-colors hover:bg-error-container hover:text-error"
                onClick={(event) => {
                  event.stopPropagation();
                  setLetterToDelete(letter);
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
                <span className="font-label-sm text-label-sm">Borrar</span>
              </button>
            </div>

            {/* Letter summary */}
            <div className="my-5">
              <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic mb-1 group-hover:text-primary-container transition-colors">
                {letter.title}
              </h3>
              {letter.subtitle && (
                <p className="font-body-sm text-body-sm text-secondary font-serif italic mb-3">
                  {letter.subtitle}
                </p>
              )}
              <p className="font-body-md text-body-md text-on-surface-variant font-serif italic line-clamp-3">
                {letter.content.replace(/\n/g, ' ')}
              </p>
            </div>

            {/* Bottom with Wax Seal Icon */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full ${getSealBg(letter.sealColor)} flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform`}
                >
                  <span className="material-symbols-outlined text-[16px]">local_florist</span>
                </div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Romper Sello
                </span>
              </div>
              <span className="material-symbols-outlined text-primary text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Secret Notes Drawer if any exist */}
      {secretNotes.length > 0 && (
        <div className="bg-surface-container rounded-3xl p-6 sm:p-10 mb-16 border border-outline-variant/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                Caja Fuerte de Mensajes Secretos
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                Suspiros y notas depositadas desde la página de inicio
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {secretNotes.map((note, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 relative"
              >
                <div className="flex items-center justify-between text-secondary font-label-sm text-[10px] uppercase mb-2">
                  <span>Nota #{idx + 1}</span>
                  <span className="material-symbols-outlined text-[14px] text-primary">favorite</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface font-serif italic">
                  “{note}”
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Letter Reading Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl p-6 sm:p-10 shadow-[0_24px_60px_rgba(108,39,33,0.25)] border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full ${getSealBg(selectedLetter.sealColor)} flex items-center justify-center shadow-sm`}
                >
                  <span className="material-symbols-outlined text-[18px]">local_florist</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold block">
                    {selectedLetter.date}
                  </span>
                  <span className="font-label-sm text-[9px] uppercase tracking-wider text-outline">
                    Categoría: {selectedLetter.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLetter(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Letter Content Styled as Deckle Parchment */}
            <div className="deckle-border bg-surface-bright/70 p-6 sm:p-8 rounded-2xl">
              <h2 className="font-display-lg text-headline-lg text-primary font-serif italic mb-1">
                {selectedLetter.title}
              </h2>
              {selectedLetter.subtitle && (
                <p className="font-body-sm text-body-sm text-secondary font-serif italic mb-6">
                  {selectedLetter.subtitle}
                </p>
              )}

              <div className="font-body-lg text-body-lg text-on-surface font-serif leading-relaxed italic whitespace-pre-line space-y-4">
                {selectedLetter.content}
              </div>

              <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-[10px] uppercase text-secondary tracking-widest block font-semibold">
                    Escrito con amor por
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-serif italic">
                    {selectedLetter.author || 'Tuyo por siempre'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider hover:bg-primary-container transition-all shadow-sm cursor-pointer"
                >
                  Guardar y Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {letterToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setLetterToDelete(null)}
          role="presentation"
        >
          <section
            aria-labelledby="delete-letter-title"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-[0_24px_60px_rgba(108,39,33,0.25)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container text-error">
                <span className="material-symbols-outlined">delete</span>
              </span>
              <h2 id="delete-letter-title" className="font-headline-sm text-headline-sm text-primary">
                ¿Borrar esta carta?
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              “{letterToDelete.title}” se quitará de tus cartas guardadas. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full bg-surface-container px-5 py-2.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
                onClick={() => setLetterToDelete(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-sm text-label-sm text-white transition-colors hover:bg-error/90"
                onClick={handleConfirmDelete}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
                Borrar carta
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Compose Letter Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(108,39,33,0.25)] border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">edit_document</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                  Escribir una Carta de Amor
                </h3>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateLetter} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Título de la Carta
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Ej. Promesa bajo el cielo de París"
                  required
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Subtítulo / Epígrafe
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Ej. Para leer en noches de nostalgia"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                    className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="aniversarios">Aniversarios</option>
                    <option value="primeras">Primeras Memorias</option>
                    <option value="promesas">Promesas</option>
                    <option value="secretas">Notas Secretas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                    Color del Sello de Cera
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    {(['terracotta', 'rose', 'sage', 'gold'] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewSealColor(color)}
                        className={`w-7 h-7 rounded-full ${getSealBg(color)} flex items-center justify-center transition-all cursor-pointer ${
                          newSealColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={color}
                      >
                        <span className="material-symbols-outlined text-[14px]">local_florist</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Tu Mensaje de Amor
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary font-serif italic"
                  placeholder="Escribe aquí con toda la ternura de tu corazón..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Sellar con Cera</span>
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
