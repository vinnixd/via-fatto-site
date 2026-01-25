import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useEffect } from 'react';

export interface TenantSettings {
  id: string;
  tenant_id: string | null;
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

// Debug logging helper
function debugLog(message: string, data?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[TenantSettings] ${message}`, data ?? '');
  }
}

/**
 * Hook to fetch and use tenant settings (site_config) from the database.
 * Automatically filters by tenant_id from TenantContext.
 * Settings are used for branding, colors, SEO, and contact info.
 */
export function useTenantSettings() {
  const { tenantId, isResolved } = useTenant();

  const query = useQuery({
    queryKey: ['tenant-settings', tenantId],
    queryFn: async () => {
      debugLog('Fetching tenant settings for tenant:', tenantId);
      
      if (!tenantId) {
        debugLog('No tenant ID available, skipping fetch');
        return null;
      }

      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('[TenantSettings] Error fetching settings:', error);
        throw error;
      }

      debugLog('Tenant settings loaded:', data ? 'success' : 'not found');
      
      if (data) {
        debugLog('Settings preview:', {
          logo_url: data.logo_url ? '✓' : '✗',
          primary_color: data.primary_color,
          whatsapp: data.whatsapp ? '✓' : '✗',
          seo_title: data.seo_title ? '✓' : '✗',
        });
      }

      return data as TenantSettings | null;
    },
    enabled: isResolved && !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Debug logging when settings change
  useEffect(() => {
    if (import.meta.env.DEV && isResolved) {
      if (query.data) {
        console.log('[TenantSettings] ✓ Settings loaded for tenant:', tenantId);
      } else if (!query.isLoading && !query.data) {
        console.warn('[TenantSettings] ⚠ No settings found for tenant:', tenantId);
        console.warn('[TenantSettings] Make sure site_config has a row with tenant_id:', tenantId);
      }
    }
  }, [query.data, query.isLoading, tenantId, isResolved]);

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Get company name from tenant settings, with fallback
 */
export function useCompanyName(): string {
  const { settings } = useTenantSettings();
  const { tenant } = useTenant();
  
  // Priority: SEO title (usually company name) > tenant name > fallback
  return settings?.seo_title?.split('|')[0]?.trim() || tenant?.name || 'Imobiliária';
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
