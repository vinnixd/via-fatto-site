import { useTenant } from '@/contexts/TenantContext';
import { useTenantSettings } from './useTenantSettings';

/**
 * Hook to get the current template configuration from tenant settings (site_config)
 * This allows rendering different layouts based on tenant's template choice
 */
export const useTemplate = () => {
  const { tenantId, isResolved } = useTenant();
  const { settings, isLoading } = useTenantSettings();
  
  // Get template_id from site_config (tenant_settings) or use default
  const templateId = settings?.template_id || 'default';
  
  return {
    templateId,
    tenantId,
    tenantName: settings?.seo_title?.split('|')[0]?.trim() || '',
    isResolved,
    isLoading,
    // Helper to check if specific template is active
    isTemplate: (id: string) => templateId === id,
  };
};

/**
 * Available template IDs
 * Add new templates here as they are created
 */
export const AVAILABLE_TEMPLATES = {
  default: 'Template Padrão',
  modern: 'Template Moderno',
  classic: 'Template Clássico',
  minimal: 'Template Minimalista',
} as const;

export type TemplateId = keyof typeof AVAILABLE_TEMPLATES;

export default useTemplate;
