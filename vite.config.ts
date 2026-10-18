import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import type { MemoryPhoto } from './src/types.ts';

const projectDirectory = fileURLToPath(new URL('.', import.meta.url));
const projectDataDirectory = path.join(projectDirectory, 'data');
const musicDirectory = path.join(projectDataDirectory, 'canciones');
const memoriesDirectory = path.join(projectDataDirectory, 'recuerdos');
const photosDirectory = path.join(memoriesDirectory, 'fotos');
const memoriesFile = path.join(memoriesDirectory, 'galeria.json');
const legacyMusicDirectory = path.join(projectDirectory, 'public', 'canciones');
const legacyMemoriesDirectory = path.join(projectDirectory, 'public', 'recuerdos');
const maximumTrackSize = 100 * 1024 * 1024;
const maximumPhotoSize = 20 * 1024 * 1024;
const trackNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.mp3$/;
const photoNamePattern = /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/i;
const memoryCategories = new Set(['viajes', 'cotidiano', 'citas', 'celebraciones']);

async function migrateLegacyStorage() {
  await mkdir(musicDirectory, { recursive: true });
  await mkdir(photosDirectory, { recursive: true });

  for (const filename of await readdir(legacyMusicDirectory).catch((error: unknown) => {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  })) {
    if (!trackNamePattern.test(filename)) continue;
    const oldPath = path.join(legacyMusicDirectory, filename);
    const newPath = path.join(musicDirectory, filename);
    try {
      await stat(newPath);
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
      await rename(oldPath, newPath);
    }
  }

  try {
    await stat(memoriesFile);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
    try {
      await rename(path.join(legacyMemoriesDirectory, 'galeria.json'), memoriesFile);
    } catch (renameError) {
      if (!(renameError instanceof Error && 'code' in renameError && renameError.code === 'ENOENT')) {
        throw renameError;
      }
    }
  }

  const legacyPhotosDirectory = path.join(legacyMemoriesDirectory, 'fotos');
  for (const filename of await readdir(legacyPhotosDirectory).catch((error: unknown) => {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  })) {
    if (!photoNamePattern.test(filename)) continue;
    const oldPath = path.join(legacyPhotosDirectory, filename);
    const newPath = path.join(photosDirectory, filename);
    try {
      await stat(newPath);
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
      await rename(oldPath, newPath);
    }
  }
}

function isLocalRequest(request: IncomingMessage) {
  const address = request.socket.remoteAddress;
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function sendJson(response: ServerResponse, statusCode: number, value: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(value));
}

async function readJsonRequest(request: IncomingMessage, maximumBytes: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > maximumBytes) throw new Error('El archivo de datos es demasiado grande.');
    chunks.push(bytes);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

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

async function getSavedMemories(): Promise<MemoryPhoto[]> {
  try {
    const content = await (await import('node:fs/promises')).readFile(memoriesFile, 'utf8');
    const memories: unknown = JSON.parse(content);
    if (!Array.isArray(memories) || !memories.every(isMemoryPhoto)) {
      throw new Error('El archivo de recuerdos del proyecto tiene un formato no válido.');
    }
    return memories;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveMemories(memories: MemoryPhoto[]) {
  await mkdir(memoriesDirectory, { recursive: true });
  const temporaryFile = `${memoriesFile}.${randomUUID()}.tmp`;
  await import('node:fs/promises').then(({ writeFile }) =>
    writeFile(temporaryFile, JSON.stringify(memories, null, 2), { flag: 'wx' }),
  );
  await rename(temporaryFile, memoriesFile);
}

function musicApiPlugin(): Plugin {
  return {
    name: 'project-music-library',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        if (pathname !== '/api/canciones' && !pathname.startsWith('/api/canciones/')) {
          next();
          return;
        }

        void (async () => {
          await mkdir(musicDirectory, { recursive: true });

          if (request.method === 'GET' && pathname === '/api/canciones') {
            const filenames = (await readdir(musicDirectory))
              .filter((filename) => trackNamePattern.test(filename))
              .sort((left, right) => left.localeCompare(right));
            sendJson(
              response,
              200,
              filenames.map((filename) => ({
                id: filename,
                title: filename.replace(/^[a-f0-9-]{36}-/i, '').replace(/\.mp3$/i, '').replace(/[-_]+/g, ' '),
                subtitle: 'Una canción de nuestra historia.',
                side: 'Nuestra colección',
                duration: 0,
                audioUrl: `/api/canciones/${encodeURIComponent(filename)}`,
                isUploaded: true,
              })),
            );
            return;
          }

          if (pathname.startsWith('/api/canciones/')) {
            let filename: string;
            try {
              filename = decodeURIComponent(pathname.slice('/api/canciones/'.length));
            } catch {
              sendJson(response, 400, { error: 'Nombre de archivo no válido.' });
              return;
            }
            if (!trackNamePattern.test(filename)) {
              sendJson(response, 400, { error: 'Nombre de archivo no válido.' });
              return;
            }
            const filepath = path.join(musicDirectory, filename);

            if (request.method === 'GET') {
              let fileStats;
              try {
                fileStats = await stat(filepath);
              } catch {
                sendJson(response, 404, { error: 'No se encontró esta canción.' });
                return;
              }
              response.setHeader('Content-Type', 'audio/mpeg');
              response.setHeader('Accept-Ranges', 'bytes');
              response.setHeader('Cache-Control', 'no-cache');
              const range = request.headers.range;
              if (range) {
                const match = /^bytes=(\d*)-(\d*)$/.exec(range);
                if (!match) {
                  response.statusCode = 416;
                  response.setHeader('Content-Range', `bytes */${fileStats.size}`);
                  response.end();
                  return;
                }
                const start = match[1] ? Number(match[1]) : 0;
                const end = match[2] ? Math.min(Number(match[2]), fileStats.size - 1) : fileStats.size - 1;
                if (start >= fileStats.size || start > end) {
                  response.statusCode = 416;
                  response.setHeader('Content-Range', `bytes */${fileStats.size}`);
                  response.end();
                  return;
                }
                response.statusCode = 206;
                response.setHeader('Content-Range', `bytes ${start}-${end}/${fileStats.size}`);
                response.setHeader('Content-Length', end - start + 1);
                createReadStream(filepath, { start, end }).pipe(response);
                return;
              }
              response.setHeader('Content-Length', fileStats.size);
              createReadStream(filepath).pipe(response);
              return;
            }

            if (request.method === 'DELETE') {
              if (!isLocalRequest(request)) {
                sendJson(response, 403, { error: 'Solo puedes administrar canciones desde la computadora del proyecto.' });
                return;
              }
              try {
                await rm(filepath);
              } catch {
                sendJson(response, 404, { error: 'No se encontró esta canción.' });
                return;
              }
              response.statusCode = 204;
              response.end();
              return;
            }

            sendJson(response, 405, { error: 'Método no permitido.' });
            return;
          }

          if (request.method !== 'POST') {
            sendJson(response, 405, { error: 'Método no permitido.' });
            return;
          }
          if (!isLocalRequest(request)) {
            sendJson(response, 403, { error: 'Agrega canciones desde la computadora donde está el proyecto.' });
            return;
          }
          const requestUrl = new URL(request.url ?? '/', 'http://localhost');
          const originalName = requestUrl.searchParams.get('name') ?? '';
          if (!originalName.toLowerCase().endsWith('.mp3')) {
            sendJson(response, 400, { error: 'Selecciona un archivo MP3.' });
            return;
          }
          const safeName = originalName
            .split(/[\\/]/)
            .pop()!
            .replace(/\.mp3$/i, '')
            .normalize('NFKD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-zA-Z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 70) || 'cancion';
          const filename = `${randomUUID()}-${safeName}.mp3`;
          const temporaryPath = path.join(musicDirectory, `.${filename}.upload`);
          let bytesWritten = 0;
          const sizeLimit = new Transform({
            transform(chunk: Buffer, _encoding, callback) {
              bytesWritten += chunk.length;
              callback(
                bytesWritten > maximumTrackSize
                  ? new Error('Cada MP3 debe pesar menos de 100 MB.')
                  : null,
                chunk,
              );
            },
          });

          try {
            await pipeline(request, sizeLimit, createWriteStream(temporaryPath, { flags: 'wx' }));
            await rename(temporaryPath, path.join(musicDirectory, filename));
          } catch (error) {
            await rm(temporaryPath, { force: true });
            const message = error instanceof Error ? error.message : 'No se pudo guardar el archivo MP3.';
            sendJson(response, message.includes('100 MB') ? 413 : 400, { error: message });
            return;
          }

          sendJson(response, 201, {
            id: filename,
            title: safeName.replace(/[-_]+/g, ' '),
            subtitle: 'Una canción de nuestra historia.',
            side: 'Nuestra colección',
            duration: 0,
            audioUrl: `/api/canciones/${encodeURIComponent(filename)}`,
            isUploaded: true,
          });
        })().catch((error: unknown) => {
          if (response.headersSent) {
            response.destroy(error instanceof Error ? error : undefined);
            return;
          }
          const message = error instanceof Error ? error.message : 'Error inesperado al acceder a la biblioteca.';
          sendJson(response, 500, { error: message });
        });
      });
    },
  };
}

function memoriesApiPlugin(): Plugin {
  return {
    name: 'project-memories-gallery',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        if (pathname !== '/api/recuerdos' && !pathname.startsWith('/api/recuerdos/')) {
          next();
          return;
        }

        void (async () => {
          await mkdir(photosDirectory, { recursive: true });

          if (request.method === 'GET' && pathname === '/api/recuerdos') {
            sendJson(response, 200, await getSavedMemories());
            return;
          }

          if (pathname === '/api/recuerdos/inicializar' && request.method === 'POST') {
            const seed = await readJsonRequest(request, 2 * 1024 * 1024);
            if (!Array.isArray(seed) || !seed.every(isMemoryPhoto)) {
              sendJson(response, 400, { error: 'Los recuerdos iniciales no tienen un formato válido.' });
              return;
            }
            try {
              await stat(memoriesFile);
            } catch (error) {
              if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
              try {
                await saveMemories(seed);
              } catch (saveError) {
                if (!(saveError instanceof Error && 'code' in saveError && saveError.code === 'EEXIST')) {
                  throw saveError;
                }
              }
            }
            sendJson(response, 200, await getSavedMemories());
            return;
          }

          if (pathname === '/api/recuerdos/fotos' && request.method === 'POST') {
            const requestUrl = new URL(request.url ?? '/', 'http://localhost');
            const originalName = requestUrl.searchParams.get('name') ?? '';
            const extension = path.extname(originalName).toLowerCase();
            const mimeByExtension: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
            };
            if (!mimeByExtension[extension] || request.headers['content-type'] !== mimeByExtension[extension]) {
              sendJson(response, 400, { error: 'Selecciona una imagen JPG, PNG, WEBP o GIF.' });
              return;
            }
            const savedExtension = extension === '.jpeg' ? '.jpg' : extension;
            const filename = `${randomUUID()}${savedExtension}`;
            const filepath = path.join(photosDirectory, filename);
            let bytesWritten = 0;
            const sizeLimit = new Transform({
              transform(chunk: Buffer, _encoding, callback) {
                bytesWritten += chunk.length;
                callback(
                  bytesWritten > maximumPhotoSize ? new Error('Cada foto debe pesar menos de 20 MB.') : null,
                  chunk,
                );
              },
            });
            try {
              await pipeline(request, sizeLimit, createWriteStream(filepath, { flags: 'wx' }));
            } catch (error) {
              await rm(filepath, { force: true });
              const message = error instanceof Error ? error.message : 'No se pudo guardar la foto.';
              sendJson(response, message.includes('20 MB') ? 413 : 400, { error: message });
              return;
            }
            sendJson(response, 201, { imageUrl: `/api/recuerdos/fotos/${filename}` });
            return;
          }

          if (pathname.startsWith('/api/recuerdos/fotos/')) {
            const filename = decodeURIComponent(pathname.slice('/api/recuerdos/fotos/'.length));
            if (!photoNamePattern.test(filename)) {
              sendJson(response, 400, { error: 'Nombre de foto no válido.' });
              return;
            }
            if (request.method !== 'GET' && request.method !== 'DELETE') {
              sendJson(response, 405, { error: 'Método no permitido.' });
              return;
            }
            const filepath = path.join(photosDirectory, filename);
            if (request.method === 'DELETE') {
              try {
                await rm(filepath);
              } catch {
                sendJson(response, 404, { error: 'No se encontró esta foto.' });
                return;
              }
              response.statusCode = 204;
              response.end();
              return;
            }
            let fileStats;
            try {
              fileStats = await stat(filepath);
            } catch {
              sendJson(response, 404, { error: 'No se encontró esta foto.' });
              return;
            }
            const extension = path.extname(filename).toLowerCase();
            const mimeByExtension: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
            };
            response.setHeader('Content-Type', mimeByExtension[extension]);
            response.setHeader('Content-Length', fileStats.size);
            response.setHeader('Cache-Control', 'public, max-age=3600');
            createReadStream(filepath).pipe(response);
            return;
          }

          if (pathname === '/api/recuerdos' && request.method === 'POST') {
            const body = await readJsonRequest(request, 64 * 1024);
            if (!isMemoryPhoto(body)) {
              sendJson(response, 400, { error: 'Completa los datos del recuerdo correctamente.' });
              return;
            }
            const memory: MemoryPhoto = { ...body, id: randomUUID() };
            const memories = await getSavedMemories();
            memories.unshift(memory);
            await saveMemories(memories);
            sendJson(response, 201, memory);
            return;
          }

          const match = /^\/api\/recuerdos\/([^/]+)(?:\/(me-gusta))?$/.exec(pathname);
          if (!match) {
            sendJson(response, 404, { error: 'No se encontró el recurso solicitado.' });
            return;
          }
          const id = decodeURIComponent(match[1]);
          const memories = await getSavedMemories();
          const memoryIndex = memories.findIndex((item) => item.id === id);
          if (memoryIndex === -1) {
            sendJson(response, 404, { error: 'No se encontró este recuerdo.' });
            return;
          }

          if (request.method === 'POST' && match[2] === 'me-gusta') {
            memories[memoryIndex] = { ...memories[memoryIndex], likes: memories[memoryIndex].likes + 1 };
            await saveMemories(memories);
            sendJson(response, 200, memories[memoryIndex]);
            return;
          }

          if (request.method === 'DELETE' && !match[2]) {
            const [deletedMemory] = memories.splice(memoryIndex, 1);
            if (deletedMemory.imageUrl.startsWith('/api/recuerdos/fotos/')) {
              const filename = path.basename(deletedMemory.imageUrl);
              if (photoNamePattern.test(filename)) await rm(path.join(photosDirectory, filename), { force: true });
            }
            await saveMemories(memories);
            response.statusCode = 204;
            response.end();
            return;
          }

          sendJson(response, 405, { error: 'Método no permitido.' });
        })().catch((error: unknown) => {
          if (response.headersSent) {
            response.destroy(error instanceof Error ? error : undefined);
            return;
          }
          const message = error instanceof Error ? error.message : 'Error inesperado al acceder a la galería.';
          sendJson(response, 500, { error: message });
        });
      });
    },
  };
}

export default defineConfig(async () => {
  await migrateLegacyStorage();
  return {
    plugins: [react(), tailwindcss(), musicApiPlugin(), memoriesApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              ignored: (file: string) => {
                const resolvedFile = path.resolve(file);
                return (
                  resolvedFile === projectDataDirectory ||
                  resolvedFile.startsWith(`${projectDataDirectory}${path.sep}`)
                );
              },
            },
    },
  };
});
