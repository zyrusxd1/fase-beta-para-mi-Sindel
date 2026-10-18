export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  side: string;
  duration: number;
  audioUrl: string;
  isUploaded: true;
}

interface MusicApiError {
  error?: string;
}

interface LegacyBrowserTrack {
  id: string;
  title: string;
  file: Blob;
}

const legacyDatabaseName = 'para-mi-amor-audio';
const legacyStoreName = 'tracks';

class RomanticSoundSynthesizer {
  private audio = new Audio();
  private isPlayingState = false;
  private currentTrackIndex = 0;
  private onStateChangeCallbacks: Array<(playing: boolean) => void> = [];
  private onTimeUpdateCallbacks: Array<(time: number, duration: number) => void> = [];
  private onTracksChangeCallbacks: Array<(tracks: AudioTrack[]) => void> = [];
  private onErrorCallbacks: Array<(message: string) => void> = [];
  private currentTime = 0;
  private totalDuration = 0;
  private savedTracksLoaded = false;
  private tracks: AudioTrack[] = [];

  constructor() {
    this.audio.addEventListener('play', () => {
      this.isPlayingState = true;
      this.notifyState();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlayingState = false;
      this.notifyState();
    });
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;
      this.notifyTime();
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.totalDuration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
      const track = this.getCurrentTrack();
      if (track) track.duration = this.totalDuration;
      this.notifyTime();
    });
    this.audio.addEventListener('ended', () => {
      if (this.tracks.length > 1) {
        this.next(true);
        return;
      }
      this.isPlayingState = false;
      this.currentTime = this.totalDuration;
      this.notifyState();
      this.notifyTime();
    });
    this.audio.addEventListener('error', () => {
      if (this.getCurrentTrack()) this.notifyError('No se pudo reproducir este archivo MP3.');
    });
  }

  private async readError(response: Response, fallback: string) {
    try {
      const body = (await response.json()) as MusicApiError;
      return body.error || fallback;
    } catch {
      return fallback;
    }
  }

  private readLegacyTracks(): Promise<LegacyBrowserTrack[]> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(legacyDatabaseName, 1);
      let databaseWasCreated = false;
      request.onupgradeneeded = () => {
        databaseWasCreated = !request.result.objectStoreNames.contains(legacyStoreName);
      };
      request.onerror = () => reject(request.error ?? new Error('No se pudieron leer las canciones guardadas anteriormente.'));
      request.onsuccess = () => {
        const database = request.result;
        if (databaseWasCreated || !database.objectStoreNames.contains(legacyStoreName)) {
          database.close();
          resolve([]);
          return;
        }

        const transaction = database.transaction(legacyStoreName, 'readonly');
        const getTracks = transaction.objectStore(legacyStoreName).getAll();
        let tracks: LegacyBrowserTrack[] = [];
        getTracks.onsuccess = () => {
          tracks = (getTracks.result as LegacyBrowserTrack[]).filter(
            (track) => typeof track.id === 'string' && typeof track.title === 'string' && track.file instanceof Blob,
          );
        };
        getTracks.onerror = () => {
          database.close();
          reject(getTracks.error ?? new Error('No se pudieron leer las canciones guardadas anteriormente.'));
        };
        transaction.oncomplete = () => {
          database.close();
          resolve(tracks);
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error ?? new Error('No se pudieron leer las canciones guardadas anteriormente.'));
        };
      };
    });
  }

  private deleteLegacyTrack(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(legacyDatabaseName, 1);
      request.onerror = () => reject(request.error ?? new Error('No se pudo completar la transferencia de una canción.'));
      request.onsuccess = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(legacyStoreName)) {
          database.close();
          resolve();
          return;
        }
        const transaction = database.transaction(legacyStoreName, 'readwrite');
        transaction.objectStore(legacyStoreName).delete(id);
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error ?? new Error('No se pudo completar la transferencia de una canción.'));
        };
      };
    });
  }

  private async migrateLegacyTracks() {
    if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname)) return;
    let legacyTracks: LegacyBrowserTrack[];
    try {
      legacyTracks = await this.readLegacyTracks();
    } catch (cause) {
      this.notifyError(cause instanceof Error ? cause.message : 'No se pudieron migrar las canciones guardadas anteriormente.');
      return;
    }

    for (const legacyTrack of legacyTracks) {
      const name = legacyTrack.title.toLowerCase().endsWith('.mp3')
        ? legacyTrack.title
        : `${legacyTrack.title}.mp3`;
      try {
        const file = new File([legacyTrack.file], name, { type: 'audio/mpeg' });
        const track = await this.uploadFile(file);
        const wasEmpty = this.tracks.length === 0;
        this.tracks = [...this.tracks, track];
        this.notifyTracks();
        if (wasEmpty) this.selectTrack(track.id);
        await this.deleteLegacyTrack(legacyTrack.id);
      } catch (cause) {
        this.notifyError(
          cause instanceof Error ? cause.message : `No se pudo transferir ${legacyTrack.title} al proyecto.`,
        );
        return;
      }
    }
  }

  public async loadSavedTracks() {
    if (this.savedTracksLoaded) return;
    const response = await fetch('/api/canciones');
    if (!response.ok) {
      throw new Error(await this.readError(response, 'No se pudo cargar la biblioteca del proyecto.'));
    }
    this.tracks = (await response.json()) as AudioTrack[];
    this.savedTracksLoaded = true;
    this.currentTrackIndex = 0;
    const currentTrack = this.getCurrentTrack();
    this.currentTime = 0;
    this.totalDuration = currentTrack?.duration ?? 0;
    this.notifyTracks();
    this.notifyTime();
    this.savedTracksLoaded = true;
    await this.migrateLegacyTracks();
  }

  private async uploadFile(file: File): Promise<AudioTrack> {
    const response = await fetch(`/api/canciones?name=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'audio/mpeg' },
      body: file,
    });
    if (!response.ok) {
      throw new Error(await this.readError(response, `No se pudo guardar ${file.name}.`));
    }
    return (await response.json()) as AudioTrack;
  }

  public async addFiles(files: FileList | File[]) {
    await this.loadSavedTracks();
    const selectedFiles = Array.from(files);
    if (selectedFiles.length === 0) return;
    if (selectedFiles.some((file) => !file.name.toLowerCase().endsWith('.mp3') && file.type !== 'audio/mpeg')) {
      throw new Error('Solo puedes agregar archivos MP3.');
    }

    const wasEmpty = this.tracks.length === 0;
    for (const file of selectedFiles) {
      const track = await this.uploadFile(file);
      this.tracks = [...this.tracks, track];
      this.notifyTracks();
      if (wasEmpty && this.tracks.length === 1) this.selectTrack(track.id);
    }
  }

  public async removeTrack(id: string) {
    const trackIndex = this.tracks.findIndex((track) => track.id === id);
    const track = this.tracks[trackIndex];
    if (!track) return;
    const response = await fetch(track.audioUrl, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(await this.readError(response, 'No se pudo quitar esta canción del proyecto.'));
    }

    if (trackIndex === this.currentTrackIndex) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.isPlayingState = false;
      this.currentTime = 0;
    } else if (trackIndex < this.currentTrackIndex) {
      this.currentTrackIndex -= 1;
    }
    this.tracks = this.tracks.filter((item) => item.id !== id);
    if (this.tracks.length === 0) {
      this.currentTrackIndex = 0;
      this.totalDuration = 0;
    } else if (trackIndex === this.currentTrackIndex) {
      this.currentTrackIndex = Math.min(trackIndex, this.tracks.length - 1);
      this.totalDuration = this.getCurrentTrack()?.duration ?? 0;
    }
    this.notifyTracks();
    this.notifyState();
    this.notifyTime();
  }

  public subscribeState(cb: (playing: boolean) => void) {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((callback) => callback !== cb);
    };
  }

  public subscribeTime(cb: (time: number, duration: number) => void) {
    this.onTimeUpdateCallbacks.push(cb);
    return () => {
      this.onTimeUpdateCallbacks = this.onTimeUpdateCallbacks.filter((callback) => callback !== cb);
    };
  }

  public subscribeTracks(cb: (tracks: AudioTrack[]) => void) {
    this.onTracksChangeCallbacks.push(cb);
    return () => {
      this.onTracksChangeCallbacks = this.onTracksChangeCallbacks.filter((callback) => callback !== cb);
    };
  }

  public subscribeError(cb: (message: string) => void) {
    this.onErrorCallbacks.push(cb);
    return () => {
      this.onErrorCallbacks = this.onErrorCallbacks.filter((callback) => callback !== cb);
    };
  }

  private notifyState() {
    this.onStateChangeCallbacks.forEach((callback) => callback(this.isPlayingState));
  }

  private notifyTime() {
    this.onTimeUpdateCallbacks.forEach((callback) => callback(this.currentTime, this.totalDuration));
  }

  private notifyTracks() {
    this.onTracksChangeCallbacks.forEach((callback) => callback(this.getTracks()));
  }

  private notifyError(message: string) {
    this.onErrorCallbacks.forEach((callback) => callback(message));
  }

  public start() {
    const track = this.getCurrentTrack();
    if (!track) return;
    if (this.audio.src !== new URL(track.audioUrl, window.location.href).href) {
      this.audio.src = track.audioUrl;
    }
    void this.audio.play().catch(() => {
      this.notifyError('No se pudo iniciar la canción. Inténtalo de nuevo.');
    });
  }

  public pause() {
    this.audio.pause();
    this.isPlayingState = false;
    this.notifyState();
  }

  public toggle() {
    if (this.isPlayingState) this.pause();
    else this.start();
  }

  public selectTrack(id: string, autoplay = false) {
    const index = this.tracks.findIndex((track) => track.id === id);
    if (index === -1) return;
    this.audio.pause();
    this.currentTrackIndex = index;
    const track = this.tracks[index];
    this.audio.src = track.audioUrl;
    this.currentTime = 0;
    this.totalDuration = track.duration;
    this.notifyState();
    this.notifyTime();
    if (autoplay) this.start();
  }

  public next(autoplay = this.isPlayingState) {
    if (this.tracks.length === 0) return;
    const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.selectTrack(this.tracks[nextIndex].id, autoplay);
  }

  public prev() {
    if (this.tracks.length === 0) return;
    const previousIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.selectTrack(this.tracks[previousIndex].id, this.isPlayingState);
  }

  public seek(percentage: number) {
    if (!this.getCurrentTrack() || this.totalDuration === 0) return;
    this.audio.currentTime = Math.max(0, Math.min(this.totalDuration, percentage * this.totalDuration));
    this.currentTime = this.audio.currentTime;
    this.notifyTime();
  }

  public isPlaying() {
    return this.isPlayingState;
  }

  public getTracks() {
    return [...this.tracks];
  }

  public getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  public getCurrentTime() {
    return this.currentTime;
  }

  public getTotalDuration() {
    return this.totalDuration;
  }

  public formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const soundSynthesizer = new RomanticSoundSynthesizer();
