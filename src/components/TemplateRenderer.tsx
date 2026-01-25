import { useTemplate, type TemplateId } from '@/hooks/useTemplate';
import { ReactNode } from 'react';

interface TemplateRendererProps {
  templates: Partial<Record<TemplateId, ReactNode>>;
  fallback?: ReactNode;
}

/**
 * Component that renders different content based on the tenant's template configuration.
 * 
 * Usage:
 * ```tsx
 * <TemplateRenderer
 *   templates={{
 *     default: <DefaultHero />,
 *     modern: <ModernHero />,
 *     classic: <ClassicHero />,
 *   }}
 *   fallback={<DefaultHero />}
 * />
 * ```
 */
export const TemplateRenderer = ({ templates, fallback }: TemplateRendererProps) => {
  const { templateId } = useTemplate();
  
  // Get the template content for the current tenant's template
  const content = templates[templateId as TemplateId];
  
  // Return the matching template or fallback
  return <>{content || fallback || templates.default || null}</>;
};

/**
 * HOC to wrap a component with template-specific props
 */
export function withTemplate<P extends object>(
  WrappedComponent: React.ComponentType<P & { templateId: TemplateId }>
) {
  return function WithTemplateComponent(props: P) {
    const { templateId } = useTemplate();
    return <WrappedComponent {...props} templateId={templateId as TemplateId} />;
  };
}

export default TemplateRenderer;
