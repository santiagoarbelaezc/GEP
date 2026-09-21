import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserRole, MenuItem, ROLE_LABELS, ROLE_MENUS } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile overlay -->
    @if (mobileOpen) {
      <div
        class="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
        (click)="mobileOpen = false"
      ></div>
    }

    <aside
      class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-zinc-200/80 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0"
      [class.translate-x-0]="mobileOpen"
      [class.-translate-x-full]="!mobileOpen"
    >
      <!-- Logo -->
      <div class="px-6 py-6 border-b border-zinc-100">
        <div class="flex items-center gap-3">
          <img src="/favicon.svg" alt="GEP Logo" class="w-9 h-9 rounded-xl shadow-xs shrink-0" />
          <div>
            <h1 class="text-base font-extrabold text-zinc-900 tracking-tight">GEP</h1>
            <p class="text-[10px] text-zinc-400 uppercase tracking-[0.18em] font-semibold">Order Management</p>
          </div>
        </div>
      </div>

      <!-- Role badge -->
      <div class="px-6 py-4">
        <span class="inline-flex items-center px-3 py-1.5 bg-zinc-100 rounded-full text-xs font-semibold text-zinc-600 tracking-wide">
          <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
          {{ roleLabel }}
        </span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-3 overflow-y-auto">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-zinc-900 text-white shadow-sm"
            [routerLinkActiveOptions]="{ exact: item.route === '/caja' || item.route === '/admin' }"
            (click)="mobileOpen = false"
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200 mb-1"
          >
            <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Logout -->
      <div class="px-3 py-4 border-t border-zinc-100">
        <button
          (click)="logoutClick.emit()"
          class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input({ required: true }) role!: UserRole;
  @Output() logoutClick = new EventEmitter<void>();

  mobileOpen = false;

  get roleLabel(): string {
    return ROLE_LABELS[this.role];
  }

  get menuItems(): MenuItem[] {
    return ROLE_MENUS[this.role];
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }
}
