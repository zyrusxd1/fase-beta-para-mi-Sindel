import { useState, useEffect } from 'react';
import { ScreenType, CoupleSettings, LoveLetter, MemoryPhoto, LoveReason, BucketItem, Milestone } from './types';
import {
  initialCoupleSettings,
  initialLetters,
  initialMemories,
  initialReasons,
  initialMilestones,
  initialBucketList,
} from './data/initialData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RomanticAmbient } from './components/RomanticAmbient';
import { CoupleSettingsModal } from './components/CoupleSettingsModal';
import { HomeScreen } from './components/screens/HomeScreen';
import { LettersScreen } from './components/screens/LettersScreen';
import { GalleryScreen } from './components/screens/GalleryScreen';
import { ReasonsScreen } from './components/screens/ReasonsScreen';
import { CountdownScreen } from './components/screens/CountdownScreen';
import { addProjectMemory, deleteProjectMemory, likeProjectMemory, loadProjectMemories } from './utils/galleryApi';
import { loadSharedAppState, saveSharedAppState } from './utils/sharedStateApi';

function isScreenType(value: string | null): value is ScreenType {
  return (
    value === 'inicio' ||
    value === 'cartas-de-amor' ||
    value === 'galeria-de-recuerdos' ||
    value === 'razones-por-las-que-te-amo' ||
    value === 'cuenta-regresiva'
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    try {
      const savedScreen = sessionStorage.getItem('para_mi_amor_current_screen');
      return isScreenType(savedScreen) ? savedScreen : 'inicio';
    } catch {
      return 'inicio';
    }
  });
  const [romanticMode, setRomanticMode] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTrackLibraryOpen, setIsTrackLibraryOpen] = useState<boolean>(false);
  const [galleryError, setGalleryError] = useState('');
  const sharedStateEnabled = import.meta.env.VITE_ENABLE_SHARED_STATE === 'true';
  const [isSharedStateReady, setIsSharedStateReady] = useState(!sharedStateEnabled);
  const [sharedStateError, setSharedStateError] = useState('');

  // Persistent settings and data in localStorage
  const [settings, setSettings] = useState<CoupleSettings>(() => {
    try {
      const saved = localStorage.getItem('para_mi_amor_settings');
      if (!saved) return initialCoupleSettings;
      const savedSettings = JSON.parse(saved) as CoupleSettings;
      return savedSettings.startDate === '2024-10-17'
        ? { ...savedSettings, startDate: initialCoupleSettings.startDate }
        : savedSettings;
    } catch {
      return initialCoupleSettings;
    }
  });

  const [letters, setLetters] = useState<LoveLetter[]>(() => {
    try {
      const saved = localStorage.getItem('para_mi_amor_letters');
      return saved ? JSON.parse(saved) : initialLetters;
    } catch {
      return initialLetters;
    }
  });

  const [memories, setMemories] = useState<MemoryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('para_mi_amor_memories');
      return saved ? JSON.parse(saved) : initialMemories;
    } catch {
      return initialMemories;
    }
  });

  const [reasons, setReasons] = useState<LoveReason[]>(() => {
    try {
      const saved = localStorage.getItem('para_mi_amor_reasons');
      return saved ? JSON.parse(saved) : initialReasons;
    } catch {
      return initialReasons;
    }
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem('para_mi_amor_milestones');
      return saved ? JSON.parse(saved) : initialMilestones;
    } catch {
      return initialMilestones;
    }
  });

  const [bucketList, setBucketList] = useState<BucketItem[]>(() => {
    try {
      const saved = localStorage.getItem('para_mi_amor_bucket');
      return saved ? JSON.parse(saved) : initialBucketList;
    } catch {
      return initialBucketList;
    }
  });

  const [secretNotes, setSecretNotes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('para_mi_amor_secret_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('para_mi_amor_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('para_mi_amor_letters', JSON.stringify(letters));
    } catch {
      // ignore
    }
  }, [letters]);

  useEffect(() => {
    try {
      localStorage.setItem('para_mi_amor_memories', JSON.stringify(memories));
    } catch {
      // ignore
    }
  }, [memories]);

  useEffect(() => {
    let isActive = true;
    const initialGallery = memories.length > 0 ? memories : initialMemories;
    loadProjectMemories(initialGallery)
      .then((savedMemories) => {
        if (!isActive) return;
        setMemories(savedMemories);
        setGalleryError('');
      })
      .catch((cause: unknown) => {
        if (!isActive) return;
        setGalleryError(
          cause instanceof Error ? cause.message : 'No se pudieron cargar los recuerdos guardados en el proyecto.',
        );
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('para_mi_amor_reasons', JSON.stringify(reasons));
    } catch {
      // ignore
    }
  }, [reasons]);

  useEffect(() => {
    try {
      localStorage.setItem('para_mi_amor_milestones', JSON.stringify(milestones));
    } catch {
      // ignore
    }
  }, [milestones]);

  useEffect(() => {
    try {
      localStorage.setItem('para_mi_amor_bucket', JSON.stringify(bucketList));
    } catch {
      // ignore
    }
  }, [bucketList]);

  useEffect(() => {
    try {
      localStorage.setItem('para_mi_amor_secret_notes', JSON.stringify(secretNotes));
    } catch {
      // ignore
    }
  }, [secretNotes]);

  useEffect(() => {
    if (!sharedStateEnabled) return;
    let isActive = true;

    void loadSharedAppState()
      .then(async (sharedState) => {
        if (Object.keys(sharedState).length === 0) {
          await saveSharedAppState({ settings, letters, reasons, milestones, bucketList, secretNotes });
          return;
        }
        if (sharedState.settings) setSettings(sharedState.settings);
        if (sharedState.letters) setLetters(sharedState.letters);
        if (sharedState.reasons) setReasons(sharedState.reasons);
        if (sharedState.milestones) setMilestones(sharedState.milestones);
        if (sharedState.bucketList) setBucketList(sharedState.bucketList);
        if (sharedState.secretNotes) setSecretNotes(sharedState.secretNotes);
      })
      .then(() => {
        if (!isActive) return;
        setSharedStateError('');
        setIsSharedStateReady(true);
      })
      .catch((cause: unknown) => {
        if (!isActive) return;
        setSharedStateError(
          cause instanceof Error ? cause.message : 'No se pudieron sincronizar los datos compartidos de la beta.',
        );
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!sharedStateEnabled || !isSharedStateReady) return;
    const timeoutId = window.setTimeout(() => {
      void saveSharedAppState({ settings, letters, reasons, milestones, bucketList, secretNotes })
        .then(() => setSharedStateError(''))
        .catch((cause: unknown) => {
          setSharedStateError(
            cause instanceof Error ? cause.message : 'No se pudieron guardar los cambios compartidos.',
          );
        });
    }, 600);
    return () => window.clearTimeout(timeoutId);
  }, [sharedStateEnabled, isSharedStateReady, settings, letters, reasons, milestones, bucketList, secretNotes]);

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      sessionStorage.setItem('para_mi_amor_current_screen', currentScreen);
    } catch {
      // The screen remains usable when browser storage is unavailable.
    }
  }, [currentScreen]);

  const handleSaveSecretNote = (note: string) => {
    setSecretNotes((prev) => [note, ...prev]);

    // Also register as a secret letter card
    const newSecretLetter: LoveLetter = {
      id: `secret-${Date.now()}`,
      title: 'Nota Secreta Depositada',
      subtitle: 'Guardada en la caja fuerte digital',
      date: new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      category: 'secretas',
      sealColor: 'rose',
      content: `“${note}”\n\nEste mensaje fue escrito y confiado a nuestro rincón para recordar siempre este latido.`,
      author: 'Para nosotros',
      isRead: false,
    };

    setLetters((prev) => [newSecretLetter, ...prev]);
  };

  const handleAddLetter = (newLetter: Omit<LoveLetter, 'id'>) => {
    const created: LoveLetter = {
      ...newLetter,
      id: `letter-${Date.now()}`,
    };
    setLetters((prev) => [created, ...prev]);
  };

  const handleDeleteLetter = (id: string) => {
    const letter = letters.find((item) => item.id === id);
    setLetters((prev) => prev.filter((item) => item.id !== id));

    if (letter?.id.startsWith('secret-')) {
      const note = letter.content.match(/^“([\s\S]*?)”\n\nEste mensaje fue escrito/)?.[1];
      const noteIndex = note ? secretNotes.findIndex((savedNote) => savedNote === note) : -1;
      if (noteIndex !== -1) {
        setSecretNotes((prev) => prev.filter((_, index) => index !== noteIndex));
      }
    }
  };

  const handleAddMemory = async (newMemory: Omit<MemoryPhoto, 'id' | 'likes'>) => {
    const created = await addProjectMemory({ ...newMemory, likes: 1 });
    setMemories((prev) => [created, ...prev]);
    setGalleryError('');
  };

  const handleLikeMemory = async (id: string) => {
    const updatedMemory = await likeProjectMemory(id);
    setMemories((prev) => prev.map((memory) => (memory.id === id ? updatedMemory : memory)));
    setGalleryError('');
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteProjectMemory(id);
    setMemories((prev) => prev.filter((memory) => memory.id !== id));
    setGalleryError('');
  };

  const handleToggleFavoriteReason = (id: string) => {
    setReasons((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const handleAddReason = (newReason: Omit<LoveReason, 'id' | 'number'>) => {
    const nextNumber = Math.max(0, ...reasons.map((reason) => reason.number)) + 1;
    const created: LoveReason = {
      ...newReason,
      id: `reason-${Date.now()}`,
      number: nextNumber,
    };
    setReasons((prev) => [created, ...prev]);
  };

  const handleEditReason = (id: string, updates: Pick<LoveReason, 'text' | 'category'>) => {
    setReasons((prev) =>
      prev.map((reason) => (reason.id === id ? { ...reason, ...updates } : reason)),
    );
  };

  const handleDeleteReason = (id: string) => {
    setReasons((prev) =>
      prev
        .filter((reason) => reason.id !== id)
        .map((reason, index) => ({ ...reason, number: index + 1 })),
    );
  };

  const handleToggleBucketItem = (id: string) => {
    setBucketList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddBucketItem = (newItem: Omit<BucketItem, 'id'>) => {
    const created: BucketItem = {
      ...newItem,
      id: `bucket-${Date.now()}`,
    };
    setBucketList((prev) => [created, ...prev]);
  };

  const handleAddMilestone = (newMilestone: Omit<Milestone, 'id'>) => {
    const created: Milestone = {
      ...newMilestone,
      id: `milestone-${Date.now()}`,
    };
    setMilestones((prev) => [...prev, created]);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Floating Petals & Hearts Particle Layer */}
      <RomanticAmbient active={romanticMode} />

      {/* Top Fixed Header with Navigation and Audio Controls */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        romanticMode={romanticMode}
        onToggleRomanticMode={() => setRomanticMode(!romanticMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTrackLibraryOpen={isTrackLibraryOpen}
        onOpenTrackLibrary={() => setIsTrackLibraryOpen(true)}
        onCloseTrackLibrary={() => setIsTrackLibraryOpen(false)}
      />

      {/* Main Dynamic Screen View */}
      <main className="w-full pt-20 flex-1">
        {sharedStateEnabled && sharedStateError && (
          <div className="mx-auto mt-4 max-w-3xl rounded-xl bg-error-container px-4 py-3 text-center text-error" role="alert">
            {sharedStateError}
          </div>
        )}
        {currentScreen === 'inicio' && (
          <HomeScreen
            onNavigate={handleNavigate}
            settings={settings}
            onSaveSecretNote={handleSaveSecretNote}
            totalSavedNotesCount={secretNotes.length}
            onOpenTrackLibrary={() => setIsTrackLibraryOpen(true)}
            memories={memories}
            letters={letters}
          />
        )}

        {currentScreen === 'cartas-de-amor' && (
          <LettersScreen
            letters={letters}
            onAddLetter={handleAddLetter}
            onDeleteLetter={handleDeleteLetter}
            secretNotes={secretNotes}
          />
        )}

        {currentScreen === 'galeria-de-recuerdos' && (
          <GalleryScreen
            memories={memories}
            onAddMemory={handleAddMemory}
            onLikeMemory={handleLikeMemory}
            onDeleteMemory={handleDeleteMemory}
            error={galleryError}
            onRetryLoad={() => {
              const initialGallery = memories.length > 0 ? memories : initialMemories;
              void loadProjectMemories(initialGallery)
                .then((savedMemories) => {
                  setMemories(savedMemories);
                  setGalleryError('');
                })
                .catch((cause: unknown) => {
                  setGalleryError(
                    cause instanceof Error ? cause.message : 'No se pudieron cargar los recuerdos del proyecto.',
                  );
                });
            }}
          />
        )}

        {currentScreen === 'razones-por-las-que-te-amo' && (
          <ReasonsScreen
            reasons={reasons}
            onToggleFavorite={handleToggleFavoriteReason}
            onAddReason={handleAddReason}
            onEditReason={handleEditReason}
            onDeleteReason={handleDeleteReason}
          />
        )}

        {currentScreen === 'cuenta-regresiva' && (
          <CountdownScreen
            settings={settings}
            milestones={milestones}
            bucketList={bucketList}
            onToggleBucketItem={handleToggleBucketItem}
            onAddBucketItem={handleAddBucketItem}
            onAddMilestone={handleAddMilestone}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Couple Settings / Personalize Modal */}
      <CoupleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  );
}
