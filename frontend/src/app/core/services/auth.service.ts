import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRole, ROLE_LABELS } from '../models/user.model';

const STORAGE_KEY = 'gep_user_role';
const TOKEN_KEY = 'gep_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private roleSubject = new BehaviorSubject<UserRole | null>(this.loadRole());
  role$ = this.roleSubject.asObservable();

  private loadRole(): UserRole | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['admin', 'caja', 'tv', 'logistica'].includes(stored)) {
      return stored as UserRole;
    }
    return null;
  }

  login(role: UserRole): void {
    localStorage.setItem(STORAGE_KEY, role);
    // Simulated JWT token
    localStorage.setItem(TOKEN_KEY, `mock-jwt-token-${role}-${Date.now()}`);
    this.roleSubject.next(role);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.roleSubject.next(null);
  }

  getRole(): UserRole | null {
    return this.roleSubject.value;
  }

  getRoleLabel(): string {
    const role = this.getRole();
    return role ? ROLE_LABELS[role] : '';
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.roleSubject.value !== null;
  }

  hasRole(roles: UserRole[]): boolean {
    const current = this.getRole();
    return current !== null && roles.includes(current);
  }
}
