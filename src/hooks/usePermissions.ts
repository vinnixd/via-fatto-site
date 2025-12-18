import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'gestor' | 'marketing' | 'corretor' | 'user';

interface UserPermissions {
  role: AppRole;
  isAdmin: boolean;
  isGestor: boolean;
  isCorretor: boolean;
  canAccessUsers: boolean;
  canManageProperties: boolean;
  canManagePortals: boolean;
  loading: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { isAdmin, isGestor, isCorretor, loading } = useAuth();

  const role: AppRole = isAdmin ? 'admin' : isGestor ? 'gestor' : isCorretor ? 'corretor' : 'user';

  return {
    role,
    isAdmin,
    isGestor,
    isCorretor,
    canAccessUsers: isAdmin,
    canManageProperties: isAdmin || isGestor || isCorretor,
    canManagePortals: isAdmin || isGestor,
    loading,
  };
};

// Helper function to check if user can access a menu item
export const canAccessMenu = (menuKey: string, role: AppRole, isAdmin: boolean): boolean => {
  const adminOnlyMenus = ['usuarios'];
  
  if (adminOnlyMenus.includes(menuKey)) {
    return isAdmin || role === 'admin';
  }
  
  return true;
};
