import { useTenant } from '@/contexts/TenantContext';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, Building2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublicTenantGateProps {
  children: React.ReactNode;
}

/**
 * Gate component for public site that shows appropriate screens based on tenant resolution
 * - Loading: Shows spinner while resolving
 * - Error: Shows appropriate error page based on error type
 * - Success: Renders children with tenant context
 */
export const PublicTenantGate = ({ children }: PublicTenantGateProps) => {
  const { loading, error, isResolved } = useTenant();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Clear tenant from localStorage and refetch
    localStorage.removeItem('public_tenant_id');
    queryClient.invalidateQueries({ queryKey: ['tenant-id'] });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando site...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error && !isResolved) {
    const errorMessage = error?.message || 'RESOLUTION_ERROR';
    return <ErrorScreen error={errorMessage} onRetry={handleRetry} />;
  }

  // No tenant resolved (not an error, just empty)
  if (!isResolved && !loading) {
    return <ErrorScreen error="NO_TENANT_AVAILABLE" onRetry={handleRetry} />;
  }

  // All good - render children
  return <>{children}</>;
};

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

const ErrorScreen = ({ error, onRetry }: ErrorScreenProps) => {
  const getErrorContent = () => {
    switch (error) {
      case 'DOMAIN_NOT_FOUND':
        return {
          icon: Globe,
          title: 'Site não configurado',
          description: 'Este domínio não está configurado para nenhum site.',
          details: 'Se você é o proprietário deste domínio, configure-o no painel administrativo.',
          showRetry: true,
        };
      
      case 'DOMAIN_NOT_PUBLIC':
        return {
          icon: Building2,
          title: 'Acesso restrito',
          description: 'Este domínio está configurado para uso administrativo.',
          details: 'Acesse o site público pelo domínio principal do cliente.',
          showRetry: false,
        };
      
      case 'DOMAIN_NOT_VERIFIED':
        return {
          icon: AlertCircle,
          title: 'Domínio não verificado',
          description: 'Este domínio ainda não foi verificado.',
          details: 'O proprietário precisa concluir a verificação DNS no painel administrativo.',
          showRetry: true,
        };
      
      case 'TENANT_NOT_FOUND':
        return {
          icon: Building2,
          title: 'Conta não encontrada',
          description: 'A conta associada a este domínio não foi encontrada.',
          details: 'Entre em contato com o suporte se o problema persistir.',
          showRetry: true,
        };
      
      case 'TENANT_INACTIVE':
        return {
          icon: AlertCircle,
          title: 'Site temporariamente indisponível',
          description: 'Este site está temporariamente indisponível.',
          details: 'Entre em contato com o proprietário para mais informações.',
          showRetry: true,
        };
      
      case 'NO_TENANT_AVAILABLE':
        return {
          icon: Building2,
          title: 'Nenhum site disponível',
          description: 'Não há sites ativos cadastrados no sistema.',
          details: 'Este é um ambiente de desenvolvimento.',
          showRetry: true,
        };
      
      default:
        return {
          icon: AlertCircle,
          title: 'Erro ao carregar',
          description: 'Ocorreu um erro ao carregar o site.',
          details: 'Tente novamente em alguns instantes.',
          showRetry: true,
        };
    }
  };

  const content = getErrorContent();
  const IconComponent = content.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card rounded-2xl shadow-xl p-8 border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <IconComponent className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {content.title}
          </h1>
          
          <p className="text-muted-foreground mb-4">
            {content.description}
          </p>
          
          <p className="text-sm text-muted-foreground/70 mb-6">
            {content.details}
          </p>
          
          {content.showRetry && (
            <Button onClick={onRetry} variant="outline">
              Tentar novamente
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          Domínio: {window.location.hostname}
        </p>
      </div>
    </div>
  );
};

export default PublicTenantGate;
