import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const TENANT_STORAGE_KEY = 'active_tenant_id';

// Debug logging helper
function debugLog(message: string, data?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[SupabaseData] ${message}`, data ?? '');
  }
}

/**
 * Initialize tenant on app load - call once in App.tsx
 * Resolves tenant_id by hostname from database
 */
export async function initializeTenant(): Promise<string | null> {
  const hostname = window.location.hostname.toLowerCase();
  
  console.log('[initializeTenant] Resolvendo tenant para:', hostname);
  
  // Dev environments (lovable preview, localhost)
  const isDevEnvironment = hostname.includes('localhost') || 
    hostname.includes('lovable.app') || 
    hostname.includes('lovableproject.com');
  
  if (isDevEnvironment) {
    // In dev, use Via Fatto tenant (same as production viafatto.com.br)
    const devTenantId = 'f136543f-bace-4e46-9908-d7c8e7e0982f';
    localStorage.setItem(TENANT_STORAGE_KEY, devTenantId);
    console.log('[initializeTenant] Dev mode, usando tenant Via Fatto:', devTenantId);
    return devTenantId;
  }
  
  // Production: fetch tenant by domain
  const { data: domain, error } = await supabase
    .from('domains')
    .select('tenant_id')
    .eq('hostname', hostname)
    .eq('verified', true)
    .maybeSingle();
  
  if (error) {
    console.error('[initializeTenant] Erro ao buscar domínio:', error);
    return null;
  }
  
  if (!domain) {
    console.warn('[initializeTenant] Domínio não encontrado:', hostname);
    return null;
  }
  
  localStorage.setItem(TENANT_STORAGE_KEY, domain.tenant_id);
  console.log('[initializeTenant] Tenant resolvido:', domain.tenant_id);
  return domain.tenant_id;
}

/**
 * Hook to get current tenant ID (cached in localStorage)
 */
export function useTenantId() {
  return useQuery({
    queryKey: ['tenant-id'],
    queryFn: async () => {
      const stored = localStorage.getItem(TENANT_STORAGE_KEY);
      if (stored) return stored;
      return initializeTenant();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export interface PropertyFromDB {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  condo_fee: number | null;
  condo_exempt: boolean;
  iptu: number | null;
  status: 'venda' | 'aluguel' | 'vendido' | 'alugado';
  type: string;
  profile: string;
  condition: 'lancamento' | 'novo' | 'usado' | 'pronto_para_morar' | null;
  address_street: string | null;
  address_neighborhood: string | null;
  address_city: string;
  address_state: string;
  address_zipcode: string | null;
  address_lat: number | null;
  address_lng: number | null;
  location_type: 'exact' | 'approximate' | 'hidden';
  bedrooms: number;
  suites: number;
  bathrooms: number;
  garages: number;
  area: number;
  built_area: number | null;
  financing: boolean;
  documentation: string;
  featured: boolean;
  views: number;
  features: string[] | null;
  amenities: string[] | null;
  reference: string | null;
  category_id: string | null;
  order_index: number | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  images?: { id: string; url: string; alt: string; order_index: number }[];
}

export interface SiteConfig {
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
  about_title: string | null;
  about_text: string | null;
  about_image_url: string | null;
  about_image_position: 'top' | 'center' | 'bottom' | null;
  home_image_url: string | null;
  home_image_position: string | null;
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

export const useProperties = (options?: { featured?: boolean; limit?: number; status?: string }) => {
  const { data: tenantId } = useTenantId();
  
  const query = useQuery({
    queryKey: ['properties', tenantId, options],
    queryFn: async () => {
      debugLog('Fetching properties for tenant:', tenantId);
      
      if (!tenantId) {
        debugLog('No tenant ID - returning empty array');
        return [];
      }

      let query = supabase
        .from('properties')
        .select('*')
        .eq('active', true)
        .eq('tenant_id', tenantId)
        .order('order_index', { ascending: true });

      if (options?.featured) {
        query = query.eq('featured', true);
      }

      if (options?.status) {
        query = query.eq('status', options.status as 'venda' | 'aluguel' | 'vendido' | 'alugado');
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[SupabaseData] Error fetching properties:', error);
        throw error;
      }

      debugLog('Properties fetched:', data?.length ?? 0);

      // Fetch images for each property
      const propertiesWithImages = await Promise.all(
        (data || []).map(async (property) => {
          const { data: images } = await supabase
            .from('property_images')
            .select('*')
            .eq('property_id', property.id)
            .order('order_index');

          return { ...property, images: images || [] };
        })
      );

      return propertiesWithImages as PropertyFromDB[];
    },
    enabled: !!tenantId,
  });

  useEffect(() => {
    if (import.meta.env.DEV && query.data) {
      debugLog(`Properties loaded: ${query.data.length} items for tenant ${tenantId}`);
    }
  }, [query.data, tenantId]);

  return query;
};

export const useProperty = (slug: string) => {
  const { data: tenantId } = useTenantId();
  
  return useQuery({
    queryKey: ['property', slug, tenantId],
    queryFn: async () => {
      debugLog('Fetching property by slug:', slug);
      
      if (!tenantId) {
        debugLog('No tenant ID - skipping property fetch');
        return null;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('[SupabaseData] Error fetching property:', error);
        throw error;
      }
      if (!data) {
        debugLog('Property not found');
        return null;
      }

      debugLog('Property found:', data.title);

      const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', data.id)
        .order('order_index');

      return { ...data, images: images || [] } as PropertyFromDB;
    },
    enabled: !!slug && !!tenantId,
  });
};

export const useSiteConfig = () => {
  const { data: tenantId, isLoading: tenantLoading } = useTenantId();
  
  const query = useQuery({
    queryKey: ['site-config', tenantId],
    queryFn: async () => {
      debugLog('Fetching site config for tenant:', tenantId);
      
      if (!tenantId) {
        debugLog('No tenant ID - skipping site config fetch');
        return null;
      }

      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('[SupabaseData] Error fetching site config:', error);
        throw error;
      }
      
      debugLog('Site config loaded:', data ? 'success' : 'not found');
      
      if (import.meta.env.DEV && data) {
        console.log('[SupabaseData] Site config preview:', {
          logo: data.logo_url ? '✓' : '✗',
          primary_color: data.primary_color,
          phone: data.phone,
          whatsapp: data.whatsapp,
        });
      }
      
      return data as SiteConfig | null;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 30, // 30 seconds - more aggressive refresh
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 60, // Refetch every 60 seconds
  });

  useEffect(() => {
    if (import.meta.env.DEV && !tenantLoading && !query.isLoading && !query.data && tenantId) {
      console.warn('[SupabaseData] ⚠ No site_config found for tenant:', tenantId);
    }
  }, [query.data, query.isLoading, tenantId, tenantLoading]);

  return query;
};

export const useCategories = () => {
  const { data: tenantId } = useTenantId();
  
  return useQuery({
    queryKey: ['categories', tenantId],
    queryFn: async () => {
      debugLog('Fetching categories for tenant:', tenantId);
      
      if (!tenantId) {
        debugLog('No tenant ID - returning empty categories');
        return [];
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name');

      if (error) {
        console.error('[SupabaseData] Error fetching categories:', error);
        throw error;
      }
      
      debugLog('Categories fetched:', data?.length ?? 0);
      return data || [];
    },
    enabled: !!tenantId,
  });
};

export const useAvailableCities = () => {
  const { data: tenantId } = useTenantId();
  
  return useQuery({
    queryKey: ['available-cities', tenantId],
    queryFn: async () => {
      debugLog('Fetching available cities for tenant:', tenantId);
      
      if (!tenantId) {
        debugLog('No tenant ID - returning empty cities');
        return [];
      }

      const { data, error } = await supabase
        .from('properties')
        .select('address_city')
        .eq('active', true)
        .eq('tenant_id', tenantId)
        .not('address_city', 'is', null)
        .not('address_city', 'eq', '');

      if (error) {
        console.error('[SupabaseData] Error fetching cities:', error);
        throw error;
      }

      const uniqueCities = [...new Set(data?.map(p => p.address_city).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

      debugLog('Cities fetched:', uniqueCities.length);
      return uniqueCities;
    },
    enabled: !!tenantId,
  });
};

export const useSimilarProperties = (property: PropertyFromDB | null, limit: number = 4) => {
  const { data: tenantId } = useTenantId();
  
  return useQuery({
    queryKey: ['similar-properties', tenantId, property?.id, property?.address_city, property?.status, property?.type],
    queryFn: async () => {
      if (!property || !tenantId) return [];

      debugLog('Fetching similar properties for:', property.title);

      const existingIds = [property.id];
      let results: any[] = [];

      const { data: sameCityStatus } = await supabase
        .from('properties')
        .select('*')
        .eq('active', true)
        .eq('tenant_id', tenantId)
        .eq('address_city', property.address_city)
        .eq('status', property.status)
        .neq('id', property.id)
        .order('order_index', { ascending: true })
        .limit(limit);

      if (sameCityStatus) {
        results = [...sameCityStatus];
        existingIds.push(...sameCityStatus.map(p => p.id));
      }

      if (results.length < limit) {
        const { data: sameCityOther } = await supabase
          .from('properties')
          .select('*')
          .eq('active', true)
          .eq('tenant_id', tenantId)
          .eq('address_city', property.address_city)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .order('order_index', { ascending: true })
          .limit(limit - results.length);

        if (sameCityOther) {
          results = [...results, ...sameCityOther];
          existingIds.push(...sameCityOther.map(p => p.id));
        }
      }

      if (results.length < limit) {
        const { data: sameTypeStatus } = await supabase
          .from('properties')
          .select('*')
          .eq('active', true)
          .eq('tenant_id', tenantId)
          .eq('type', property.type as any)
          .eq('status', property.status)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .order('order_index', { ascending: true })
          .limit(limit - results.length);

        if (sameTypeStatus) {
          results = [...results, ...sameTypeStatus];
          existingIds.push(...sameTypeStatus.map(p => p.id));
        }
      }

      if (results.length < limit) {
        const { data: anyOther } = await supabase
          .from('properties')
          .select('*')
          .eq('active', true)
          .eq('tenant_id', tenantId)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .order('order_index', { ascending: true })
          .limit(limit - results.length);

        if (anyOther) {
          results = [...results, ...anyOther];
        }
      }

      debugLog('Similar properties found:', results.length);

      const propertiesWithImages = await Promise.all(
        results.map(async (p) => {
          const { data: images } = await supabase
            .from('property_images')
            .select('*')
            .eq('property_id', p.id)
            .order('order_index')
            .limit(1);

          return { ...p, images: images || [] };
        })
      );

      return propertiesWithImages as PropertyFromDB[];
    },
    enabled: !!property && !!tenantId,
  });
};
