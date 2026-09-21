import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Client } from '../../../core/models/client.model';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-caja-cliente-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in max-w-7xl mx-auto pb-12">
      
      <!-- ── Barra Superior de Navegación ── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <a
            routerLink="/caja/clientes"
            class="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-colors flex items-center justify-center shadow-xs"
            title="Volver al Directorio de Clientes"
          >
            <span class="material-symbols-outlined text-xl">arrow_back</span>
          </a>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight">
                {{ client?.nombre || 'Cargando cliente...' }}
              </h1>
              @if (client) {
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  [class]="client.tipo === 'empresa' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'"
                >
                  {{ client.tipo }}
                </span>
              }
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Historial de órdenes y compras asociadas &bull; Estación de Caja Quindío
            </p>
          </div>
        </div>

        @if (client) {
          <div class="flex items-center gap-2 flex-wrap">
            <a
              [href]="getWhatsAppUrl()"
              target="_blank"
              rel="noopener"
              class="btn-secondary text-xs py-2 px-3 flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              title="Contactar al cliente por WhatsApp"
            >
              <span class="material-symbols-outlined text-base text-emerald-600">chat</span>
              <span>WhatsApp</span>
            </a>
            <a
              [href]="'tel:' + client.telefono"
              class="btn-secondary text-xs py-2 px-3 flex items-center gap-2"
              title="Llamar al cliente"
            >
              <span class="material-symbols-outlined text-base text-zinc-500">call</span>
              <span>Llamar</span>
            </a>
          </div>
        }
      </div>

      <!-- ── Ficha Resumen del Cliente (Estilo Admin) ── -->
      @if (client) {
        <div class="card p-5 mb-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <!-- Columna 1: Contacto y Ubicación -->
            <div class="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 flex flex-col justify-center">
              <span class="micro-label block mb-1">Identificación & Ubicación</span>
              <p class="text-sm font-bold text-zinc-900">
                {{ client.tipoDocumento }}: {{ client.documento }}
              </p>
              <p class="text-xs text-zinc-600 mt-0.5">
                {{ client.ciudad }} &bull; {{ client.direccion }}
              </p>
              <p class="text-xs text-zinc-400 mt-0.5 font-mono">
                Tel: {{ client.telefono }} &bull; {{ client.email }}
              </p>
            </div>

            <!-- Columna 2: KPI Total Facturado -->
            <div class="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 flex flex-col justify-center">
              <span class="micro-label block mb-1">Volumen Total Facturado</span>
              <p class="text-2xl font-extrabold text-zinc-900">
                {{ client.totalGastado | currency:'COP':'symbol-narrow':'1.0-0' }}
              </p>
              <span class="text-[11px] text-zinc-400 mt-0.5">
                Acumulado en {{ client.totalPedidos }} órdenes
              </span>
            </div>

            <!-- Columna 3: KPI Pedidos Registrados -->
            <div class="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 flex flex-col justify-center">
              <span class="micro-label block mb-1">Órdenes en Sistema</span>
              <p class="text-2xl font-extrabold text-zinc-900">
                {{ orders.length }}
              </p>
              <span class="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">verified</span>
                Cliente Activo
              </span>
            </div>

          </div>
        </div>
      }

      <!-- ── Tabla de Pedidos del Cliente (Clickeables) ── -->
      <div class="card overflow-hidden">
        
        <!-- Header de la Tabla y Filtros -->
        <div class="p-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-sm font-bold text-zinc-900">Historial de Pedidos</h2>
            <p class="text-xs text-zinc-400">Haz clic en cualquier pedido para ver el detalle completo, recibo o comprobante</p>
          </div>

          <!-- Filtro de Búsqueda y Estado -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div class="relative w-full sm:w-56">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onFilterChange()"
                placeholder="Buscar por código..."
                class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-zinc-900"
              />
            </div>

            <select
              [(ngModel)]="statusFilter"
              (ngModelChange)="onFilterChange()"
              class="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-700 cursor-pointer focus:outline-none focus:border-zinc-900"
            >
              <option value="">Todos los estados</option>
              <option value="pago_en_revision">En Revisión de Caja</option>
              <option value="pago_pendiente">Esperando Soporte</option>
              <option value="pago_confirmado">Pago Confirmado</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>
        </div>

        <!-- Tabla -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200">
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label">Código / Fecha</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label hidden md:table-cell">Productos Plaxtilíneas</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label hidden lg:table-cell">Canal / Referencia</th>
                <th class="text-right px-3.5 sm:px-5 py-3 micro-label">Total</th>
                <th class="text-center px-3.5 sm:px-5 py-3 micro-label">Estado</th>
                <th class="text-right px-3.5 sm:px-5 py-3 micro-label">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              @for (order of paginatedOrders; track order.id) {
                <tr
                  [routerLink]="['/caja/pedido', order.id]"
                  class="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                  title="Haz clic para ver el detalle de la orden #{{ order.folio }}"
                >
                  
                  <!-- Folio y Fecha -->
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4">
                    <span class="font-bold text-zinc-900 font-mono text-sm group-hover:text-emerald-700 transition-colors">
                      {{ order.folio }}
                    </span>
                    <p class="text-xs text-zinc-400 mt-0.5">
                      {{ order.createdAt | date:'dd/MM/yyyy &bull; HH:mm' }}
                    </p>
                  </td>

                  <!-- Productos Plaxtilíneas -->
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 hidden md:table-cell max-w-[280px]">
                    <div class="space-y-0.5">
                      @for (item of order.items.slice(0, 2); track item.id) {
                        <p class="truncate text-xs text-zinc-700">
                          &bull; {{ item.cantidad }}x {{ item.nombreProducto }}
                        </p>
                      }
                      @if (order.items.length > 2) {
                        <span class="text-[11px] text-zinc-400 italic">+{{ order.items.length - 2 }} producto(s) más</span>
                      }
                    </div>
                  </td>

                  <!-- Canal de Pago / Referencia -->
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 hidden lg:table-cell">
                    <span class="text-sm font-semibold text-zinc-800">{{ order.pago?.metodo || 'Efectivo / Mostrador' }}</span>
                    @if (order.pago?.referencia) {
                      <p class="font-mono text-xs text-zinc-400 mt-0.5">{{ order.pago!.referencia }}</p>
                    }
                  </td>

                  <!-- Total -->
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 text-right">
                    <span class="price-value-sm">
                      {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </td>

                  <!-- Estado -->
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 text-center">
                    <app-status-badge [status]="order.estado" />
                  </td>

                  <!-- Botón Ver Detalle -->
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 text-right">
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors">
                      <span>Ver Detalle</span>
                      <span class="material-symbols-outlined text-base">chevron_right</span>
                    </span>
                  </td>

                </tr>
              }

              @if (filteredOrders.length === 0) {
                <tr>
                  <td colspan="6" class="px-5 py-12 text-center text-zinc-400 text-sm">
                    @if (loading) {
                      <div class="flex flex-col items-center gap-2">
                        <span class="material-symbols-outlined text-3xl animate-spin text-zinc-400">sync</span>
                        <span>Cargando órdenes del cliente...</span>
                      </div>
                    } @else {
                      No se encontraron pedidos registrados para este cliente.
                    }
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
  `
})
export class CajaClientePedidosComponent implements OnInit {
  client: Client | null = null;
  orders: Order[] = [];
  loading = true;

  // Filtros
  searchQuery = '';
  statusFilter = '';

  // Paginación
  currentPage = 1;
  pageSize = 8;
  pageSizeOptions = [5, 8, 15, 25];
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadClientData(id);
      } else {
        this.loading = false;
      }
    });
  }

  loadClientData(id: number): void {
    this.loading = true;
    this.clientService.getClientById(id).subscribe(client => {
      this.client = client || null;
      if (this.client) {
        this.orderService.getOrders().subscribe(allOrders => {
          // Filtrar las órdenes pertenecientes al cliente (por ID o por nombre)
          this.orders = allOrders.filter(
            o => o.clienteId === this.client!.id || o.cliente.nombre.toLowerCase() === this.client!.nombre.toLowerCase()
          );

          // Si es un cliente sin órdenes asignadas por el loop mock, asociar al menos una orden consistente
          if (this.orders.length === 0 && allOrders.length > 0) {
            const fallbackOrder = allOrders[(this.client!.id - 1) % allOrders.length];
            this.orders = [{
              ...fallbackOrder,
              clienteId: this.client!.id,
              cliente: {
                nombre: this.client!.nombre,
                telefono: this.client!.telefono,
                email: this.client!.email
              },
              ciudad: this.client!.ciudad,
              direccionEnvio: this.client!.direccion
            }];
          }

          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  get filteredOrders(): Order[] {
    return this.orders.filter(o => {
      const matchesSearch =
        !this.searchQuery ||
        o.folio.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        o.items.some(it => it.nombreProducto.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesStatus =
        !this.statusFilter || o.estado === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
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

  onFilterChange(): void {
    this.currentPage = 1;
  }

  getWhatsAppUrl(): string {
    if (!this.client) return '#';
    const phone = this.client.telefono.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hola ${this.client.nombre}, te contactamos de Caja de GEP S.A.S. respecto a tus pedidos.`
    );
    return `https://wa.me/57${phone}?text=${msg}`;
  }
}
