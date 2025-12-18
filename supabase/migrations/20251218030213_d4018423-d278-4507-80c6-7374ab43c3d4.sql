-- Add SEO fields to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.seo_title IS 'SEO optimized title (max 60 chars)';
COMMENT ON COLUMN public.properties.seo_description IS 'SEO meta description (max 155 chars)';