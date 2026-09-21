import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService, PROTOTYPE_COMPROBANTE_URL } from '../../../core/services/order.service';
import { AuditService } from '../../../core/services/audit.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order } from '../../../core/models/order.model';

type FilterStage = 'todos' | 'revision' | 'espera' | 'aprobados';

@Component({
  selector: 'app-caja-operativa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in">

      <!-- Header (Estilo Admin) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="page-title">Caja Operativa</h1>
          <p class="text-sm text-zinc-400 mt-1">Validación de comprobantes, cotejo bancario y autorización para bodega</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-700 rounded-full text-xs font-bold">
            <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Turno Activo &bull; María García
          </span>
        </div>
      </div>

      <!-- KPIs (Estilo Admin) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-stagger">
        
        <!-- Por Revisar -->
        <div 
          (click)="setFilterStage('revision')"
          class="card p-5 cursor-pointer hover:border-zinc-400 transition-all group"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-xl text-amber-600">find_in_page</span>
            </div>
            @if (revisionCount > 0) {
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                Urgente
              </span>
            }
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ revisionCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Por Revisar</p>
        </div>

        <!-- Esperando Soporte -->
        <div 
          (click)="setFilterStage('espera')"
          class="card p-5 cursor-pointer hover:border-zinc-400 transition-all group"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-xl text-zinc-600">pending_actions</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ pendingCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Esperando Soporte</p>
        </div>

        <!-- Aprobados Hoy -->
        <div 
          (click)="setFilterStage('aprobados')"
          class="card p-5 cursor-pointer hover:border-zinc-400 transition-all group"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ approvedTodayCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Aprobados Hoy</p>
        </div>

        <!-- Recaudo Turno -->
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-white">payments</span>
            </div>
          </div>
          <p class="price-value-xl truncate">
            {{ totalRecaudadoHoy | currency:'COP':'symbol-narrow':'1.0-0' }}
          </p>
          <p class="text-xs text-zinc-400 mt-0.5">Recaudo Turno</p>
        </div>

      </div>

      <!-- Filtros (Estilo Admin) -->
      <div class="card p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">search</span>
            <input
              type="text"
              class="input-premium pl-10"
              placeholder="Buscar por código (ej. GEP-2024001), cliente o referencia..."
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
            />
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              (click)="setFilterStage('todos')"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              [class]="filterStage === 'todos' ? 'bg-zinc-900 text-white shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
            >
              Todos ({{ allOrders.length }})
            </button>
            <button
              (click)="setFilterStage('revision')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
              [class]="filterStage === 'revision' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'"
            >
              Por Revisar ({{ revisionCount }})
            </button>
            <button
              (click)="setFilterStage('espera')"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              [class]="filterStage === 'espera' ? 'bg-zinc-800 text-white shadow-xs' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
            >
              Esperando Soporte ({{ pendingCount }})
            </button>
            <button
              (click)="setFilterStage('aprobados')"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              [class]="filterStage === 'aprobados' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'"
            >
              Aprobados ({{ approvedTodayCount }})
            </button>
          </div>
        </div>
      </div>

      <!-- Grid de Pedidos (Estilo Admin) -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (order of paginatedOrders; track order.id) {
          <div
            [routerLink]="['/caja/pedido', order.id]"
            class="card p-5 hover:border-zinc-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <!-- Header Tarjeta -->
              <div class="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-sm font-extrabold text-zinc-900 group-hover:text-emerald-700 transition-colors">{{ order.folio }}</span>
                    @if (order.estado === 'pago_en_revision') {
                      <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    }
                  </div>
                  <p class="text-xs text-zinc-400 mt-0.5">{{ order.createdAt | date:'dd/MM/yyyy &bull; HH:mm' }}</p>
                </div>
                <app-status-badge [status]="order.estado" />
              </div>

              <!-- Cliente -->
              <div class="mb-3 p-3 bg-zinc-50 group-hover:bg-zinc-100/70 rounded-xl border border-zinc-100 transition-colors">
                <p class="text-sm font-bold text-zinc-900 truncate">{{ order.cliente.nombre }}</p>
                <div class="flex items-center justify-between text-xs text-zinc-500 mt-1">
                  <span>{{ order.cliente.telefono }}</span>
                  <span class="font-medium text-zinc-600">{{ order.ciudad }}</span>
                </div>
              </div>

              <!-- Productos Plaxtilíneas -->
              <div class="mb-3">
                <p class="micro-label mb-1.5">Productos a Alistar</p>
                <div class="space-y-1">
                  @for (item of order.items.slice(0, 2); track item.id) {
                    <div class="text-xs text-zinc-700 flex items-center justify-between">
                      <span class="truncate pr-2">&bull; {{ item.cantidad }}x {{ item.nombreProducto }}</span>
                      <span class="price-value-sm text-zinc-600 flex-shrink-0">{{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                    </div>
                  }
                  @if (order.items.length > 2) {
                    <p class="text-[11px] text-zinc-400 italic mt-0.5">+ {{ order.items.length - 2 }} producto(s) adicional(es)</p>
                  }
                </div>
              </div>

              <!-- Comprobante / Canal -->
              <div class="mb-4">
                @if (order.pago?.comprobanteUrl) {
                  <div class="flex items-center gap-2.5 p-2 bg-amber-50/60 rounded-xl border border-amber-200/70">
                    <img
                      [src]="order.pago!.comprobanteUrl"
                      alt="Thumbnail comprobante"
                      class="w-9 h-12 object-cover rounded-lg border border-amber-200 bg-white flex-shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <span class="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Comprobante Adjunto</span>
                      <p class="text-xs font-semibold text-zinc-900 truncate">{{ order.pago!.metodo }}</p>
                      <p class="text-[11px] font-mono text-zinc-500 truncate">{{ order.pago!.referencia }}</p>
                    </div>
                    <span class="material-symbols-outlined text-amber-600 text-lg">check_circle</span>
                  </div>
                } @else if (order.estado === 'nuevo' || order.estado === 'pago_pendiente') {
                  <div class="p-2.5 bg-zinc-50 rounded-xl text-center border border-dashed border-zinc-200">
                    <span class="text-xs font-medium text-zinc-500 flex items-center justify-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-zinc-400">hourglass_top</span>
                      Sin comprobante adjunto
                    </span>
                  </div>
                } @else {
                  <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-800">Pago Verificado & Bodega</span>
                    <span class="material-symbols-outlined text-emerald-600 text-base">verified</span>
                  </div>
                }
              </div>
            </div>

            <!-- Total y Botón de Acción (Estilo Admin) -->
            <div class="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
              <div>
                <span class="micro-label block">Total</span>
                <span class="price-value-base block mt-0.5">
                  {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                </span>
              </div>

              @if (order.estado === 'pago_en_revision') {
                <span
                  class="btn-primary py-2 px-4 text-xs group-hover:bg-black transition-colors"
                >
                  <span class="material-symbols-outlined text-base text-amber-400">verified</span>
                  Revisar Pago &rarr;
                </span>
              } @else if (order.estado === 'nuevo' || order.estado === 'pago_pendiente') {
                <span
                  class="btn-secondary py-2 px-3 text-xs group-hover:bg-zinc-100 transition-colors"
                >
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  Ver Detalle &rarr;
                </span>
              } @else {
                <span
                  class="btn-secondary py-2 px-3 text-xs group-hover:bg-zinc-100 transition-colors"
                >
                  <span class="material-symbols-outlined text-sm">receipt</span>
                  Detalle &rarr;
                </span>
              }
            </div>
          </div>
        }

        @if (filteredOrders.length === 0) {
          <div class="col-span-full card p-12 text-center">
            <span class="material-symbols-outlined text-5xl text-zinc-200 mb-2">search_off</span>
            <p class="text-sm font-bold text-zinc-700">No se encontraron pedidos con estos filtros</p>
            <button
              (click)="setFilterStage('todos'); searchQuery = ''; applyFilters()"
              class="mt-4 btn-secondary text-xs"
            >
              Restablecer Filtros
            </button>
          </div>
        }
      </div>

      <!-- Pagination Bar (Estilo Admin) -->
      @if (filteredOrders.length > 0) {
        <div class="mt-4 card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-white">
          <div class="flex items-center gap-3 text-zinc-500">
            <span>
              Mostrando <strong class="text-zinc-900">{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredOrders.length) }}</strong> de <strong class="text-zinc-900">{{ filteredOrders.length }}</strong> órdenes operativas
            </span>
            <div class="hidden sm:flex items-center gap-1.5 pl-2 border-l border-zinc-200">
              <span class="text-[11px] text-zinc-400">Por pág:</span>
              <select
                [(ngModel)]="pageSize"
                (change)="onPageSizeChange()"
                class="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 cursor-pointer focus:outline-none"
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
                class="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                &larr; Ant
              </button>

              @for (p of pages; track p) {
                <button
                  (click)="goToPage(p)"
                  class="w-7 h-7 rounded-lg font-bold text-xs transition-all flex items-center justify-center"
                  [class]="p === currentPage ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100 border border-transparent'"
                >
                  {{ p }}
                </button>
              }

              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                Sig &rarr;
              </button>
            </div>
          }
        </div>
      }

      <!-- Toast -->
      @if (toastMessage) {
        <div class="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800 animate-slide-in-up">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span class="text-xs font-bold">{{ toastMessage }}</span>
        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes slideInUp {
      from { transform: translateY(15px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-in-up {
      animation: slideInUp 0.25s ease-out forwards;
    }
    @keyframes scaleUp {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-up {
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `],
})
export class CajaOperativaComponent implements OnInit {
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];

  filterStage: FilterStage = 'todos';
  searchQuery = '';

  toastMessage = '';

  constructor(
    private orderService: OrderService,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.allOrders = orders;
      this.applyFilters();
    });
  }

  get revisionCount(): number {
    return this.allOrders.filter(o => o.estado === 'pago_en_revision').length;
  }

  get pendingCount(): number {
    return this.allOrders.filter(o => o.estado === 'nuevo' || o.estado === 'pago_pendiente').length;
  }

  get approvedTodayCount(): number {
    return this.allOrders.filter(o => 
      o.estado === 'pago_confirmado' || 
      o.estado === 'en_preparacion' || 
      o.estado === 'en_camino' || 
      o.estado === 'entregado'
    ).length;
  }

  get totalRecaudadoHoy(): number {
    return this.allOrders
      .filter(o => 
        o.estado === 'pago_confirmado' || 
        o.estado === 'en_preparacion' || 
        o.estado === 'en_camino' || 
        o.estado === 'entregado'
      )
      .reduce((sum, o) => sum + o.total, 0);
  }

  currentPage = 1;
  pageSize = 6;
  pageSizeOptions = [6, 9, 12, 24];
  Math = Math;

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

  setFilterStage(stage: FilterStage): void {
    this.filterStage = stage;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allOrders];

    if (this.filterStage === 'revision') {
      result = result.filter(o => o.estado === 'pago_en_revision');
    } else if (this.filterStage === 'espera') {
      result = result.filter(o => o.estado === 'nuevo' || o.estado === 'pago_pendiente');
    } else if (this.filterStage === 'aprobados') {
      result = result.filter(o => 
        o.estado === 'pago_confirmado' || 
        o.estado === 'en_preparacion' || 
        o.estado === 'en_camino' || 
        o.estado === 'entregado'
      );
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(o => 
        o.folio.toLowerCase().includes(q) ||
        o.cliente.nombre.toLowerCase().includes(q) ||
        (o.pago?.referencia && o.pago.referencia.toLowerCase().includes(q))
      );
    }

    this.filteredOrders = result;
    this.currentPage = 1;
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = '';
      }
    }, 4000);
  }
}
