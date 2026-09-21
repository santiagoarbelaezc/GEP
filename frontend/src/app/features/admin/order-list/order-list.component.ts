import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 class="page-title">Pedidos</h1>
          <p class="text-sm text-zinc-400 mt-1">{{ filteredOrders.length }} pedido{{ filteredOrders.length !== 1 ? 's' : '' }} encontrados</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            class="input-premium"
            placeholder="Buscar por código o cliente..."
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            id="search-input"
          />
          <select
            class="select-premium"
            [(ngModel)]="statusFilter"
            (change)="applyFilters()"
            id="status-filter"
          >
            <option value="">Todos los estados</option>
            @for (status of statusOptions; track status.value) {
              <option [value]="status.value">{{ status.label }}</option>
            }
          </select>
          <input
            type="date"
            class="input-premium"
            [(ngModel)]="dateFilter"
            (change)="applyFilters()"
            id="date-filter"
          />
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
                <th class="text-left px-5 py-3 micro-label hidden md:table-cell">Ciudad</th>
                <th class="text-left px-5 py-3 micro-label">Total</th>
                <th class="text-left px-5 py-3 micro-label">Estado</th>
                <th class="text-left px-5 py-3 micro-label hidden sm:table-cell">Fecha</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (order of paginatedOrders; track order.id) {
                <tr
                  class="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                  [routerLink]="['/admin/pedidos', order.id]"
                >
                  <td class="px-5 py-4">
                    <span class="text-sm font-bold text-zinc-900">{{ order.folio }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <p class="text-sm font-medium text-zinc-800">{{ order.cliente.nombre }}</p>
                    <p class="text-xs text-zinc-400">{{ order.cliente.email }}</p>
                  </td>
                  <td class="px-5 py-4 hidden md:table-cell">
                    <span class="text-sm text-zinc-600">{{ order.ciudad }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-sm font-bold text-zinc-900">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <app-status-badge [status]="order.estado" />
                  </td>
                  <td class="px-5 py-4 hidden sm:table-cell">
                    <span class="text-xs text-zinc-400">{{ order.createdAt | date:'dd/MM/yy HH:mm' }}</span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <span class="material-symbols-outlined text-zinc-300 group-hover:text-zinc-600 text-lg transition-colors">chevron_right</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
            <p class="text-xs text-zinc-400">
              Mostrando {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredOrders.length) }}
              de {{ filteredOrders.length }}
            </p>
            <div class="flex gap-1">
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class OrderListComponent implements OnInit {
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];

  searchQuery = '';
  statusFilter = '';
  dateFilter = '';

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  statusOptions = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.allOrders = orders;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.allOrders];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        o =>
          o.folio.toLowerCase().includes(q) ||
          o.cliente.nombre.toLowerCase().includes(q) ||
          o.cliente.email.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter) {
      result = result.filter(o => o.estado === this.statusFilter);
    }

    if (this.dateFilter) {
      result = result.filter(o => o.createdAt.startsWith(this.dateFilter));
    }

    this.filteredOrders = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedOrders = this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
}
