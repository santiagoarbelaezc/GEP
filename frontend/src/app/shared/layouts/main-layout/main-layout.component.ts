import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    @if (role) {
      <div class="min-h-screen bg-zinc-50/50">
        <app-sidebar
          #sidebar
          [role]="role"
          (logoutClick)="onLogout()"
        />

        <!-- Main content -->
        <div class="lg:ml-64 min-h-screen">
          <!-- Top bar (mobile) -->
          <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 px-4 py-3 lg:px-8 lg:py-4 flex items-center justify-between">
            <!-- Mobile menu button -->
            <button
              class="lg:hidden p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors"
              (click)="sidebar.toggleMobile()"
            >
              <span class="material-symbols-outlined text-zinc-700">menu</span>
            </button>

            <div class="hidden lg:block">
              <h2 class="text-sm font-bold text-zinc-900">Panel de Control</h2>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                <span class="text-white text-xs font-bold">{{ roleInitial }}</span>
              </div>
            </div>
          </header>

          <!-- Page content -->
          <main class="p-4 lg:p-8">
            <router-outlet />
          </main>
        </div>
      </div>
    }
  `,
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('sidebar') sidebar!: SidebarComponent;

  role: UserRole | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.authService.role$.subscribe(r => {
      this.role = r;
    });
  }

  get roleInitial(): string {
    return this.role ? this.role.charAt(0).toUpperCase() : '?';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
