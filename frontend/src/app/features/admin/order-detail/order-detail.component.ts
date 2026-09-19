import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TimelineComponent } from '../../../shared/components/timeline/timeline.component';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, TimelineComponent],
  template: `
    @if (order) {
      <div class="animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <a routerLink="/admin/pedidos" class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 mb-2 transition-colors">
              <span class="material-symbols-outlined text-base">arrow_back</span>
              Volver a pedidos
            </a>
            <h1 class="page-title flex items-center gap-3">
              {{ order.folio }}
              <app-status-badge [status]="order.estado" />
            </h1>
            <p class="text-sm text-zinc-400 mt-1">Creado el {{ order.createdAt | date:'dd MMMM yyyy, HH:mm' }}</p>
          </div>

          <!-- Admin actions -->
          <div class="flex items-center gap-2 flex-wrap">
            <a
              [routerLink]="['/admin/trazabilidad', order.folio]"
              class="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 border border-zinc-200 hover:border-zinc-900 bg-white"
            >
              <span class="material-symbols-outlined text-base">timeline</span>
              Línea de Tiempo
            </a>

            @if (order.estado !== 'entregado' && order.estado !== 'cancelado') {
              <select
                class="select-premium text-sm py-2"
                [(ngModel)]="newStatus"
                id="status-change-select"
              >
                <option value="">Cambiar estado...</option>
                @for (status of availableStatuses; track status.value) {
                  <option [value]="status.value">{{ status.label }}</option>
                }
              </select>
              @if (newStatus) {
                <button class="btn-primary text-xs px-4 py-2" (click)="changeStatus()" id="change-status-btn">
                  Aplicar
                </button>
              }
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Client info -->
            <div class="card p-6">
              <p class="micro-label mb-4">Datos del Cliente</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-zinc-400 mb-1">Nombre</p>
                  <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.nombre }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 mb-1">Teléfono</p>
                  <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.telefono }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 mb-1">Email</p>
                  <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.email }}</p>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-zinc-100">
                <p class="text-xs text-zinc-400 mb-1">Dirección de envío</p>
                <p class="text-sm font-medium text-zinc-900">{{ order.direccionEnvio }}</p>
                <p class="text-sm text-zinc-600">{{ order.ciudad }}</p>
                @if (order.referencias) {
                  <p class="text-xs text-zinc-400 mt-1 italic">{{ order.referencias }}</p>
                }
              </div>
            </div>

            <!-- Products table -->
            <div class="card overflow-hidden">
              <div class="p-6 pb-0">
                <p class="micro-label mb-4">Productos del Pedido</p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-zinc-200 bg-zinc-50">
                      <th class="text-left px-6 py-3 micro-label">Producto</th>
                      <th class="text-left px-6 py-3 micro-label">Variante</th>
                      <th class="text-center px-6 py-3 micro-label">Cant.</th>
                      <th class="text-right px-6 py-3 micro-label">Precio</th>
                      <th class="text-right px-6 py-3 micro-label">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of order.items; track item.id) {
                      <tr class="border-b border-zinc-50">
                        <td class="px-6 py-3.5 text-sm font-medium text-zinc-900">{{ item.nombreProducto }}</td>
                        <td class="px-6 py-3.5 text-sm text-zinc-500">{{ item.nombreVariante || '—' }}</td>
                        <td class="px-6 py-3.5 text-sm text-zinc-600 text-center">{{ item.cantidad }}</td>
                        <td class="px-6 py-3.5 text-sm text-zinc-600 text-right">{{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                        <td class="px-6 py-3.5 text-sm font-semibold text-zinc-900 text-right">{{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr class="bg-zinc-50">
                      <td colspan="4" class="px-6 py-3 text-sm font-bold text-zinc-900 text-right">Total</td>
                      <td class="px-6 py-3 text-base font-extrabold text-zinc-900 text-right">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Payment proof -->
            @if (order.pago?.comprobanteUrl) {
              <div class="card p-6">
                <p class="micro-label mb-4">Comprobante de Pago</p>
                <div class="flex items-start gap-4">
                  <div class="w-40 h-56 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      [src]="order.pago!.comprobanteUrl"
                      alt="Comprobante de pago"
                      class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                      (click)="imageExpanded = !imageExpanded"
                    />
                  </div>
                  <div>
                    <p class="text-sm text-zinc-600"><span class="font-semibold">Método:</span> {{ order.pago!.metodo }}</p>
                    <p class="text-sm text-zinc-600 mt-1"><span class="font-semibold">Referencia:</span> {{ order.pago!.referencia }}</p>
                    <p class="text-sm text-zinc-600 mt-1"><span class="font-semibold">Estado:</span> {{ order.pago!.estado }}</p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Right: Timeline -->
          <div class="card p-6 h-fit">
            <p class="micro-label mb-5">Historial del Pedido</p>
            <app-timeline [events]="order.historial || []" />
          </div>
        </div>
      </div>

      <!-- Expanded image overlay -->
      @if (imageExpanded && order.pago?.comprobanteUrl) {
        <div
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          (click)="imageExpanded = false"
        >
          <img
            [src]="order.pago!.comprobanteUrl"
            alt="Comprobante ampliado"
            class="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
          />
        </div>
      }
    } @else {
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-300 mb-2">hourglass_empty</span>
          <p class="text-sm text-zinc-400">Cargando pedido...</p>
        </div>
      </div>
    }
  `,
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  newStatus = '';
  imageExpanded = false;

  statusOptions = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(id).subscribe(order => {
      this.order = order ?? null;
    });
  }

  get availableStatuses(): { value: string; label: string }[] {
    if (!this.order) return [];
    return this.statusOptions.filter(s => s.value !== this.order!.estado);
  }

  changeStatus(): void {
    if (!this.order || !this.newStatus) return;
    this.orderService
      .updateStatus(this.order.id, this.newStatus as OrderStatus, 'Cambio manual por admin')
      .subscribe(updated => {
        if (updated) {
          this.order = { ...updated };
          this.newStatus = '';
        }
      });
  }
}
