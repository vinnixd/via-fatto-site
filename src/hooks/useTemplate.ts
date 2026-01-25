import { useTenant } from '@/contexts/TenantContext';

/**
 * Hook to get the current template configuration from tenant settings
 * This allows rendering different layouts based on tenant's template choice
 */
export const useTemplate = () => {
  const { tenant, tenantId, isResolved } = useTenant();
  
  // Get template_id from tenant settings or use default
  const templateId = (tenant?.settings as any)?.template_id || 'default';
  
  return {
    templateId,
    tenantId,
    tenantName: tenant?.name || '',
    isResolved,
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
