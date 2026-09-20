import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLog, UserSession, AUDIT_ACTION_LABELS, AUDIT_ACTION_ICONS, AuditAction } from '../../../core/models/audit.model';
import { UserRole, ROLE_LABELS } from '../../../core/models/user.model';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-6">
        <h1 class="page-title">Auditoría</h1>
        <p class="text-sm text-zinc-400 mt-1">Registro completo de actividad del sistema</p>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-stagger">
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-zinc-600">timeline</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ todayCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Acciones Hoy</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-emerald-600">group</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ activeSessions.length }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Usuarios Activos</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-amber-600">point_of_sale</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ cajaCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Acciones de Caja</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-white">local_shipping</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ logisticaCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Acciones Logística</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Activity Timeline -->
        <div class="lg:col-span-2">
          <!-- Filters -->
          <div class="card p-4 mb-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select class="select-premium" [(ngModel)]="roleFilter" (change)="applyFilters()" id="audit-role-filter">
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="caja">Caja</option>
                <option value="logistica">Logística</option>
              </select>
              <select class="select-premium" [(ngModel)]="actionFilter" (change)="applyFilters()" id="audit-action-filter">
                <option value="">Todas las acciones</option>
                @for (action of actionOptions; track action.value) {
                  <option [value]="action.value">{{ action.label }}</option>
                }
              </select>
              <select class="select-premium" [(ngModel)]="entityFilter" (change)="applyFilters()" id="audit-entity-filter">
                <option value="">Todas las entidades</option>
                <option value="pedido">Pedidos</option>
                <option value="pago">Pagos</option>
                <option value="cliente">Clientes</option>
                <option value="sistema">Sistema</option>
                <option value="factura">Facturas</option>
              </select>
            </div>
          </div>

          <!-- Activity list -->
          <div class="card p-6">
            <p class="micro-label mb-5">Actividad Reciente</p>
            <div class="relative">
              @for (log of filteredLogs; track log.id; let last = $last) {
                <div class="flex gap-4 pb-5" [class.pb-0]="last">
                  <div class="flex flex-col items-center">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      [class]="getRoleColor(log.rol)"
                    >
                      <span class="material-symbols-outlined text-sm">{{ getActionIcon(log.accion) }}</span>
                    </div>
                    @if (!last) {
                      <div class="w-px flex-1 bg-zinc-200 mt-1"></div>
                    }
                  </div>
                  <div class="flex-1 -mt-0.5">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-sm text-zinc-900">
                          <span class="font-bold">{{ log.usuarioNombre }}</span>
                          <span class="inline-flex items-center px-1.5 py-0.5 ml-1 bg-zinc-100 rounded text-[10px] font-semibold text-zinc-500 uppercase">{{ getRoleLabel(log.rol) }}</span>
                        </p>
                        <p class="text-sm text-zinc-600 mt-0.5">{{ log.detalle }}</p>
                        @if (log.entidadRef) {
                          <span class="inline-flex items-center px-2 py-0.5 mt-1 bg-zinc-50 rounded-lg text-xs font-mono text-zinc-500">{{ log.entidadRef }}</span>
                        }
                      </div>
                      <span class="text-xs text-zinc-400 whitespace-nowrap">{{ getTimeAgo(log.timestamp) }}</span>
                    </div>
                  </div>
                </div>
              }

              @if (filteredLogs.length === 0) {
                <div class="text-center py-8">
                  <span class="material-symbols-outlined text-3xl text-zinc-200 mb-2">search_off</span>
                  <p class="text-sm text-zinc-400">No hay actividad con estos filtros</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right: Sessions & Summary -->
        <div class="space-y-6">
          <!-- Active sessions -->
          <div class="card p-6">
            <p class="micro-label mb-4">Sesiones Activas</p>
            <div class="space-y-3">
              @for (session of activeSessions; track session.id) {
                <div class="flex items-center gap-3 p-3 rounded-xl" [class]="session.activo ? 'bg-emerald-50' : 'bg-zinc-50'">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    [class]="session.activo ? 'bg-emerald-500 text-white' : 'bg-zinc-300 text-white'"
                  >
                    <span class="text-xs font-bold">{{ session.usuarioNombre.charAt(0) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-zinc-900 truncate">{{ session.usuarioNombre }}</p>
                    <p class="text-xs text-zinc-400">{{ getRoleLabel(session.rol) }} · {{ session.accionesRealizadas }} acciones</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    @if (session.activo) {
                      <span class="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        En línea
                      </span>
                    } @else {
                      <span class="text-xs text-zinc-400">Desconectado</span>
                    }
                    <p class="text-[10px] text-zinc-400 mt-0.5">Desde {{ session.loginAt | date:'HH:mm' }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Operator summary -->
          <div class="card p-6">
            <p class="micro-label mb-4">Resumen por Operador</p>
            <div class="space-y-3">
              @for (summary of operatorSummaries; track summary.name) {
                <div class="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <div>
                    <p class="text-sm font-semibold text-zinc-900">{{ summary.name }}</p>
                    <p class="text-xs text-zinc-400">{{ summary.role }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-extrabold text-zinc-900">{{ summary.actions }}</p>
                    <p class="text-[10px] text-zinc-400">acciones hoy</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuditLogComponent implements OnInit {
  allLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  activeSessions: UserSession[] = [];

  roleFilter = '';
  actionFilter = '';
  entityFilter = '';

  todayCount = 0;
  cajaCount = 0;
  logisticaCount = 0;

  actionOptions = Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label }));

  operatorSummaries: { name: string; role: string; actions: number }[] = [];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.auditService.getLogs().subscribe(logs => {
      this.allLogs = logs;
      this.filteredLogs = logs;

      // Calculate summaries
      const byUser = new Map<string, { role: string; count: number }>();
      logs.forEach(l => {
        const existing = byUser.get(l.usuarioNombre);
        if (existing) {
          existing.count++;
        } else {
          byUser.set(l.usuarioNombre, { role: ROLE_LABELS[l.rol], count: 1 });
        }
      });
      this.operatorSummaries = Array.from(byUser.entries()).map(([name, data]) => ({
        name, role: data.role, actions: data.count,
      })).sort((a, b) => b.actions - a.actions);
    });

    this.auditService.getUserSessions().subscribe(sessions => {
      this.activeSessions = sessions;
    });

    this.auditService.getTodayActionCount().subscribe(c => this.todayCount = c);
    this.auditService.getActionCountByRole('caja').subscribe(c => this.cajaCount = c);
    this.auditService.getActionCountByRole('logistica').subscribe(c => this.logisticaCount = c);
  }

  applyFilters(): void {
    let result = [...this.allLogs];
    if (this.roleFilter) result = result.filter(l => l.rol === this.roleFilter);
    if (this.actionFilter) result = result.filter(l => l.accion === this.actionFilter);
    if (this.entityFilter) result = result.filter(l => l.entidad === this.entityFilter);
    this.filteredLogs = result;
  }

  getRoleColor(rol: UserRole): string {
    const map: Record<UserRole, string> = {
      admin: 'bg-zinc-900 text-white',
      caja: 'bg-amber-100 text-amber-700',
      logistica: 'bg-zinc-200 text-zinc-700',
      tv: 'bg-zinc-100 text-zinc-600',
    };
    return map[rol] || 'bg-zinc-100 text-zinc-600';
  }

  getRoleLabel(rol: UserRole): string {
    return ROLE_LABELS[rol] || rol;
  }

  getActionIcon(action: AuditAction): string {
    return AUDIT_ACTION_ICONS[action] || 'circle';
  }

  getTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
  }
}
