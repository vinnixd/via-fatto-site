-- Add template_id to site_config (tenant_settings)
ALTER TABLE public.site_config
ADD COLUMN IF NOT EXISTS template_id text DEFAULT 'default';

-- Add comment for documentation
COMMENT ON COLUMN public.site_config.template_id IS 'ID do template de layout a ser usado no site público';

-- Ensure RLS is enabled and policies are correct
-- site_config should be publicly readable (for public site) and admin-manageable

-- Drop existing policies to recreate with correct permissions
DROP POLICY IF EXISTS "Site config is publicly readable" ON public.site_config;
DROP POLICY IF EXISTS "Admins can manage site config" ON public.site_config;

-- Public can read site_config for their tenant (anonymous access for public site)
CREATE POLICY "Public can read site config"
ON public.site_config
FOR SELECT
USING (true);

-- Tenant admins can manage their own site config
CREATE POLICY "Tenant admins can manage site config"
ON public.site_config
FOR ALL
USING (
  is_tenant_admin(tenant_id) OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  is_tenant_admin(tenant_id) OR has_role(auth.uid(), 'admin'::app_role)
);