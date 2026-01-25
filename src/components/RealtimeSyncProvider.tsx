import { ReactNode } from 'react';
import { useTenantId } from '@/hooks/useSupabaseData';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface RealtimeSyncProviderProps {
  children: ReactNode;
}

/**
 * Provider que habilita sincronização em tempo real para todo o app
 * Deve envolver o conteúdo principal após o QueryClientProvider
 */
export function RealtimeSyncProvider({ children }: RealtimeSyncProviderProps) {
  const { data: tenantId } = useTenantId();
  
  // Habilita sincronização realtime para o tenant atual
  useRealtimeSync(tenantId ?? null);

  return <>{children}</>;
}
