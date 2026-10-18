import React, { useState } from 'react';
import { CoupleSettings } from '../types';

interface CoupleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CoupleSettings;
  onSave: (newSettings: CoupleSettings) => void;
}

export const CoupleSettingsModal: React.FC<CoupleSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<CoupleSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(108,39,33,0.2)] border border-outline-variant/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">local_florist</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">
                Personalizar Nuestro Rincón
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                Ajusta los nombres y fechas de vuestra historia de amor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                Dedicatoria / Tu Amor
              </label>
              <input
                type="text"
                value={formData.partner1}
                onChange={(e) => setFormData({ ...formData, partner1: e.target.value })}
                className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:border-primary"
                placeholder="Ej. Para el amor de mi vida"
                required
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                Firma / Tu Nombre
              </label>
              <input
                type="text"
                value={formData.partner2}
                onChange={(e) => setFormData({ ...formData, partner2: e.target.value })}
                className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:border-primary"
                placeholder="Ej. Tuyo por siempre"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
              Fecha de Inicio de Nuestra Historia
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:border-primary"
              required
            />
            <p className="font-body-sm text-[13px] text-on-surface-variant italic mt-1">
              Se utiliza para calcular automáticamente los días y horas juntos en la portada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                Fecha del Próximo Hito
              </label>
              <input
                type="date"
                value={formData.nextEventDate}
                onChange={(e) => setFormData({ ...formData, nextEventDate: e.target.value })}
                className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
                Título del Hito
              </label>
              <input
                type="text"
                value={formData.nextEventTitle}
                onChange={(e) => setFormData({ ...formData, nextEventTitle: e.target.value })}
                className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:border-primary"
                placeholder="Ej. Escapada a la Costa"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold mb-1">
              Nombre de Nuestro Aniversario
            </label>
            <input
              type="text"
              value={formData.anniversaryName}
              onChange={(e) => setFormData({ ...formData, anniversaryName: e.target.value })}
              className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:border-primary"
              placeholder="Ej. 2 Años de Amor Inagotable"
              required
            />
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-center italic animate-fadeIn">
              ♥ ¡Datos guardados con amor!
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider hover:bg-primary-container transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Guardar Cambios</span>
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
