import { useEffect } from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

// Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  if (!hex) return null;
  
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Darken a color by reducing lightness
function darkenHSL(hsl: { h: number; s: number; l: number }, amount: number) {
  return {
    h: hsl.h,
    s: hsl.s,
    l: Math.max(0, hsl.l - amount),
  };
}

// Lighten a color by increasing lightness
function lightenHSL(hsl: { h: number; s: number; l: number }, amount: number) {
  return {
    h: hsl.h,
    s: Math.max(0, hsl.s - 40), // Reduce saturation for muted version
    l: Math.min(100, hsl.l + amount),
  };
}

// Debug logging helper
function debugLog(message: string, data?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[BrandColors] ${message}`, data ?? '');
  }
}

/**
 * Hook that applies tenant brand colors dynamically as CSS variables.
 * Reads colors from tenant settings (site_config) and applies them to :root.
 */
export function useBrandColors() {
  const { settings, isLoading } = useTenantSettings();

  useEffect(() => {
    if (isLoading) {
      debugLog('Waiting for settings to load...');
      return;
    }

    if (!settings) {
      debugLog('No settings available, using default colors');
      return;
    }

    const root = document.documentElement;

    debugLog('Applying brand colors:', {
      primary: settings.primary_color,
      secondary: settings.secondary_color,
      accent: settings.accent_color,
    });

    // Apply primary color
    if (settings.primary_color) {
      const primaryHSL = hexToHSL(settings.primary_color);
      if (primaryHSL) {
        const hslValue = `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`;
        root.style.setProperty('--primary', hslValue);
        root.style.setProperty('--ring', hslValue);
        root.style.setProperty('--success', hslValue);
        
        // Primary hover (slightly darker)
        const hoverHSL = darkenHSL(primaryHSL, 5);
        root.style.setProperty('--primary-hover', `${hoverHSL.h} ${hoverHSL.s}% ${hoverHSL.l}%`);
        
        // Primary muted (very light version)
        const mutedHSL = lightenHSL(primaryHSL, 55);
        root.style.setProperty('--primary-muted', `${mutedHSL.h} ${mutedHSL.s}% ${mutedHSL.l}%`);
        
        // Accent (use primary for accent too)
        root.style.setProperty('--accent', `${mutedHSL.h} ${mutedHSL.s}% ${mutedHSL.l}%`);
        root.style.setProperty('--accent-foreground', hslValue);
        
        // Gradient
        const gradientLightHSL = { ...primaryHSL, l: Math.min(100, primaryHSL.l + 6) };
        root.style.setProperty(
          '--gradient-primary',
          `linear-gradient(135deg, hsl(${hslValue}), hsl(${gradientLightHSL.h} ${gradientLightHSL.s}% ${gradientLightHSL.l}%))`
        );

        debugLog('Primary color applied:', settings.primary_color);
      }
    }

    // Apply secondary color
    if (settings.secondary_color) {
      const secondaryHSL = hexToHSL(settings.secondary_color);
      if (secondaryHSL) {
        const hslValue = `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`;
        root.style.setProperty('--secondary', hslValue);
        debugLog('Secondary color applied:', settings.secondary_color);
      }
    }

    // Apply accent color (if different from primary)
    if (settings.accent_color) {
      const accentHSL = hexToHSL(settings.accent_color);
      if (accentHSL) {
        // Optional: use for specific accent elements
        debugLog('Accent color available:', settings.accent_color);
      }
    }

  }, [settings, isLoading]);
}

export { hexToHSL, darkenHSL, lightenHSL };
