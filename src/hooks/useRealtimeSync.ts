import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para sincronização em tempo real do site_config
 * Invalida o cache do React Query quando há mudanças no banco
 */
export function useRealtimeSiteConfig(tenantId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    console.log('[Realtime] Subscribing to site_config changes for tenant:', tenantId);

    const channel = supabase
      .channel(`site_config_${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_config',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('[Realtime] site_config changed:', payload.eventType);
          // Invalidate and refetch site config
          queryClient.invalidateQueries({ queryKey: ['site-config', tenantId] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] site_config subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Unsubscribing from site_config');
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);
}

/**
 * Hook para sincronização em tempo real dos imóveis
 */
export function useRealtimeProperties(tenantId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    console.log('[Realtime] Subscribing to properties changes for tenant:', tenantId);

    const channel = supabase
      .channel(`properties_${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('[Realtime] properties changed:', payload.eventType);
          // Invalidate all property queries
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          queryClient.invalidateQueries({ queryKey: ['property'] });
          queryClient.invalidateQueries({ queryKey: ['similar-properties'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] properties subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Unsubscribing from properties');
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);
}

/**
 * Hook para sincronização em tempo real das imagens de imóveis
 */
export function useRealtimePropertyImages(tenantId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    console.log('[Realtime] Subscribing to property_images changes');

    const channel = supabase
      .channel(`property_images_${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_images',
        },
        (payload) => {
          console.log('[Realtime] property_images changed:', payload.eventType);
          // Invalidate property queries to refetch images
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          queryClient.invalidateQueries({ queryKey: ['property'] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] property_images subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Unsubscribing from property_images');
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);
}

/**
 * Hook combinado que habilita toda a sincronização em tempo real
 */
export function useRealtimeSync(tenantId: string | null) {
  useRealtimeSiteConfig(tenantId);
  useRealtimeProperties(tenantId);
  useRealtimePropertyImages(tenantId);
}
