import React, { useState } from 'react';
import { MemoryPhoto } from '../../types';
import { deleteUploadedMemoryPhoto, uploadMemoryPhoto } from '../../utils/galleryApi';

interface GalleryScreenProps {
  memories: MemoryPhoto[];
  onAddMemory: (memory: Omit<MemoryPhoto, 'id' | 'likes'>) => Promise<void>;
  onLikeMemory: (id: string) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  error: string;
  onRetryLoad: () => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  memories,
  onAddMemory,
  onLikeMemory,
  onDeleteMemory,
  error,
  onRetryLoad,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [lightboxPhoto, setLightboxPhoto] = useState<MemoryPhoto | null>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryPhoto | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [operationError, setOperationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New photo form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState<'viajes' | 'cotidiano' | 'citas' | 'celebraciones'>('viajes');

  const filtered = memories.filter((m) => {
    if (selectedCategory === 'todos') return true;
    return m.category === selectedCategory;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || (!selectedPhoto && !newImageUrl.trim())) return;
    setIsSaving(true);
    setOperationError('');

    let uploadedImageUrl = '';
    try {
      if (selectedPhoto) uploadedImageUrl = await uploadMemoryPhoto(selectedPhoto);
      await onAddMemory({
        title: newTitle.trim(),
        date: newDate.trim() || 'Un día inolvidable',
        location: newLocation.trim() || 'Nuestro lugar favorito',
        imageUrl: uploadedImageUrl || newImageUrl.trim(),
        caption: newCaption.trim() || 'Un instante grabado en el corazón.',
        category: newCategory,
      });

      setNewTitle('');
      setNewDate('');
      setNewLocation('');
      setNewImageUrl('');
      setNewCaption('');
      setSelectedPhoto(null);
      setIsAddModalOpen(false);
    } catch (cause) {
      let message = cause instanceof Error ? cause.message : 'No se pudo guardar el recuerdo.';
      if (uploadedImageUrl) {
        try {
          await deleteUploadedMemoryPhoto(uploadedImageUrl);
        } catch (cleanupCause) {
          const cleanupMessage = cleanupCause instanceof Error ? cleanupCause.message : 'No se pudo limpiar la foto subida.';
          message = `${message} ${cleanupMessage}`;
        }
      }
      setOperationError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memoryToDelete) return;
    setOperationError('');
    try {
      await onDeleteMemory(memoryToDelete.id);
      if (lightboxPhoto?.id === memoryToDelete.id) setLightboxPhoto(null);
      setMemoryToDelete(null);
    } catch (cause) {
      setOperationError(cause instanceof Error ? cause.message : 'No se pudo borrar este recuerdo.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-bright text-primary mb-3 border border-outline-variant/30 shadow-xs">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            photo_camera
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] font-semibold">
            Álbum Privado de Recuerdos
          </span>
        </div>
        <h1 className="font-display-lg text-display-lg text-primary font-serif italic mb-3">
          Galería de Recuerdos
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant font-serif italic max-w-xl mx-auto">
          Instantáneas, viajes y esas miradas cómplices que el tiempo no podrá borrar jamás.
        </p>
        {(error || operationError) && (
          <div className="mx-auto mt-5 max-w-xl rounded-2xl bg-error-container px-4 py-3 text-left text-error" role="alert">
            <p className="font-body-sm text-body-sm">{operationError || error}</p>
            {error && !operationError && (
              <button
                className="mt-2 font-label-sm text-label-sm font-semibold underline"
                onClick={onRetryLoad}
                type="button"
              >
                Volver a intentar
              </button>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>Añadir un Recuerdo Nuestro</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {[
          { id: 'todos', label: 'Todos los Momentos' },
          { id: 'citas', label: 'Citas Especiales' },
          { id: 'viajes', label: 'Viajes & Escapadas' },
          { id: 'cotidiano', label: 'Tardes Cotidianas' },
          { id: 'celebraciones', label: 'Celebraciones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Polaroid Keepsake Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {filtered.map((item, index) => {
          // slight playful natural tilt like polaroids on a corkboard
          const tilts = ['rotate-[-1deg]', 'rotate-[1deg]', 'rotate-[-1.5deg]', 'rotate-[0.5deg]', 'rotate-[-0.5deg]', 'rotate-[1.5deg]'];
          const tiltClass = tilts[index % tilts.length];

          return (
            <div
              key={item.id}
              className={`bg-surface-container-lowest p-5 rounded-2xl shadow-[0_10px_30px_rgba(108,39,33,0.08)] hover:shadow-[0_20px_45px_rgba(108,39,33,0.16)] transition-all duration-300 border border-outline-variant/40 flex flex-col justify-between group ${tiltClass} hover:rotate-0 hover:-translate-y-1`}
            >
              {/* Tape Accent */}
              <div className="w-16 h-3.5 bg-secondary-container/60 rounded-xs mx-auto -mt-6 mb-3 shadow-xs transform rotate-[-2deg]"></div>

              {/* Photo Frame */}
              <div
                onClick={() => setLightboxPhoto(item)}
                className="relative w-full h-64 rounded-xl overflow-hidden bg-surface-container cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.98]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-on-primary font-label-sm text-label-sm uppercase tracking-widest bg-surface/30 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                    Ver foto completa
                  </span>
                </div>
              </div>

              {/* Polaroid Handwritten Caption Section */}
              <div className="pt-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-secondary font-label-sm text-[11px] uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      {item.location}
                    </span>
                    <span>{item.date}</span>
                  </div>

                  <h3
                    onClick={() => setLightboxPhoto(item)}
                    className="font-headline-sm text-headline-sm text-primary font-serif italic mb-2 cursor-pointer group-hover:text-primary-container"
                  >
                    {item.title}
                  </h3>

                  <p className="font-body-md text-body-md text-on-surface-variant font-serif italic mb-4 leading-snug">
                    “{item.caption}”
                  </p>
                </div>

                {/* Bottom Row with Heart likes */}
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[9px] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label={`Borrar foto: ${item.title}`}
                      onClick={() => setMemoryToDelete(item)}
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-secondary transition-colors hover:bg-error-container hover:text-error"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[17px]">delete</span>
                      <span className="font-label-sm text-label-sm">Borrar</span>
                    </button>
                    <button
                      onClick={() => {
                        setOperationError('');
                        void onLikeMemory(item.id).catch((cause: unknown) => {
                          setOperationError(cause instanceof Error ? cause.message : 'No se pudo guardar el me gusta.');
                        });
                      }}
                      className="flex items-center gap-1.5 text-primary hover:text-primary-container font-label-sm text-label-sm uppercase transition-transform active:scale-125 cursor-pointer"
                      title="Darle amor a este recuerdo"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                      <span className="font-semibold">{item.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-inverse-surface/60 text-on-primary hover:bg-primary flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Photo half */}
            <div className="md:w-3/5 bg-inverse-surface flex items-center justify-center">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-full object-contain"
              />
            </div>

            {/* Content half */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between bg-surface-container-lowest">
              <div>
                <div className="flex items-center gap-2 text-secondary font-label-sm text-label-sm uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-[15px]">location_on</span>
                  <span>{lightboxPhoto.location}</span>
                  <span>•</span>
                  <span>{lightboxPhoto.date}</span>
                </div>
                <h2 className="font-display-lg text-headline-md text-primary font-serif italic mb-4">
                  {lightboxPhoto.title}
                </h2>
                <div className="deckle-border p-4 rounded-xl bg-surface-container-low mb-6">
                  <span className="font-label-sm text-[9px] uppercase tracking-widest text-secondary block font-semibold mb-1">
                    El Recuerdo Detrás de la Foto
                  </span>
                  <p className="font-body-lg text-body-lg text-on-surface font-serif italic leading-relaxed">
                    “{lightboxPhoto.caption}”
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase text-secondary">
                  Categoría: {lightboxPhoto.category}
                </span>
                <button
                  onClick={() => {
                    setOperationError('');
                    void onLikeMemory(lightboxPhoto.id).catch((cause: unknown) => {
                      setOperationError(cause instanceof Error ? cause.message : 'No se pudo guardar el me gusta.');
                    });
                  }}
                  className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span>{lightboxPhoto.likes} Me encanta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {memoryToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/50 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setMemoryToDelete(null)}
          role="presentation"
        >
          <section
            aria-labelledby="delete-memory-title"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-[0_24px_60px_rgba(108,39,33,0.25)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container text-error">
                <span className="material-symbols-outlined">delete</span>
              </span>
              <h2 id="delete-memory-title" className="font-headline-sm text-headline-sm text-primary">
                ¿Borrar este recuerdo?
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              “{memoryToDelete.title}” se quitará de tu galería guardada. Esta acción no se puede deshacer.
            </p>
            {operationError && (
              <p className="mt-3 rounded-xl bg-error-container px-4 py-3 font-body-sm text-body-sm text-error" role="alert">
                {operationError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full bg-surface-container px-5 py-2.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
                onClick={() => setMemoryToDelete(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-sm text-label-sm text-white transition-colors hover:bg-error/90"
                onClick={() => void handleConfirmDelete()}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
                Borrar foto
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">add_a_photo</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                  Añadir Foto a Nuestro Álbum
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                disabled={isSaving}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Título del Recuerdo
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Ej. Aquella noche mágica en Venecia"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                    Lugar / Ciudad
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                    placeholder="Ej. Costa Brava"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                    Fecha
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                    placeholder="Ej. Julio, 2025"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Foto desde tu dispositivo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={(event) => setSelectedPhoto(event.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-3 py-2 font-body-sm text-on-surface file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-label-sm file:text-on-primary"
                />
                {selectedPhoto && (
                  <p className="mt-2 flex items-center justify-between gap-2 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="truncate">{selectedPhoto.name}</span>
                    <button
                      className="shrink-0 text-error underline"
                      onClick={() => setSelectedPhoto(null)}
                      type="button"
                    >
                      Quitar
                    </button>
                  </p>
                )}
                <p className="font-body-sm text-[12px] text-on-surface-variant italic mt-1">
                  Elige una foto de tu galería, cámara o archivos. Se guardará en el proyecto para verla desde la PC y el celular.
                </p>
                <label className="mt-3 block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  O pega un enlace de fotografía
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Categoría
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="viajes">Viajes & Escapadas</option>
                  <option value="citas">Citas Especiales</option>
                  <option value="cotidiano">Tardes Cotidianas</option>
                  <option value="celebraciones">Celebraciones</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                  Frase o Historia del Recuerdo
                </label>
                <textarea
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 font-body-md text-on-surface focus:outline-none focus:border-primary font-serif italic"
                  placeholder="Escribe la historia o el sentimiento detrás de este momento..."
                />
              </div>

              {operationError && (
                <p className="rounded-xl bg-error-container px-4 py-3 font-body-sm text-body-sm text-error" role="alert">
                  {operationError}
                </p>
              )}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setOperationError('');
                  }}
                  className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors cursor-pointer"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  disabled={isSaving || (!selectedPhoto && !newImageUrl.trim())}
                >
                  <span>{isSaving ? 'Guardando en el proyecto...' : 'Guardar en el Álbum'}</span>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
