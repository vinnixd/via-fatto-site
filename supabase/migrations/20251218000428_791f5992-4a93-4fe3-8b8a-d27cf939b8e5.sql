-- Add new logo fields to site_config
ALTER TABLE public.site_config
ADD COLUMN IF NOT EXISTS logo_horizontal_url TEXT,
ADD COLUMN IF NOT EXISTS logo_vertical_url TEXT,
ADD COLUMN IF NOT EXISTS logo_symbol_url TEXT;