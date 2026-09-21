import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-caja-arqueo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">

      <!-- Header (Estilo Admin) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 class="page-title">Arqueo de Turno</h1>
          <p class="text-sm text-zinc-400 mt-1">Conciliación de recaudos por canal bancario y balance general del turno</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="imprimirCierre()"
            class="btn-primary py-2 px-4 text-xs flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir Cierre
          </button>
        </div>
      </div>

      <!-- KPIs (Estilo Admin) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 animate-stagger">
        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-white">payments</span>
            </div>
          </div>
          <p class="text-base sm:text-2xl font-extrabold text-zinc-900 truncate">
            {{ totalRecaudado | currency:'COP':'symbol-narrow':'1.0-0' }}
          </p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Recaudo Total Turno</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-emerald-600">check_circle</span>
            </div>
          </div>
          <p class="text-xl sm:text-2xl font-extrabold text-zinc-900">{{ approvedOrders.length }}</p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Cobros Validados</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-zinc-600">receipt</span>
            </div>
          </div>
          <p class="text-base sm:text-2xl font-extrabold text-zinc-900 truncate">
            {{ (approvedOrders.length > 0 ? (totalRecaudado / approvedOrders.length) : 0) | currency:'COP':'symbol-narrow':'1.0-0' }}
          </p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Ticket Promedio</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-emerald-600">verified</span>
            </div>
          </div>
          <p class="text-xl sm:text-2xl font-extrabold text-emerald-600">96.5%</p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Efectividad de Cobro</p>
        </div>
      </div>

      <!-- Desglose por Canal de Pago (Estilo Admin) -->
      <div class="mb-6">
        <h2 class="text-sm font-bold text-zinc-900 mb-3">Desglose por Canal de Pago</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Nequi -->
          <div class="card p-5 hover:border-zinc-300 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                  NQ
                </div>
                <div>
                  <span class="text-xs font-bold text-zinc-900">Nequi</span>
                  <p class="text-[11px] text-zinc-400">{{ breakdown.nequi.count }} transacciones</p>
                </div>
              </div>
            </div>
            <p class="price-value-xl">
              {{ breakdown.nequi.total | currency:'COP':'symbol-narrow':'1.0-0' }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">
              {{ getPercentage(breakdown.nequi.total) }}% del recaudo
            </p>
          </div>

          <!-- Bancolombia -->
          <div class="card p-5 hover:border-zinc-300 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  BC
                </div>
                <div>
                  <span class="text-xs font-bold text-zinc-900">Bancolombia</span>
                  <p class="text-[11px] text-zinc-400">{{ breakdown.bancolombia.count }} transacciones</p>
                </div>
              </div>
            </div>
            <p class="price-value-xl">
              {{ breakdown.bancolombia.total | currency:'COP':'symbol-narrow':'1.0-0' }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">
              {{ getPercentage(breakdown.bancolombia.total) }}% del recaudo
            </p>
          </div>

          <!-- Daviplata -->
          <div class="card p-5 hover:border-zinc-300 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
                  DV
                </div>
                <div>
                  <span class="text-xs font-bold text-zinc-900">Daviplata</span>
                  <p class="text-[11px] text-zinc-400">{{ breakdown.daviplata.count }} transacciones</p>
                </div>
              </div>
            </div>
            <p class="price-value-xl">
              {{ breakdown.daviplata.total | currency:'COP':'symbol-narrow':'1.0-0' }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">
              {{ getPercentage(breakdown.daviplata.total) }}% del recaudo
            </p>
          </div>

          <!-- Efectivo -->
          <div class="card p-5 hover:border-zinc-300 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  EF
                </div>
                <div>
                  <span class="text-xs font-bold text-zinc-900">Efectivo Mostrador</span>
                  <p class="text-[11px] text-zinc-400">{{ breakdown.efectivo.count }} transacciones</p>
                </div>
              </div>
            </div>
            <p class="price-value-xl">
              {{ breakdown.efectivo.total | currency:'COP':'symbol-narrow':'1.0-0' }}
            </p>
            <p class="text-xs text-zinc-400 mt-1">
              {{ getPercentage(breakdown.efectivo.total) }}% del recaudo
            </p>
          </div>

        </div>
      </div>

      <!-- Tabla de Operaciones Conciliadas (Estilo Admin) -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h3 class="text-sm font-bold text-zinc-900">Operaciones Conciliadas del Turno</h3>
            <p class="text-xs text-zinc-400">Comprobantes cotejados y aprobados para despacho</p>
          </div>
          <span class="text-xs font-semibold text-zinc-500 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
            {{ approvedOrders.length }} registros
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200">
                <th class="text-left px-5 py-3 micro-label">Hora / Folio</th>
                <th class="text-left px-5 py-3 micro-label">Cliente</th>
                <th class="text-left px-5 py-3 micro-label">Canal de Pago</th>
                <th class="text-left px-5 py-3 micro-label hidden sm:table-cell">Referencia Bancaria</th>
                <th class="text-right px-5 py-3 micro-label">Monto Validado</th>
                <th class="text-center px-5 py-3 micro-label">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              @for (order of paginatedApprovedOrders; track order.id) {
                <tr class="hover:bg-zinc-50 transition-colors">
                  <td class="px-5 py-4">
                    <p class="font-bold text-zinc-900 font-mono text-sm">{{ order.folio }}</p>
                    <p class="text-xs text-zinc-400 mt-0.5">{{ order.createdAt | date:'HH:mm' }}</p>
                  </td>
                  <td class="px-5 py-4">
                    <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.nombre }}</p>
                    <p class="text-xs text-zinc-400 mt-0.5">{{ order.ciudad }}</p>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-sm font-medium text-zinc-800">{{ order.pago?.metodo || 'Efectivo' }}</span>
                  </td>
                  <td class="px-5 py-4 hidden sm:table-cell font-mono text-xs text-zinc-500">
                    {{ order.pago?.referencia || 'SIN-REF' }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <span class="price-value-sm">
                      {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                      <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      Pago OK
                    </span>
                  </td>
                </tr>
              }

              @if (approvedOrders.length === 0) {
                <tr>
                  <td colspan="6" class="px-5 py-12 text-center text-zinc-400 text-sm">
                    No se han registrado pagos confirmados en este turno aún.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar (Estilo Admin) -->
        @if (approvedOrders.length > 0) {
          <div class="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-zinc-50/50">
            <div class="flex items-center gap-3 text-zinc-500">
              <span>
                Mostrando <strong class="text-zinc-900">{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, approvedOrders.length) }}</strong> de <strong class="text-zinc-900">{{ approvedOrders.length }}</strong> transacciones
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
export class CajaArqueoComponent implements OnInit {
  orders: Order[] = [];

  currentPage = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  Math = Math;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
    });
  }

  get approvedOrders(): Order[] {
    return this.orders.filter(o =>
      o.estado === 'pago_confirmado' ||
      o.estado === 'en_preparacion' ||
      o.estado === 'en_camino' ||
      o.estado === 'entregado'
    );
  }

  get totalPages(): number {
    return Math.ceil(this.approvedOrders.length / this.pageSize) || 1;
  }

  get paginatedApprovedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.approvedOrders.slice(start, start + this.pageSize);
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

  get totalRecaudado(): number {
    return this.approvedOrders.reduce((sum, o) => sum + o.total, 0);
  }

  get breakdown() {
    const data = {
      nequi: { count: 0, total: 0 },
      bancolombia: { count: 0, total: 0 },
      daviplata: { count: 0, total: 0 },
      efectivo: { count: 0, total: 0 },
    };

    this.approvedOrders.forEach(o => {
      const metodo = (o.pago?.metodo || 'Efectivo').toLowerCase();
      if (metodo.includes('nequi')) {
        data.nequi.count++;
        data.nequi.total += o.total;
      } else if (metodo.includes('bancolombia')) {
        data.bancolombia.count++;
        data.bancolombia.total += o.total;
      } else if (metodo.includes('daviplata')) {
        data.daviplata.count++;
        data.daviplata.total += o.total;
      } else {
        data.efectivo.count++;
        data.efectivo.total += o.total;
      }
    });

    return data;
  }

  getPercentage(amount: number): string {
    if (!this.totalRecaudado) return '0';
    return ((amount / this.totalRecaudado) * 100).toFixed(1);
  }

  imprimirCierre(): void {
    window.print();
  }
}
