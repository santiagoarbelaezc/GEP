import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white flex items-center justify-center p-4">
      <div class="w-full max-w-lg animate-fade-in">
        <!-- Logo -->
        <div class="text-center mb-10">
          <div class="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span class="text-white text-xl font-extrabold tracking-tight">G</span>
          </div>
          <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight">GEP</h1>
          <p class="text-sm text-zinc-400 mt-1.5 font-medium">Gestión de Pedidos</p>
        </div>

        <!-- Role subtitle -->
        <p class="micro-label text-center mb-5">Selecciona tu rol para continuar</p>

        <!-- Role cards -->
        <div class="grid grid-cols-2 gap-3 animate-stagger">
          @for (option of roleOptions; track option.role) {
            <button
              (click)="selectRole(option.role)"
              class="card p-5 text-left cursor-pointer hover:border-zinc-400 hover:shadow-md transition-all duration-200 group active:scale-[0.98]"
              [id]="'role-' + option.role"
            >
              <div class="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all duration-200">
                <span class="material-symbols-outlined text-xl text-zinc-600 group-hover:text-white transition-colors">{{ option.icon }}</span>
              </div>
              <p class="text-sm font-bold text-zinc-900 mb-0.5">{{ option.label }}</p>
              <p class="text-xs text-zinc-400 leading-relaxed">{{ option.description }}</p>
            </button>
          }
        </div>

        <!-- Tracking link -->
        <div class="text-center mt-8">
          <p class="text-xs text-zinc-400">
            ¿Eres cliente?
            <a routerLink="/tracking" class="text-zinc-900 font-semibold hover:underline underline-offset-2 ml-1 cursor-pointer" (click)="goToTracking()">
              Rastrear mi pedido →
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  roleOptions: RoleOption[] = [
    {
      role: 'admin',
      label: 'Administrador',
      description: 'Dashboard completo, gestión de pedidos y estadísticas',
      icon: 'shield_person',
    },
    {
      role: 'caja',
      label: 'Caja',
      description: 'Verificación de pagos y comprobantes',
      icon: 'point_of_sale',
    },
    {
      role: 'tv',
      label: 'Pantalla TV',
      description: 'Visualización de pedidos nuevos en tiempo real',
      icon: 'tv',
    },
    {
      role: 'logistica',
      label: 'Logística',
      description: 'Gestión de entregas y despacho de pedidos',
      icon: 'local_shipping',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: UserRole): void {
    this.authService.login(role);
    const routes: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      caja: '/caja',
      tv: '/tv',
      logistica: '/logistica',
    };
    this.router.navigate([routes[role]]);
  }

  goToTracking(): void {
    this.router.navigate(['/tracking']);
  }
}
