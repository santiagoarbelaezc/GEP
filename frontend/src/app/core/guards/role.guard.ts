import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (!authService.hasRole(allowedRoles)) {
      // Redirect to the user's own role home
      const role = authService.getRole();
      if (role) {
        const roleRoutes: Record<UserRole, string> = {
          admin: '/admin/dashboard',
          caja: '/caja',
          tv: '/tv',
          logistica: '/logistica',
        };
        router.navigate([roleRoutes[role]]);
      } else {
        router.navigate(['/login']);
      }
      return false;
    }

    return true;
  };
}
