import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order, Payment } from '../../../core/models/order.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in">
      <div class="mb-6">
        <h1 class="page-title">Pagos</h1>
        <p class="text-sm text-zinc-400 mt-1">Gestión financiera y comprobantes</p>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-stagger">
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-emerald-600">account_balance</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ totalConfirmado | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Ingresos Confirmados</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-amber-600">pending</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ pendingCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Pagos Pendientes</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ confirmedCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Confirmados</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-rose-600">block</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ rejectedCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Rechazados</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            class="input-premium"
            placeholder="Buscar código..."
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            id="payment-search"
          />
          <select class="select-premium" [(ngModel)]="statusFilter" (change)="applyFilters()" id="payment-status-filter">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <select class="select-premium" [(ngModel)]="methodFilter" (change)="applyFilters()" id="payment-method-filter">
            <option value="">Todos los métodos</option>
            <option value="Nequi">Nequi</option>
            <option value="Bancolombia">Bancolombia</option>
            <option value="Davivienda">Davivienda</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200">
                <th class="text-left px-5 py-3 micro-label">Código</th>
                <th class="text-left px-5 py-3 micro-label">Cliente</th>
                <th class="text-left px-5 py-3 micro-label hidden md:table-cell">Método</th>
                <th class="text-left px-5 py-3 micro-label hidden lg:table-cell">Referencia</th>
                <th class="text-right px-5 py-3 micro-label">Monto</th>
                <th class="text-left px-5 py-3 micro-label">Estado Pago</th>
                <th class="text-left px-5 py-3 micro-label hidden sm:table-cell">Pedido</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredOrders; track item.id) {
                <tr class="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                  (click)="selectOrder(item)"
                >
                  <td class="px-5 py-4">
                    <span class="text-sm font-bold text-zinc-900">{{ item.folio }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <p class="text-sm font-medium text-zinc-800">{{ item.cliente.nombre }}</p>
                  </td>
                  <td class="px-5 py-4 hidden md:table-cell">
                    <span class="text-sm text-zinc-600">{{ item.pago?.metodo }}</span>
                  </td>
                  <td class="px-5 py-4 hidden lg:table-cell">
                    <span class="text-xs text-zinc-400 font-mono">{{ item.pago?.referencia }}</span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <span class="text-sm font-bold text-zinc-900">{{ item.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      [class]="getPaymentStatusClass(item.pago?.estado || 'pendiente')"
                    >
                      {{ getPaymentStatusLabel(item.pago?.estado || 'pendiente') }}
                    </span>
                  </td>
                  <td class="px-5 py-4 hidden sm:table-cell">
                    <app-status-badge [status]="item.estado" />
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <a
                        [routerLink]="['/admin/factura', item.id]"
                        (click)="$event.stopPropagation()"
                        title="Ver Factura"
                        class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <span class="material-symbols-outlined text-lg">receipt_long</span>
                      </a>
                      <span class="material-symbols-outlined text-zinc-300 group-hover:text-zinc-600 text-lg transition-colors">chevron_right</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Side panel -->
      @if (selectedOrder) {
        <div class="fixed inset-0 z-40" (click)="selectedOrder = null">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        </div>
        <div class="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right border-l border-zinc-200">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-extrabold text-zinc-900">{{ selectedOrder.folio }}</h2>
                <p class="text-xs text-zinc-400 mt-0.5">Detalle de pago</p>
              </div>
              <button (click)="selectedOrder = null" class="p-2 rounded-xl hover:bg-zinc-100 transition-colors">
                <span class="material-symbols-outlined text-zinc-500">close</span>
              </button>
            </div>

            <!-- Payment info -->
            <div class="mb-6">
              <p class="micro-label mb-3">Información del Pago</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-zinc-50 rounded-xl p-3">
                  <p class="text-xs text-zinc-400">Método</p>
                  <p class="text-sm font-semibold text-zinc-900">{{ selectedOrder.pago?.metodo || '—' }}</p>
                </div>
                <div class="bg-zinc-50 rounded-xl p-3">
                  <p class="text-xs text-zinc-400">Referencia</p>
                  <p class="text-sm font-semibold text-zinc-900 font-mono">{{ selectedOrder.pago?.referencia || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Proof -->
            @if (selectedOrder.pago?.comprobanteUrl) {
              <div class="mb-6">
                <p class="micro-label mb-3">Comprobante</p>
                <div class="bg-zinc-100/70 rounded-2xl overflow-hidden p-3 flex justify-center border border-zinc-200/80">
                  <img
                    [src]="selectedOrder.pago!.comprobanteUrl"
                    alt="Comprobante"
                    class="w-auto max-w-[260px] max-h-[460px] object-contain rounded-xl shadow-sm bg-white"
                  />
                </div>
              </div>
            } @else {
              <div class="mb-6 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-4 text-center">
                <span class="material-symbols-outlined text-zinc-400 text-2xl mb-1">receipt_long</span>
                <p class="text-xs font-semibold text-zinc-600">Sin comprobante adjunto</p>
                <p class="text-[11px] text-zinc-400 mt-0.5">El cliente aún no ha cargado soporte de pago.</p>
              </div>
            }

            <!-- Total -->
            <div class="bg-zinc-50 rounded-2xl p-4 mb-6 text-center">
              <p class="micro-label mb-1">Total del Pedido</p>
              <p class="text-2xl font-extrabold text-zinc-900">{{ selectedOrder.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
            </div>

            <!-- Reviewer info -->
            @if (selectedOrder.pago?.revisadoPorNombre) {
              <div class="mb-6 bg-emerald-50 rounded-2xl p-4">
                <p class="text-xs text-emerald-600 font-semibold mb-1">Revisado por</p>
                <p class="text-sm text-emerald-800 font-bold">{{ selectedOrder.pago!.revisadoPorNombre }}</p>
                <p class="text-xs text-emerald-600">{{ selectedOrder.pago!.fechaRevision | date:'dd/MM/yy HH:mm' }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="flex gap-3">
              <a
                [routerLink]="['/admin/factura', selectedOrder.id]"
                class="btn-primary flex-1 text-center"
              >
                <span class="material-symbols-outlined text-lg">receipt_long</span>
                Ver Factura
              </a>
              <a
                [routerLink]="['/admin/recibo', selectedOrder.id]"
                class="btn-secondary flex-1 text-center"
              >
                <span class="material-symbols-outlined text-lg">description</span>
                Ver Recibo
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.3s ease-out forwards;
    }
  `],
})
export class PaymentsComponent implements OnInit {
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;

  searchQuery = '';
  statusFilter = '';
  methodFilter = '';

  totalConfirmado = 0;
  pendingCount = 0;
  confirmedCount = 0;
  rejectedCount = 0;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.allOrders = orders.filter(o => o.pago);
      this.totalConfirmado = this.allOrders
        .filter(o => o.pago?.estado === 'confirmado')
        .reduce((sum, o) => sum + o.total, 0);
      this.pendingCount = this.allOrders.filter(o => o.pago?.estado === 'pendiente').length;
      this.confirmedCount = this.allOrders.filter(o => o.pago?.estado === 'confirmado').length;
      this.rejectedCount = this.allOrders.filter(o => o.pago?.estado === 'rechazado').length;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.allOrders];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(o =>
        o.folio.toLowerCase().includes(q) ||
        o.cliente.nombre.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter) {
      result = result.filter(o => o.pago?.estado === this.statusFilter);
    }

    if (this.methodFilter) {
      result = result.filter(o => o.pago?.metodo === this.methodFilter);
    }

    this.filteredOrders = result;
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
  }

  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      confirmado: 'Confirmado',
      rechazado: 'Rechazado',
    };
    return labels[status] || status;
  }

  getPaymentStatusClass(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'bg-amber-50 text-amber-700',
      revisado: 'bg-zinc-100 text-zinc-700',
      confirmado: 'bg-emerald-50 text-emerald-700',
      rechazado: 'bg-rose-50 text-rose-600',
    };
    return map[status] || 'bg-zinc-100 text-zinc-600';
  }
}
