import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings?: Record<string, unknown>;
}

export interface Domain {
  id: string;
  tenant_id: string;
  hostname: string;
  type: 'public' | 'admin';
  is_primary: boolean;
  verified: boolean;
  verify_token?: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
  domain: Domain | null;
  isResolved: boolean;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANT_STORAGE_KEY = 'public_tenant_id';

/**
 * Resolve tenant by hostname from domains table
 * For public sites, we look for type='public' and verified=true
 */
async function resolveTenantByHostname(hostname: string): Promise<{
  tenant: Tenant | null;
  domain: Domain | null;
  error: string | null;
}> {
  try {
    // Query domains table for this hostname with type='public' and verified=true
    const { data: domainData, error: domainError } = await (supabase as any)
      .from('domains')
      .select('*')
      .eq('hostname', hostname.toLowerCase())
      .eq('type', 'public')
      .eq('verified', true)
      .maybeSingle();

    if (domainError) {
      console.error('Error querying domains:', domainError);
      if (domainError.code === 'PGRST204' || domainError.message?.includes('relation')) {
        return { tenant: null, domain: null, error: 'DOMAIN_NOT_FOUND' };
      }
    }

    if (!domainData) {
      // Check if domain exists but with wrong type or unverified
      const { data: anyDomain } = await (supabase as any)
        .from('domains')
        .select('*')
        .eq('hostname', hostname.toLowerCase())
        .maybeSingle();

      if (!anyDomain) {
        return { 
          tenant: null, 
          domain: null, 
          error: 'DOMAIN_NOT_FOUND' 
        };
      }

      // Domain exists but not public type
      if (anyDomain.type !== 'public') {
        return {
          tenant: null,
          domain: anyDomain as Domain,
          error: 'DOMAIN_NOT_PUBLIC'
        };
      }

      // Domain exists but not verified
      if (!anyDomain.verified) {
        return {
          tenant: null,
          domain: anyDomain as Domain,
          error: 'DOMAIN_NOT_VERIFIED'
        };
      }
    }

    const domain = domainData as Domain;

    // Fetch tenant details
    const { data: tenantData, error: tenantError } = await (supabase as any)
      .from('tenants')
      .select('*')
      .eq('id', domain.tenant_id)
      .single();

    if (tenantError || !tenantData) {
      return {
        tenant: null,
        domain,
        error: 'TENANT_NOT_FOUND'
      };
    }

    // Check tenant status
    if (tenantData.status !== 'active') {
      return {
        tenant: tenantData as Tenant,
        domain,
        error: 'TENANT_INACTIVE'
      };
    }

    return {
      tenant: tenantData as Tenant,
      domain,
      error: null
    };
  } catch (err) {
    console.error('Error resolving tenant:', err);
    return {
      tenant: null,
      domain: null,
      error: 'RESOLUTION_ERROR'
    };
  }
}

interface TenantProviderProps {
  children: React.ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const resolveTenant = useCallback(async () => {
    setLoading(true);
    setError(null);

    const hostname = window.location.hostname.toLowerCase();
    
    // Skip resolution for localhost and lovable dev environments (use stored tenant or default)
    const isDevEnvironment = hostname.includes('localhost') || 
      hostname.includes('lovable.app') || 
      hostname.includes('lovableproject.com');
    
    if (isDevEnvironment) {
      // In dev, try to get stored tenant or use default
      const storedTenantId = localStorage.getItem(TENANT_STORAGE_KEY);
      
      if (storedTenantId) {
        const { data: tenantData } = await (supabase as any)
          .from('tenants')
          .select('*')
          .eq('id', storedTenantId)
          .maybeSingle();

        if (tenantData) {
          setTenant(tenantData as Tenant);
          setIsResolved(true);
          setLoading(false);
          return;
        }
      }

      // Get first available active tenant for dev
      const { data: firstTenant } = await (supabase as any)
        .from('tenants')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (firstTenant) {
        setTenant(firstTenant as Tenant);
        localStorage.setItem(TENANT_STORAGE_KEY, firstTenant.id);
        setIsResolved(true);
      } else {
        setError('NO_TENANT_AVAILABLE');
      }
      
      setLoading(false);
      return;
    }

    // Production: resolve by hostname for PUBLIC domains only
    const result = await resolveTenantByHostname(hostname);
    
    setTenant(result.tenant);
    setDomain(result.domain);
    setError(result.error);
    setIsResolved(result.tenant !== null);

    if (result.tenant) {
      localStorage.setItem(TENANT_STORAGE_KEY, result.tenant.id);
    }

    setLoading(false);
  }, []);

  // Resolve tenant on mount
  useEffect(() => {
    resolveTenant();
  }, [resolveTenant]);

  const refreshTenant = useCallback(async () => {
    await resolveTenant();
  }, [resolveTenant]);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenantId: tenant?.id ?? null,
        loading,
        error,
        domain,
        isResolved,
        refreshTenant,
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

export { resolveTenantByHostname };
