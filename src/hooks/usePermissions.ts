import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'corretor' | 'user';

interface UserPermissions {
  role: AppRole;
  isAdmin: boolean;
  isCorretor: boolean;
  canAccessUsers: boolean;
  canManageProperties: boolean;
  canManagePortals: boolean;
  loading: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { isAdmin, isCorretor, loading } = useAuth();

  const role: AppRole = isAdmin ? 'admin' : isCorretor ? 'corretor' : 'user';

  return {
    role,
    isAdmin,
    isCorretor,
    canAccessUsers: isAdmin,
    canManageProperties: isAdmin || isCorretor,
    canManagePortals: isAdmin,
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
