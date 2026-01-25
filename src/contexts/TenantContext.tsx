import { createContext, useContext } from 'react';
import { useTenantId } from '@/hooks/useSupabaseData';

interface TenantContextType {
  tenantId: string | null;
  loading: boolean;
  error: Error | null;
  isResolved: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
}

/**
 * TenantProvider - Simplified wrapper that uses useTenantId hook
 * Maintains backward compatibility with existing components
 */
export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { data: tenantId, isLoading, error } = useTenantId();

  return (
    <TenantContext.Provider
      value={{
        tenantId: tenantId ?? null,
        loading: isLoading,
        error: error as Error | null,
        isResolved: !!tenantId,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
