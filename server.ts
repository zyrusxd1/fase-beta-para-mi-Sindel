import { createClient } from '@supabase/supabase-js';
import express, { type NextFunction, type Request, type Response } from 'express';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import type { MemoryPhoto } from './src/types.ts';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const maximumTrackSize = 100 * 1024 * 1024;
const maximumPhotoSize = 20 * 1024 * 1024;
const trackNamePattern = /^[a-f0-9-]{36}-[a-zA-Z0-9_-]{1,70}\.mp3$/i;
const photoNamePattern = /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/i;
const memoryCategories = new Set(['viajes', 'cotidiano', 'citas', 'celebraciones']);
const stateKeys = new Set([
  'settings',
  'letters',
  'reasons',
  'milestones',
  'bucketList',
  'secretNotes',
]);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables del servidor.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

function sendError(response: Response, status: number, message: string) {
  response.status(status).json({ error: message });
}

function asyncRoute(
  handler: (request: Request, response: Response) => Promise<void>,
): (request: Request, response: Response, next: NextFunction) => void {
  return (request, response, next) => {
    void handler(request, response).catch(next);
  };
}

function requestAddress(request: Request) {
  return request.ip || request.socket.remoteAddress || 'unknown';
}

const writeWindows = new Map<string, { start: number; count: number }>();
app.use('/api', (request, response, next) => {
  if (request.method === 'GET' || request.method === 'HEAD') {
    next();
    return;
  }

  const address = requestAddress(request);
  const now = Date.now();
  const current = writeWindows.get(address);
  if (!current || now - current.start >= 60_000) {
    writeWindows.set(address, { start: now, count: 1 });
    next();
    return;
  }
  current.count += 1;
  if (current.count > 120) {
    sendError(response, 429, 'Demasiadas operaciones. Espera un minuto e inténtalo de nuevo.');
    return;
  }
  next();
});

function isMemoryPhoto(value: unknown): value is MemoryPhoto {
  if (!value || typeof value !== 'object') return false;
  const memory = value as Partial<MemoryPhoto>;
  return (
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
    memoryCategories.has(memory.category) &&
    Number.isInteger(memory.likes) &&
    (memory.likes ?? -1) >= 0
  );
}

function requireUpload(request: Request, response: Response, limit: number): Buffer | undefined {
  if (!Buffer.isBuffer(request.body)) {
    sendError(response, 400, 'No se recibió ningún archivo.');
    return undefined;
  }
  if (request.body.byteLength === 0) {
    sendError(response, 400, 'El archivo está vacío.');
    return undefined;
  }
  if (request.body.byteLength > limit) {
    sendError(response, 413, `El archivo supera el límite de ${Math.floor(limit / 1024 / 1024)} MB.`);
    return undefined;
  }
  return request.body;
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.get(
  '/api/state',
  asyncRoute(async (_request, response) => {
    const { data, error } = await supabase.from('app_state').select('key,payload');
    if (error) throw error;
    response.json(Object.fromEntries((data ?? []).map((row) => [row.key, row.payload])));
  }),
);

app.put(
  '/api/state',
  asyncRoute(async (request, response) => {
    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
      sendError(response, 400, 'El estado recibido no tiene un formato válido.');
      return;
    }
    const entries = Object.entries(request.body);
    if (entries.some(([key]) => !stateKeys.has(key))) {
      sendError(response, 400, 'El estado contiene una sección no reconocida.');
      return;
    }
    if (entries.length === 0) {
      response.json({ saved: true });
      return;
    }

    const rows = entries.map(([key, payload]) => ({ key, payload, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('app_state').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
    response.json({ saved: true });
  }),
);

app.get(
  '/api/recuerdos',
  asyncRoute(async (_request, response) => {
    const { data, error } = await supabase
      .from('gallery_memories')
      .select('id,title,date,location,image_url,caption,category,likes')
      .order('created_at', { ascending: false });
    if (error) throw error;
    response.json((data ?? []).map(({ image_url, ...memory }) => ({ ...memory, imageUrl: image_url })));
  }),
);

app.post(
  '/api/recuerdos/inicializar',
  asyncRoute(async (request, response) => {
    if (!Array.isArray(request.body) || !request.body.every(isMemoryPhoto)) {
      sendError(response, 400, 'Los recuerdos iniciales no tienen un formato válido.');
      return;
    }
    const { count, error: countError } = await supabase
      .from('gallery_memories')
      .select('id', { count: 'exact', head: true });
    if (countError) throw countError;
    if (count === 0 && request.body.length > 0) {
      const rows = request.body.map((memory: MemoryPhoto) => ({
        id: memory.id,
        title: memory.title,
        date: memory.date,
        location: memory.location,
        image_url: memory.imageUrl,
        caption: memory.caption,
        category: memory.category,
        likes: memory.likes,
      }));
      const { error } = await supabase.from('gallery_memories').insert(rows);
      if (error) throw error;
    }
    const { data, error } = await supabase
      .from('gallery_memories')
      .select('id,title,date,location,image_url,caption,category,likes')
      .order('created_at', { ascending: false });
    if (error) throw error;
    response.json((data ?? []).map(({ image_url, ...memory }) => ({ ...memory, imageUrl: image_url })));
  }),
);

app.post(
  '/api/recuerdos/fotos',
  express.raw({ type: '*/*', limit: maximumPhotoSize }),
  asyncRoute(async (request, response) => {
    const extension = path.extname(String(request.query.name ?? '')).toLowerCase();
    const mimeByExtension: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    if (!mimeByExtension[extension] || request.headers['content-type'] !== mimeByExtension[extension]) {
      sendError(response, 400, 'Selecciona una imagen JPG, PNG, WEBP o GIF.');
      return;
    }
    const bytes = requireUpload(request, response, maximumPhotoSize);
    if (!bytes) return;
    const savedExtension = extension === '.jpeg' ? '.jpg' : extension;
    const filename = `${randomUUID()}${savedExtension}`;
    const { error } = await supabase.storage.from('memory-photos').upload(filename, bytes, {
      contentType: mimeByExtension[extension],
      upsert: false,
    });
    if (error) throw error;
    response.status(201).json({ imageUrl: `/api/recuerdos/fotos/${filename}` });
  }),
);

app.get('/api/recuerdos/fotos/:filename', (request, response) => {
  if (!photoNamePattern.test(request.params.filename)) {
    sendError(response, 400, 'Nombre de foto no válido.');
    return;
  }
  const { data } = supabase.storage.from('memory-photos').getPublicUrl(request.params.filename);
  response.redirect(302, data.publicUrl);
});

app.delete(
  '/api/recuerdos/fotos/:filename',
  asyncRoute(async (request, response) => {
    if (!photoNamePattern.test(request.params.filename)) {
      sendError(response, 400, 'Nombre de foto no válido.');
      return;
    }
    const { error } = await supabase.storage.from('memory-photos').remove([request.params.filename]);
    if (error) throw error;
    response.status(204).end();
  }),
);

app.post(
  '/api/recuerdos',
  asyncRoute(async (request, response) => {
    if (!isMemoryPhoto(request.body)) {
      sendError(response, 400, 'Completa los datos del recuerdo correctamente.');
      return;
    }
    const memory = { ...request.body, id: randomUUID() };
    const { data, error } = await supabase
      .from('gallery_memories')
      .insert({
        id: memory.id,
        title: memory.title,
        date: memory.date,
        location: memory.location,
        image_url: memory.imageUrl,
        caption: memory.caption,
        category: memory.category,
        likes: memory.likes,
      })
      .select('id,title,date,location,image_url,caption,category,likes')
      .single();
    if (error) throw error;
    const { image_url, ...savedMemory } = data;
    response.status(201).json({ ...savedMemory, imageUrl: image_url });
  }),
);

app.post(
  '/api/recuerdos/:id/me-gusta',
  asyncRoute(async (request, response) => {
    const { data: memory, error: readError } = await supabase
      .from('gallery_memories')
      .select('likes')
      .eq('id', request.params.id)
      .maybeSingle();
    if (readError) throw readError;
    if (!memory) {
      sendError(response, 404, 'No se encontró este recuerdo.');
      return;
    }
    const { data, error } = await supabase
      .from('gallery_memories')
      .update({ likes: memory.likes + 1 })
      .eq('id', request.params.id)
      .select('id,title,date,location,image_url,caption,category,likes')
      .single();
    if (error) throw error;
    const { image_url, ...updatedMemory } = data;
    response.json({ ...updatedMemory, imageUrl: image_url });
  }),
);

app.delete(
  '/api/recuerdos/:id',
  asyncRoute(async (request, response) => {
    const { data: memory, error: readError } = await supabase
      .from('gallery_memories')
      .select('image_url')
      .eq('id', request.params.id)
      .maybeSingle();
    if (readError) throw readError;
    if (!memory) {
      sendError(response, 404, 'No se encontró este recuerdo.');
      return;
    }
    const { error } = await supabase.from('gallery_memories').delete().eq('id', request.params.id);
    if (error) throw error;
    const filename = path.basename(memory.image_url);
    if (memory.image_url.startsWith('/api/recuerdos/fotos/') && photoNamePattern.test(filename)) {
      const { error: storageError } = await supabase.storage.from('memory-photos').remove([filename]);
      if (storageError) throw storageError;
    }
    response.status(204).end();
  }),
);

app.get(
  '/api/canciones',
  asyncRoute(async (_request, response) => {
    const { data, error } = await supabase.from('music_tracks').select('id,title').order('created_at');
    if (error) throw error;
    response.json(
      (data ?? []).map((track) => ({
        ...track,
        subtitle: 'Una canción de nuestra historia.',
        side: 'Nuestra colección',
        duration: 0,
        audioUrl: `/api/canciones/${encodeURIComponent(track.id)}`,
        isUploaded: true,
      })),
    );
  }),
);

app.post(
  '/api/canciones',
  express.raw({ type: '*/*', limit: maximumTrackSize }),
  asyncRoute(async (request, response) => {
    if (request.headers['content-type'] !== 'audio/mpeg') {
      sendError(response, 400, 'Selecciona un archivo MP3.');
      return;
    }
    const bytes = requireUpload(request, response, maximumTrackSize);
    if (!bytes) return;
    const originalName = String(request.query.name ?? '');
    if (!originalName.toLowerCase().endsWith('.mp3')) {
      sendError(response, 400, 'Selecciona un archivo MP3.');
      return;
    }
    const title = path
      .basename(originalName, path.extname(originalName))
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'cancion';
    const id = `${randomUUID()}-${title}.mp3`;
    const { error: storageError } = await supabase.storage.from('music-tracks').upload(id, bytes, {
      contentType: 'audio/mpeg',
      upsert: false,
    });
    if (storageError) throw storageError;
    const { error } = await supabase.from('music_tracks').insert({ id, title: title.replace(/[-_]+/g, ' '), object_path: id });
    if (error) {
      await supabase.storage.from('music-tracks').remove([id]);
      throw error;
    }
    response.status(201).json({
      id,
      title: title.replace(/[-_]+/g, ' '),
      subtitle: 'Una canción de nuestra historia.',
      side: 'Nuestra colección',
      duration: 0,
      audioUrl: `/api/canciones/${encodeURIComponent(id)}`,
      isUploaded: true,
    });
  }),
);

app.get('/api/canciones/:id', async (request, response, next) => {
  if (!trackNamePattern.test(request.params.id)) {
    sendError(response, 400, 'Nombre de archivo no válido.');
    return;
  }
  const { data, error } = await supabase
    .from('music_tracks')
    .select('object_path')
    .eq('id', request.params.id)
    .maybeSingle();
  if (error) {
    next(error);
    return;
  }
  if (!data) {
    sendError(response, 404, 'No se encontró esta canción.');
    return;
  }
  const { data: publicFile } = supabase.storage.from('music-tracks').getPublicUrl(data.object_path);
  response.redirect(302, publicFile.publicUrl);
});

app.delete(
  '/api/canciones/:id',
  asyncRoute(async (request, response) => {
    if (!trackNamePattern.test(request.params.id)) {
      sendError(response, 400, 'Nombre de archivo no válido.');
      return;
    }
    const { data: track, error: readError } = await supabase
      .from('music_tracks')
      .select('object_path')
      .eq('id', request.params.id)
      .maybeSingle();
    if (readError) throw readError;
    if (!track) {
      sendError(response, 404, 'No se encontró esta canción.');
      return;
    }
    const { error: storageError } = await supabase.storage.from('music-tracks').remove([track.object_path]);
    if (storageError) throw storageError;
    const { error } = await supabase.from('music_tracks').delete().eq('id', request.params.id);
    if (error) throw error;
    response.status(204).end();
  }),
);

app.use(express.static(path.join(projectDirectory, 'dist'), { index: false, maxAge: '1h' }));
app.get('*', (_request, response, next) => {
  response.sendFile(path.join(projectDirectory, 'dist', 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error('API request failed:', error);
  if (response.headersSent) {
    response.end();
    return;
  }
  if (typeof error === 'object' && error !== null && 'type' in error) {
    if (error.type === 'entity.too.large') {
      sendError(response, 413, 'El archivo o la solicitud supera el tamaño permitido.');
      return;
    }
    if (error.type === 'entity.parse.failed') {
      sendError(response, 400, 'La solicitud contiene JSON no válido.');
      return;
    }
  }
  sendError(response, 500, 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.');
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Beta app listening on port ${port}`);
});
