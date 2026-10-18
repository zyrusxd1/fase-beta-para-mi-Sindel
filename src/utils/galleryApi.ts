import { MemoryPhoto } from '../types';

interface ApiError {
  error?: string;
}

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as ApiError;
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

async function requireSuccess(response: Response, fallback: string) {
  if (!response.ok) throw new Error(await readError(response, fallback));
}

export async function loadProjectMemories(initialMemories: MemoryPhoto[]) {
  const initialized = await fetch('/api/recuerdos/inicializar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(initialMemories),
  });
  await requireSuccess(initialized, 'No se pudieron cargar los recuerdos guardados en el proyecto.');
  return (await initialized.json()) as MemoryPhoto[];
}

export async function uploadMemoryPhoto(file: File) {
  const response = await fetch(`/api/recuerdos/fotos?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  await requireSuccess(response, `No se pudo guardar la foto ${file.name}.`);
  const result = (await response.json()) as { imageUrl: string };
  return result.imageUrl;
}

export async function deleteUploadedMemoryPhoto(imageUrl: string) {
  const filename = imageUrl.split('/').pop();
  if (!filename) return;
  const response = await fetch(`/api/recuerdos/fotos/${encodeURIComponent(filename)}`, { method: 'DELETE' });
  await requireSuccess(response, 'La foto se guardó, pero no se pudo limpiar el archivo sin su recuerdo.');
}

export async function addProjectMemory(memory: Omit<MemoryPhoto, 'id'>) {
  const response = await fetch('/api/recuerdos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory),
  });
  await requireSuccess(response, 'No se pudo guardar el recuerdo en el proyecto.');
  return (await response.json()) as MemoryPhoto;
}

export async function deleteProjectMemory(id: string) {
  const response = await fetch(`/api/recuerdos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await requireSuccess(response, 'No se pudo borrar el recuerdo del proyecto.');
}

export async function likeProjectMemory(id: string) {
  const response = await fetch(`/api/recuerdos/${encodeURIComponent(id)}/me-gusta`, { method: 'POST' });
  await requireSuccess(response, 'No se pudo guardar el me gusta.');
  return (await response.json()) as MemoryPhoto;
}
