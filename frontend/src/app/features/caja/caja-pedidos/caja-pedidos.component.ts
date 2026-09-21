import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-caja-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in">

      <!-- Header (Estilo Admin) -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Pedidos de Caja</h1>
          <p class="text-sm text-zinc-400 mt-1">Historial y control de órdenes gestionadas por el área de caja</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-3.5 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-semibold">
            {{ filteredOrders.length }} pedidos encontrados
          </span>
        </div>
      </div>

      <!-- KPIs (Estilo Admin) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-stagger">
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-zinc-600">receipt_long</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ orders.length }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Total Pedidos</p>
        </div>

        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-amber-600">pending</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ getCountByStatus('pago_en_revision') }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">En Revisión de Pago</p>
        </div>

        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">
            {{ getCountByStatus('pago_confirmado') + getCountByStatus('en_preparacion') }}
          </p>
          <p class="text-xs text-zinc-400 mt-0.5">Pagos Confirmados</p>
        </div>

        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-white">payments</span>
            </div>
          </div>
          <p class="price-value-xl truncate">
            {{ totalMonto | currency:'COP':'symbol-narrow':'1.0-0' }}
          </p>
          <p class="text-xs text-zinc-400 mt-0.5">Total Cartera</p>
        </div>
      </div>

      <!-- Filtros (Estilo Admin) -->
      <div class="card p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            class="input-premium"
            placeholder="Buscar por código o cliente..."
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
          />
          <select class="select-premium" [(ngModel)]="statusFilter" (change)="applyFilters()">
            <option value="todos">Todos los estados</option>
            <option value="pago_en_revision">En Revisión de Pago</option>
            <option value="pago_pendiente">Pago Pendiente</option>
            <option value="pago_confirmado">Pago Confirmado / Preparación</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      <!-- Tabla (Estilo Admin) -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200">
                <th class="text-left px-5 py-3 micro-label">Código</th>
                <th class="text-left px-5 py-3 micro-label">Cliente</th>
                <th class="text-left px-5 py-3 micro-label hidden md:table-cell">Productos Plaxtilíneas</th>
                <th class="text-left px-5 py-3 micro-label hidden lg:table-cell">Método / Ref</th>
                <th class="text-right px-5 py-3 micro-label">Total</th>
                <th class="text-center px-5 py-3 micro-label">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              @for (order of paginatedOrders; track order.id) {
                <tr
                  [routerLink]="['/caja/pedido', order.id]"
                  class="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                >
                  
                  <!-- Folio -->
                  <td class="px-5 py-4">
                    <span class="font-bold text-zinc-900 font-mono text-sm group-hover:text-emerald-700 transition-colors">
                      {{ order.folio }}
                    </span>
                    <p class="text-xs text-zinc-400 mt-0.5">{{ order.createdAt | date:'dd/MM/yy HH:mm' }}</p>
                  </td>

                  <!-- Cliente -->
                  <td class="px-5 py-4">
                    <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.nombre }}</p>
                    <p class="text-xs text-zinc-400 mt-0.5">{{ order.ciudad }} &bull; {{ order.cliente.telefono }}</p>
                  </td>

                  <!-- Productos -->
                  <td class="px-5 py-4 hidden md:table-cell max-w-[240px]">
                    <div class="space-y-0.5">
                      @for (item of order.items.slice(0, 2); track item.id) {
                        <p class="truncate text-xs text-zinc-700">
                          &bull; {{ item.cantidad }}x {{ item.nombreProducto }}
                        </p>
                      }
                      @if (order.items.length > 2) {
                        <span class="text-[11px] text-zinc-400 italic">+{{ order.items.length - 2 }} más</span>
                      }
                    </div>
                  </td>

                  <!-- Método y Referencia -->
                  <td class="px-5 py-4 hidden lg:table-cell">
                    <span class="text-sm font-semibold text-zinc-800">{{ order.pago?.metodo || 'Sin registrar' }}</span>
                    @if (order.pago?.referencia) {
                      <p class="font-mono text-xs text-zinc-400 mt-0.5">{{ order.pago!.referencia }}</p>
                    }
                  </td>

                  <!-- Total -->
                  <td class="px-5 py-4 text-right">
                    <span class="price-value-sm">
                      {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </td>

                  <!-- Estado -->
                  <td class="px-5 py-4 text-center">
                    <app-status-badge [status]="order.estado" />
                  </td>

                </tr>
              }

              @if (filteredOrders.length === 0) {
                <tr>
                  <td colspan="6" class="px-5 py-12 text-center text-zinc-400 text-sm">
                    No se encontraron pedidos con estos filtros
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar (Estilo Admin) -->
        @if (filteredOrders.length > 0) {
          <div class="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-zinc-50/50">
            <div class="flex items-center gap-3 text-zinc-500">
              <span>
                Mostrando <strong class="text-zinc-900">{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredOrders.length) }}</strong> de <strong class="text-zinc-900">{{ filteredOrders.length }}</strong> pedidos
              </span>
              <div class="hidden sm:flex items-center gap-1.5 pl-2 border-l border-zinc-200">
                <span class="text-[11px] text-zinc-400">Por pág:</span>
                <select
                  [(ngModel)]="pageSize"
                  (change)="onPageSizeChange()"
                  class="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 cursor-pointer focus:outline-none"
                >
                  @for (opt of pageSizeOptions; track opt) {
                    <option [ngValue]="opt">{{ opt }}</option>
                  }
                </select>
              </div>
            </div>

            @if (totalPages > 1) {
              <div class="flex items-center gap-1 self-end sm:self-auto">
                <button
                  (click)="goToPage(currentPage - 1)"
                  [disabled]="currentPage === 1"
                  class="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Página anterior"
                >
                  &larr; Ant
                </button>

                @for (p of pages; track p) {
                  <button
                    (click)="goToPage(p)"
                    class="w-7 h-7 rounded-lg font-bold text-xs transition-all flex items-center justify-center"
                    [class]="p === currentPage ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-white border border-transparent'"
                  >
                    {{ p }}
                  </button>
                }

                <button
                  (click)="goToPage(currentPage + 1)"
                  [disabled]="currentPage === totalPages"
                  class="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Página siguiente"
                >
                  Sig &rarr;
                </button>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
})
export class CajaPedidosComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchQuery = '';
  statusFilter: string = 'todos';

  currentPage = 1;
  pageSize = 8;
  pageSizeOptions = [5, 8, 15, 25];
  Math = Math;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.applyFilters();
    });
  }

  get totalMonto(): number {
    return this.orders.reduce((sum, o) => sum + o.total, 0);
  }

  getCountByStatus(status: OrderStatus): number {
    return this.orders.filter(o => o.estado === status).length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize) || 1;
  }

  get paginatedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.currentPage = 1;
  }

  applyFilters(): void {
    let result = [...this.orders];

    if (this.statusFilter !== 'todos') {
      if (this.statusFilter === 'pago_pendiente') {
        result = result.filter(o => o.estado === 'pago_pendiente' || o.estado === 'nuevo');
      } else if (this.statusFilter === 'pago_confirmado') {
        result = result.filter(o => o.estado === 'pago_confirmado' || o.estado === 'en_preparacion' || o.estado === 'en_camino' || o.estado === 'entregado');
      } else {
        result = result.filter(o => o.estado === this.statusFilter);
      }
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        o.folio.toLowerCase().includes(q) ||
        o.cliente.nombre.toLowerCase().includes(q) ||
        o.ciudad.toLowerCase().includes(q) ||
        (o.pago?.referencia && o.pago.referencia.toLowerCase().includes(q))
      );
    }

    this.filteredOrders = result;
    this.currentPage = 1;
  }
}
