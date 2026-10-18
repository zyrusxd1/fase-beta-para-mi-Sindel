# Beta deployment

This app uses Vite for local development and an Express server in production. The production API stores shared app data, gallery memories, uploaded photos, and MP3 metadata/files in Supabase.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/schema.sql`.
3. In Project Settings, copy the project URL and the `service_role` secret key.
4. Keep the service-role key on the server only. Never add it to a `VITE_*` variable or commit it.

## Render setup

1. Push a clean copy of the source to a GitHub repository. Keep `data/`, `.env`, and personal media out of that repository.
2. Create a Render Blueprint from that repository; Render reads `render.yaml`.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Render's environment settings.
4. Deploy. The Render health check is available at `/api/health`.

`VITE_ENABLE_SHARED_STATE=true` enables cloud synchronization when building the frontend. Shared app state includes settings, letters, reasons, milestones, bucket-list items, and secret notes. Gallery and music use their dedicated API endpoints.

## Beta access and data

The current beta API is intentionally unauthenticated, as selected for this test. Anyone who has the deployment URL can read the content, add or delete memories and songs, and modify shared app data. The storage buckets are public so uploaded images and audio can be played. Do not put sensitive or private material on this deployment unless you are comfortable with that access model.

The existing local `data/` directory is ignored by Git and is not copied to Supabase automatically. Import only files and content you have chosen and are authorized to publish. Do not upload commercial or otherwise unlicensed music.

Supabase's service-role key bypasses row-level security. It is used only by the Express server; the SQL migration enables RLS and creates no direct browser policies.
