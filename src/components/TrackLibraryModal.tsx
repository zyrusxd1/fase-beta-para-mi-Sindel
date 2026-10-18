import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AudioTrack, soundSynthesizer } from '../utils/audioPlayer';

interface TrackLibraryModalProps {
  tracks: AudioTrack[];
  currentTrackId: string;
  isPlaying: boolean;
  error: string;
  onClose: () => void;
  onError: (message: string) => void;
}

export const TrackLibraryModal: React.FC<TrackLibraryModalProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  error,
  onClose,
  onError,
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleAddFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = input.files;
    if (!files?.length) return;
    setActionError('');
    setIsSaving(true);
    try {
      await soundSynthesizer.addFiles(files);
      input.value = '';
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudieron agregar las canciones.';
      setActionError(message);
      onError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (track: AudioTrack) => {
    try {
      await soundSynthesizer.removeTrack(track.id);
      setActionError('');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo quitar esta canción.';
      setActionError(message);
      onError(message);
    }
  };

  const message = actionError || error;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="track-library-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl border border-outline-variant/40 bg-surface p-5 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
              Nuestra colección
            </span>
            <h2 id="track-library-title" className="mt-1 font-headline-md text-headline-md text-primary">
              Nuestras canciones
            </h2>
          </div>
          <button
            aria-label="Cerrar biblioteca"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary hover:bg-secondary-container"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
          Agrega archivos MP3 y escúchalos desde este dispositivo.
        </p>

        {message && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 font-body-sm text-body-sm text-error" role="alert">
            {message}
          </p>
        )}

        <div className="max-h-[45vh] space-y-2 overflow-y-auto">
          {tracks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low px-5 py-8 text-center">
              <span className="material-symbols-outlined text-3xl text-secondary">library_music</span>
              <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                Todavía no hay canciones. Agrega archivos MP3 propios o con licencia para empezar.
              </p>
            </div>
          )}
          {tracks.map((track) => {
            const isCurrent = track.id === currentTrackId;
            return (
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  isCurrent
                    ? 'border-primary/30 bg-secondary-container/40'
                    : 'border-outline-variant/30 bg-surface-container-lowest'
                }`}
                key={track.id}
              >
                <button
                  aria-label={`${isCurrent && isPlaying ? 'Pausar' : 'Reproducir'} ${track.title}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"
                  onClick={() => {
                    if (isCurrent) soundSynthesizer.toggle();
                    else soundSynthesizer.selectTrack(track.id, true);
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    {isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body-sm text-body-sm font-semibold text-on-surface">{track.title}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {track.isUploaded ? 'MP3 agregado' : 'Melodía de muestra'}
                  </p>
                </div>
                {track.isUploaded && (
                  <button
                    aria-label={`Quitar ${track.title}`}
                    className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-full px-2 text-secondary transition-colors hover:bg-error-container hover:text-error"
                    onClick={() => void handleRemove(track)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span className="font-label-sm text-label-sm">Quitar</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <input
          accept=".mp3,audio/mpeg"
          className="hidden"
          multiple
          onChange={(event) => void handleAddFiles(event)}
          ref={fileInput}
          type="file"
        />
        <button
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSaving}
          onClick={() => fileInput.current?.click()}
          type="button"
        >
          <span className="material-symbols-outlined">library_add</span>
          {isSaving ? 'Guardando en la biblioteca...' : 'Agregar archivos MP3'}
        </button>
        <p className="mt-3 text-center font-label-sm text-label-sm text-on-surface-variant">
          Los archivos se guardan en el almacenamiento compartido de la beta. Agrega solo música propia o autorizada para publicación.
        </p>
      </section>
    </div>,
    document.body,
  );
};
