-- Add integration columns to site_config
ALTER TABLE public.site_config
ADD COLUMN IF NOT EXISTS gtm_container_id text DEFAULT '',
ADD COLUMN IF NOT EXISTS facebook_pixel_id text DEFAULT '',
ADD COLUMN IF NOT EXISTS google_analytics_id text DEFAULT '';