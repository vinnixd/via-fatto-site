import { useEffect } from 'react';
import { useTenantSettings } from './useTenantSettings';

/**
 * Hook that dynamically updates the favicon based on tenant settings.
 * Reads favicon_url from site_config (tenant settings).
 */
export const useFavicon = () => {
  const { settings, isLoading } = useTenantSettings();

  useEffect(() => {
    if (isLoading) return;
    
    if (settings?.favicon_url) {
      // Update or create favicon link
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.favicon_url;
      favicon.type = 'image/png';

      // Also update apple-touch-icon if exists
      let appleFavicon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleFavicon) {
        appleFavicon = document.createElement('link');
        appleFavicon.rel = 'apple-touch-icon';
        document.head.appendChild(appleFavicon);
      }
      appleFavicon.href = settings.favicon_url;

      if (import.meta.env.DEV) {
        console.log('[Favicon] Updated to:', settings.favicon_url);
      }
    }
  }, [settings?.favicon_url, isLoading]);
};
