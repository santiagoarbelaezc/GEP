import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Client, TIPO_CLIENTE_LABELS } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 class="page-title">Clientes</h1>
          <p class="text-sm text-zinc-400 mt-1">{{ filteredClients.length }} cliente{{ filteredClients.length !== 1 ? 's' : '' }} registrados</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-stagger">
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-zinc-600">groups</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ allClients.length }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Total Clientes</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-emerald-600">trending_up</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ activeCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Activos (último mes)</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-zinc-600">apartment</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ empresaCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Empresas</p>
        </div>
        <div class="card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-xl text-zinc-600">person</span>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-zinc-900">{{ personaCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Personas</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            class="input-premium"
            placeholder="Buscar por nombre, NIT, email..."
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            id="client-search"
          />
          <select
            class="select-premium"
            [(ngModel)]="typeFilter"
            (change)="applyFilters()"
            id="client-type-filter"
          >
            <option value="">Todos los tipos</option>
            <option value="empresa">Empresas</option>
            <option value="persona">Personas</option>
          </select>
          <select
            class="select-premium"
            [(ngModel)]="cityFilter"
            (change)="applyFilters()"
            id="client-city-filter"
          >
            <option value="">Todas las ciudades</option>
            @for (city of cities; track city) {
              <option [value]="city">{{ city }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200">
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label">Cliente</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label hidden md:table-cell">Documento</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label hidden lg:table-cell">Ciudad</th>
                <th class="text-center px-3.5 sm:px-5 py-3 micro-label">Pedidos</th>
                <th class="text-right px-3.5 sm:px-5 py-3 micro-label hidden sm:table-cell">Total Gastado</th>
                <th class="text-left px-3.5 sm:px-5 py-3 micro-label hidden lg:table-cell">Última Compra</th>
                <th class="px-3.5 sm:px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (client of paginatedClients; track client.id) {
                <tr
                  class="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                  [routerLink]="['/admin/clientes', client.id]"
                >
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full hidden sm:flex items-center justify-center flex-shrink-0"
                        [class]="client.tipo === 'empresa' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'"
                      >
                        <span class="text-xs font-bold">{{ getInitials(client.nombre) }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-bold text-zinc-900 group-hover:text-black">{{ client.nombre }}</p>
                        <p class="text-xs text-zinc-400">{{ client.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 hidden md:table-cell">
                    <span class="text-xs font-medium text-zinc-500">{{ client.documento }}</span>
                    <span class="inline-flex items-center px-1.5 py-0.5 ml-1.5 bg-zinc-100 rounded text-[10px] font-semibold text-zinc-500 uppercase">
                      {{ client.tipoDocumento }}
                    </span>
                  </td>
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 hidden lg:table-cell">
                    <span class="text-sm text-zinc-600">{{ client.ciudad }}</span>
                  </td>
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 text-center">
                    <span class="text-sm font-bold text-zinc-900">{{ client.totalPedidos }}</span>
                  </td>
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 text-right hidden sm:table-cell">
                    <span class="text-sm font-bold text-zinc-900">{{ client.totalGastado | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                  </td>
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 hidden lg:table-cell">
                    @if (client.ultimaCompra) {
                      <span class="text-xs text-zinc-400">{{ client.ultimaCompra | date:'dd/MM/yy' }}</span>
                    } @else {
                      <span class="text-xs text-zinc-300">—</span>
                    }
                  </td>
                  <td class="px-3.5 sm:px-5 py-3 sm:py-4 text-right">
                    <span class="material-symbols-outlined text-zinc-300 group-hover:text-zinc-600 text-lg transition-colors">chevron_right</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-zinc-100">
            <p class="text-xs text-zinc-400 text-center sm:text-left">
              Mostrando {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredClients.length) }}
              de {{ filteredClients.length }}
            </p>
            <div class="flex gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-center"
              >
                ← Anterior
              </button>
              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-center"
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
export class ClientListComponent implements OnInit {
  allClients: Client[] = [];
  filteredClients: Client[] = [];
  paginatedClients: Client[] = [];

  searchQuery = '';
  typeFilter = '';
  cityFilter = '';

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  activeCount = 0;
  empresaCount = 0;
  personaCount = 0;
  cities: string[] = [];

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(clients => {
      this.allClients = clients;
      this.empresaCount = clients.filter(c => c.tipo === 'empresa').length;
      this.personaCount = clients.filter(c => c.tipo === 'persona').length;
      this.cities = [...new Set(clients.map(c => c.ciudad))].sort();

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      this.activeCount = clients.filter(c => c.ultimaCompra && new Date(c.ultimaCompra) >= oneMonthAgo).length;

      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.allClients];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        c.documento.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.empresa?.toLowerCase().includes(q) ?? false)
      );
    }

    if (this.typeFilter) {
      result = result.filter(c => c.tipo === this.typeFilter);
    }

    if (this.cityFilter) {
      result = result.filter(c => c.ciudad === this.cityFilter);
    }

    this.filteredClients = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedClients = this.filteredClients.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredClients.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}
