import { useTenantId } from './useSupabaseData';

export interface TenantSettings {
  id: string;
  tenant_id: string | null;
  template_id: string | null;
  logo_url: string | null;
  logo_horizontal_url: string | null;
  logo_vertical_url: string | null;
  logo_symbol_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_background_url: string | null;
  home_image_url: string | null;
  home_image_position: string | null;
  about_title: string | null;
  about_text: string | null;
  about_image_url: string | null;
  about_image_position: string | null;
  footer_text: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image_url: string | null;
  gtm_container_id: string | null;
  facebook_pixel_id: string | null;
  google_analytics_id: string | null;
  watermark_url: string | null;
  watermark_enabled: boolean | null;
  watermark_opacity: number | null;
  watermark_size: number | null;
}

import { useSiteConfig } from './useSupabaseData';

/**
 * Hook to fetch and use tenant settings (site_config) from the database.
 * Automatically filters by tenant_id resolved from hostname/localStorage.
 * Settings are used for branding, colors, SEO, and contact info.
 */
export function useTenantSettings() {
  const { data, isLoading, error, refetch } = useSiteConfig();

  return {
    settings: data as TenantSettings | null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get company name from tenant settings, with fallback
 */
export function useCompanyName(): string {
  const { settings } = useTenantSettings();
  
  // Priority: SEO title (usually company name) > fallback
  return settings?.seo_title?.split('|')[0]?.trim() || 'Imobiliária';
}

/**
 * Get contact information from tenant settings
 */
export function useContactInfo() {
  const { settings } = useTenantSettings();
  
  return {
    phone: settings?.phone || null,
    whatsapp: settings?.whatsapp || null,
    email: settings?.email || null,
    address: settings?.address || null,
    social: {
      facebook: settings?.social_facebook || null,
      instagram: settings?.social_instagram || null,
      youtube: settings?.social_youtube || null,
      linkedin: settings?.social_linkedin || null,
    },
  };
}
