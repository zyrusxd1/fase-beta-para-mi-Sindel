import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import type { MemoryPhoto } from '../src/types.ts';

const root = process.cwd();
const localDataDirectory = path.join(root, 'data');
const stateExportPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(localDataDirectory, 'para-mi-amor-local-data.json');
const photoDirectory = path.join(localDataDirectory, 'recuerdos', 'fotos');
const musicDirectory = path.join(localDataDirectory, 'canciones');
const photoNamePattern = /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/i;
const trackNamePattern = /^[a-f0-9-]{36}-[a-zA-Z0-9_-]{1,70}\.mp3$/i;

const stateKeyMapping = {
  para_mi_amor_settings: 'settings',
  para_mi_amor_letters: 'letters',
  para_mi_amor_reasons: 'reasons',
  para_mi_amor_milestones: 'milestones',
  para_mi_amor_bucket: 'bucketList',
  para_mi_amor_secret_notes: 'secretNotes',
} as const;

type LocalStorageExport = Partial<Record<keyof typeof stateKeyMapping | 'para_mi_amor_memories', string>>;

function isMemoryPhoto(value: unknown): value is MemoryPhoto {
  if (!value || typeof value !== 'object') return false;
  const memory = value as Partial<MemoryPhoto>;
  return (
    typeof memory.id === 'string' &&
    typeof memory.title === 'string' &&
    memory.title.length > 0 &&
    memory.title.length <= 150 &&
    typeof memory.date === 'string' &&
    memory.date.length <= 100 &&
    typeof memory.location === 'string' &&
    memory.location.length <= 150 &&
    typeof memory.imageUrl === 'string' &&
    (memory.imageUrl.startsWith('/api/recuerdos/fotos/') || /^https?:\/\//i.test(memory.imageUrl)) &&
    typeof memory.caption === 'string' &&
    memory.caption.length <= 2000 &&
    typeof memory.category === 'string' &&
    ['viajes', 'cotidiano', 'citas', 'celebraciones'].includes(memory.category) &&
    Number.isInteger(memory.likes) &&
    (memory.likes ?? -1) >= 0
  );
}

function requireEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta configurar ${name} en el archivo .env local.`);
  return value;
}

function getPhotoFilename(imageUrl: string) {
  if (!imageUrl.startsWith('/api/recuerdos/fotos/')) return undefined;
  const filename = path.basename(imageUrl);
  if (!photoNamePattern.test(filename)) {
    throw new Error(`La ruta de foto del recuerdo no tiene un nombre válido: ${imageUrl}`);
  }
  return filename;
}

function parseMemories(value: string | undefined): MemoryPhoto[] {
  if (value) {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every(isMemoryPhoto)) {
      throw new Error('Los recuerdos del navegador no tienen un formato válido.');
    }
    return parsed;
  }
  return [];
}

async function readExistingMemories(): Promise<MemoryPhoto[]> {
  try {
    const content = await readFile(path.join(localDataDirectory, 'recuerdos', 'galeria.json'), 'utf8');
    const parsed: unknown = JSON.parse(content);
    if (!Array.isArray(parsed) || !parsed.every(isMemoryPhoto)) {
      throw new Error('El archivo local de recuerdos no tiene un formato válido.');
    }
    return parsed;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
}

async function migrate() {
  const supabase = createClient(
    requireEnvironment('SUPABASE_URL'),
    requireEnvironment('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const exportedContent = await readFile(stateExportPath, 'utf8');
  const exported: unknown = JSON.parse(exportedContent);
  if (!exported || typeof exported !== 'object' || Array.isArray(exported)) {
    throw new Error('El archivo exportado del navegador no tiene un formato válido.');
  }
  const localStorage = exported as LocalStorageExport;
  const appState = Object.fromEntries(
    Object.entries(stateKeyMapping)
      .filter(([localKey]) => localStorage[localKey as keyof LocalStorageExport] !== undefined)
      .map(([localKey, cloudKey]) => [
        cloudKey,
        JSON.parse(localStorage[localKey as keyof LocalStorageExport] as string),
      ]),
  );
  const fileMemories = await readExistingMemories();
  const browserMemories = parseMemories(localStorage.para_mi_amor_memories);
  const memoriesById = new Map(fileMemories.map((memory) => [memory.id, memory]));
  for (const memory of browserMemories) memoriesById.set(memory.id, memory);
  const memoriesToImport = [...memoriesById.values()];

  const photoFiles = await readdir(photoDirectory, { withFileTypes: true }).catch((error: unknown) => {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  });
  const localPhotos = new Set(photoFiles.filter((entry) => entry.isFile()).map((entry) => entry.name));
  const memoryRows = [];
  for (const memory of memoriesToImport) {
    const filename = getPhotoFilename(memory.imageUrl);
    if (filename && localPhotos.has(filename)) {
      const photo = await readFile(path.join(photoDirectory, filename));
      const extension = path.extname(filename).toLowerCase();
      const contentType: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      };
      const { error } = await supabase.storage.from('memory-photos').upload(filename, photo, {
        contentType: contentType[extension],
        upsert: true,
      });
      if (error) throw error;
    } else if (filename && !localPhotos.has(filename)) {
      throw new Error(`No se encontró el archivo local de la foto ${filename}.`);
    }
    memoryRows.push({
      id: memory.id,
      title: memory.title,
      date: memory.date,
      location: memory.location,
      image_url: memory.imageUrl,
      caption: memory.caption,
      category: memory.category,
      likes: memory.likes,
    });
  }

  const trackFiles = await readdir(musicDirectory, { withFileTypes: true }).catch((error: unknown) => {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  });
  const trackRows = [];
  for (const entry of trackFiles) {
    if (!entry.isFile() || !trackNamePattern.test(entry.name)) continue;
    const bytes = await readFile(path.join(musicDirectory, entry.name));
    const title = entry.name
      .replace(/^[a-f0-9-]{36}-/i, '')
      .replace(/\.mp3$/i, '')
      .replace(/[-_]+/g, ' ');
    const { error } = await supabase.storage.from('music-tracks').upload(entry.name, bytes, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
    if (error) throw error;
    trackRows.push({ id: entry.name, title, object_path: entry.name });
  }

  if (memoryRows.length > 0) {
    const { error } = await supabase.from('gallery_memories').upsert(memoryRows, { onConflict: 'id' });
    if (error) throw error;
  }
  if (trackRows.length > 0) {
    const { error } = await supabase.from('music_tracks').upsert(trackRows, { onConflict: 'id' });
    if (error) throw error;
  }
  if (Object.keys(appState).length > 0) {
    const { error } = await supabase
      .from('app_state')
      .upsert(
        Object.entries(appState).map(([key, payload]) => ({ key, payload, updated_at: new Date().toISOString() })),
        { onConflict: 'key' },
      );
    if (error) throw error;
  }

  console.log(
    `Migración completada: ${memoryRows.length} recuerdos, ${trackRows.length} canciones y ${Object.keys(appState).length} secciones de datos.`,
  );
}

void migrate().catch((error: unknown) => {
  console.error('No se pudo completar la migración local:', error);
  process.exitCode = 1;
});
