import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Client, ClientActivity, TIPO_DOCUMENTO_LABELS, TIPO_CLIENTE_LABELS } from '../../../core/models/client.model';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  template: `
    @if (client) {
      <div class="animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <a routerLink="/admin/clientes" class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 mb-2 transition-colors">
              <span class="material-symbols-outlined text-base">arrow_back</span>
              Volver a clientes
            </a>
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                [class]="client.tipo === 'empresa' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'"
              >
                <span class="text-lg font-extrabold">{{ getInitials(client.nombre) }}</span>
              </div>
              <div>
                <h1 class="page-title">{{ client.nombre }}</h1>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    [class]="client.tipo === 'empresa' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'"
                  >
                    {{ tipoLabel }}
                  </span>
                  <span class="text-xs text-zinc-400">{{ docLabel }}: {{ client.documento }}</span>
                  @if (!client.activo) {
                    <span class="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold">Inactivo</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Orders & Activity -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Orders Table -->
            <div class="card overflow-hidden">
              <div class="p-6 pb-0">
                <p class="micro-label mb-4">Historial de Pedidos ({{ orders.length }})</p>
              </div>
              @if (orders.length > 0) {
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b border-zinc-200 bg-zinc-50">
                        <th class="text-left px-6 py-3 micro-label">Código</th>
                        <th class="text-left px-6 py-3 micro-label">Fecha</th>
                        <th class="text-right px-6 py-3 micro-label">Total</th>
                        <th class="text-left px-6 py-3 micro-label">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (order of orders; track order.id) {
                        <tr
                          class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                          [routerLink]="['/admin/pedidos', order.id]"
                        >
                          <td class="px-6 py-3.5 text-sm font-bold text-zinc-900">{{ order.folio }}</td>
                          <td class="px-6 py-3.5 text-xs text-zinc-400">{{ order.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                          <td class="px-6 py-3.5 text-sm font-bold text-zinc-900 text-right">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                          <td class="px-6 py-3.5"><app-status-badge [status]="order.estado" /></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="p-8 text-center">
                  <span class="material-symbols-outlined text-3xl text-zinc-200 mb-2">inbox</span>
                  <p class="text-sm text-zinc-400">Sin pedidos registrados</p>
                </div>
              }
            </div>

            <!-- Activity Timeline -->
            <div class="card p-6">
              <p class="micro-label mb-5">Actividad Reciente</p>
              <div class="relative">
                @for (activity of activities; track activity.id; let last = $last) {
                  <div class="flex gap-4 pb-5" [class.pb-0]="last">
                    <div class="flex flex-col items-center">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        [class]="getActivityColor(activity.tipo)"
                      >
                        <span class="material-symbols-outlined text-sm">{{ getActivityIcon(activity.tipo) }}</span>
                      </div>
                      @if (!last) {
                        <div class="w-px flex-1 bg-zinc-200 mt-1"></div>
                      }
                    </div>
                    <div class="flex-1 -mt-0.5">
                      <p class="text-sm font-semibold text-zinc-900">{{ activity.descripcion }}</p>
                      <p class="text-xs text-zinc-400 mt-0.5">{{ activity.timestamp | date:'dd/MM/yy HH:mm' }}</p>
                    </div>
                  </div>
                }

                @if (activities.length === 0) {
                  <p class="text-sm text-zinc-400 italic">Sin actividad registrada</p>
                }
              </div>
            </div>
          </div>

          <!-- Right: Summary & Contact -->
          <div class="space-y-6">
            <!-- Financial Summary -->
            <div class="card p-6">
              <p class="micro-label mb-4">Resumen Financiero</p>
              <div class="space-y-4">
                <div class="bg-zinc-50 rounded-2xl p-4 text-center">
                  <p class="text-xs text-zinc-400 mb-1">Total Gastado</p>
                  <p class="text-2xl font-extrabold text-zinc-900">{{ client.totalGastado | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-zinc-50 rounded-xl p-3 text-center">
                    <p class="text-lg font-extrabold text-zinc-900">{{ client.totalPedidos }}</p>
                    <p class="text-xs text-zinc-400">Pedidos</p>
                  </div>
                  <div class="bg-zinc-50 rounded-xl p-3 text-center">
                    <p class="text-lg font-extrabold text-zinc-900">{{ avgTicket | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                    <p class="text-xs text-zinc-400">Ticket Prom.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="card p-6">
              <p class="micro-label mb-4">Datos de Contacto</p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-lg text-zinc-400">mail</span>
                  <p class="text-sm text-zinc-900">{{ client.email }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-lg text-zinc-400">call</span>
                  <p class="text-sm text-zinc-900">{{ client.telefono }}</p>
                </div>
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-lg text-zinc-400 mt-0.5">location_on</span>
                  <div>
                    <p class="text-sm text-zinc-900">{{ client.direccion }}</p>
                    <p class="text-xs text-zinc-500">{{ client.ciudad }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="card p-6">
              <p class="micro-label mb-4">Notas Internas</p>
              @if (client.notas) {
                <p class="text-sm text-zinc-600 leading-relaxed">{{ client.notas }}</p>
              } @else {
                <p class="text-sm text-zinc-300 italic">Sin notas</p>
              }
            </div>

            <!-- Meta -->
            <div class="card p-6">
              <p class="micro-label mb-3">Información</p>
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-400">Cliente desde</span>
                  <span class="text-zinc-900 font-medium">{{ client.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                @if (client.ultimaCompra) {
                  <div class="flex justify-between text-xs">
                    <span class="text-zinc-400">Última compra</span>
                    <span class="text-zinc-900 font-medium">{{ client.ultimaCompra | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-300 mb-2">hourglass_empty</span>
          <p class="text-sm text-zinc-400">Cargando cliente...</p>
        </div>
      </div>
    }
  `,
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  orders: Order[] = [];
  activities: ClientActivity[] = [];
  avgTicket = 0;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.clientService.getClientById(id).subscribe(client => {
      this.client = client ?? null;
      if (client && client.totalPedidos > 0) {
        this.avgTicket = Math.round(client.totalGastado / client.totalPedidos);
      }
    });

    this.orderService.getOrdersByClient(id).subscribe(orders => {
      this.orders = orders;
    });

    this.clientService.getClientActivity(id).subscribe(activities => {
      this.activities = activities;
    });
  }

  get tipoLabel(): string {
    return this.client ? TIPO_CLIENTE_LABELS[this.client.tipo] : '';
  }

  get docLabel(): string {
    return this.client ? TIPO_DOCUMENTO_LABELS[this.client.tipoDocumento] : '';
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  getActivityIcon(tipo: string): string {
    const map: Record<string, string> = {
      pedido: 'shopping_bag',
      pago: 'payments',
      entrega: 'local_shipping',
      nota: 'edit_note',
      contacto: 'call',
    };
    return map[tipo] || 'circle';
  }

  getActivityColor(tipo: string): string {
    const map: Record<string, string> = {
      pedido: 'bg-zinc-100 text-zinc-600',
      pago: 'bg-emerald-50 text-emerald-600',
      entrega: 'bg-zinc-900 text-white',
      nota: 'bg-amber-50 text-amber-600',
      contacto: 'bg-zinc-100 text-zinc-600',
    };
    return map[tipo] || 'bg-zinc-100 text-zinc-600';
  }
}
