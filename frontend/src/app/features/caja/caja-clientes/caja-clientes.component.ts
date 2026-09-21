import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Client } from '../../../core/models/client.model';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-caja-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in">

      <!-- Header (Estilo Admin) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 class="page-title">Clientes de Caja</h1>
          <p class="text-sm text-zinc-400 mt-1">Directorio de clientes, datos de contacto y gestión de comprobantes</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-3.5 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-semibold">
            {{ filteredClients.length }} clientes registrados
          </span>
        </div>
      </div>

      <!-- KPIs (Estilo Admin) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 animate-stagger">
        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-zinc-600">people</span>
            </div>
          </div>
          <p class="text-xl sm:text-2xl font-extrabold text-zinc-900">{{ clients.length }}</p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Total Clientes</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-zinc-600">person</span>
            </div>
          </div>
          <p class="text-xl sm:text-2xl font-extrabold text-zinc-900">{{ personaCount }}</p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Personas (CC)</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-blue-600">business</span>
            </div>
          </div>
          <p class="text-xl sm:text-2xl font-extrabold text-zinc-900">{{ empresaCount }}</p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Empresas (NIT)</p>
        </div>

        <div class="card p-4 sm:p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-lg sm:text-xl text-white">payments</span>
            </div>
          </div>
          <p class="text-base sm:text-2xl font-extrabold text-zinc-900 truncate">
            {{ totalFacturadoClientes | currency:'COP':'symbol-narrow':'1.0-0' }}
          </p>
          <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Total Facturado</p>
        </div>
      </div>

      <!-- Filtros (Estilo Admin) -->
      <div class="card p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            class="input-premium"
            placeholder="Buscar por nombre, Cédula / NIT o teléfono..."
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
          />
          <select class="select-premium" [(ngModel)]="typeFilter" (change)="applyFilters()">
            <option value="todos">Todos los clientes</option>
            <option value="persona">Personas Naturales (CC)</option>
            <option value="empresa">Empresas (NIT)</option>
          </select>
        </div>
      </div>

      <!-- Tabla (Estilo Admin) -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200">
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label">Cliente</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label">Documento</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label hidden md:table-cell">Ciudad & Dirección</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label hidden sm:table-cell">Teléfono</th>
                <th class="text-center px-3.5 sm:px-5 py-3 micro-label">Pedidos</th>
                <th class="text-right px-3.5 sm:px-5 py-3 micro-label">Total Comprado</th>
                <th class="text-right px-3.5 sm:px-5 py-3 micro-label">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              @for (c of paginatedClients; track c.id) {
                <tr
                  [routerLink]="['/caja/cliente', c.id, 'pedidos']"
                  class="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                  title="Haz clic para ver todos los pedidos de {{ c.nombre }}"
                >
                  
                  <!-- Cliente -->
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div 
                        class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                        [class]="c.tipo === 'empresa' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'"
                      >
                        {{ c.nombre.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-zinc-900">{{ c.nombre }}</p>
                        <p class="text-xs text-zinc-400 mt-0.5">{{ c.email }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Documento -->
                  <td class="px-5 py-4">
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium"
                      [class]="c.tipo === 'empresa' ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-700'"
                    >
                      {{ c.tipoDocumento === 'nit' ? 'NIT' : 'CC' }}: {{ c.documento }}
                    </span>
                  </td>

                  <!-- Ciudad & Dirección -->
                  <td class="px-5 py-4 hidden md:table-cell">
                    <p class="text-sm font-medium text-zinc-800">{{ c.ciudad }}</p>
                    <p class="text-xs text-zinc-400 truncate max-w-[200px] mt-0.5">{{ c.direccion }}</p>
                  </td>

                  <!-- Teléfono -->
                  <td class="px-5 py-4 hidden sm:table-cell font-mono text-xs text-zinc-600">
                    {{ c.telefono }}
                  </td>

                  <!-- Total Pedidos -->
                  <td class="px-5 py-4 text-center">
                    <span class="font-bold text-zinc-900 text-sm">{{ c.totalPedidos }}</span>
                  </td>

                  <!-- Total Comprado -->
                  <td class="px-5 py-4 text-right">
                    <span class="price-value-sm">
                      {{ c.totalGastado | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </td>

                  <!-- Acciones / Ver Pedidos -->
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <a
                        [href]="getWhatsAppUrl(c)"
                        target="_blank"
                        rel="noopener"
                        (click)="$event.stopPropagation()"
                        class="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Contactar por WhatsApp"
                      >
                        <span class="material-symbols-outlined text-lg">chat</span>
                      </a>
                      <span class="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">
                        <span>Ver Pedidos</span>
                        <span class="material-symbols-outlined text-base">chevron_right</span>
                      </span>
                    </div>
                  </td>

                </tr>
              }

              @if (filteredClients.length === 0) {
                <tr>
                  <td colspan="7" class="px-5 py-12 text-center text-zinc-400 text-sm">
                    No se encontraron clientes con estos filtros
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar (Estilo Admin) -->
        @if (filteredClients.length > 0) {
          <div class="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-zinc-50/50">
            <div class="flex items-center gap-3 text-zinc-500">
              <span>
                Mostrando <strong class="text-zinc-900">{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredClients.length) }}</strong> de <strong class="text-zinc-900">{{ filteredClients.length }}</strong> clientes
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
export class CajaClientesComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];

  searchQuery = '';
  typeFilter: 'todos' | 'persona' | 'empresa' = 'todos';

  constructor(
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
      this.applyFilters();
    });
  }

  get personaCount(): number {
    return this.clients.filter(c => c.tipo === 'persona').length;
  }

  get empresaCount(): number {
    return this.clients.filter(c => c.tipo === 'empresa').length;
  }

  get totalFacturadoClientes(): number {
    return this.clients.reduce((sum, c) => sum + c.totalGastado, 0);
  }

  currentPage = 1;
  pageSize = 8;
  pageSizeOptions = [5, 8, 15, 25];
  Math = Math;

  get totalPages(): number {
    return Math.ceil(this.filteredClients.length / this.pageSize) || 1;
  }

  get paginatedClients(): Client[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClients.slice(start, start + this.pageSize);
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
    let result = [...this.clients];

    if (this.typeFilter !== 'todos') {
      result = result.filter(c => c.tipo === this.typeFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        c.documento.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q) ||
        c.ciudad.toLowerCase().includes(q)
      );
    }

    this.filteredClients = result;
    this.currentPage = 1;
  }

  getWhatsAppUrl(client: Client): string {
    const phone = client.telefono.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hola ${client.nombre}, te contactamos del área de caja de GEP S.A.S. respecto al estado de tus pedidos.`);
    return `https://wa.me/57${phone}?text=${msg}`;
  }
}
