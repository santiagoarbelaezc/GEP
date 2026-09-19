import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-logistica-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in">
      <div class="mb-6">
        <h1 class="page-title">Entregas</h1>
        <p class="text-sm text-zinc-400 mt-1">{{ orders.length }} pedido{{ orders.length !== 1 ? 's' : '' }} por gestionar</p>
      </div>

      <!-- Tab filters -->
      <div class="flex gap-2 mb-6">
        @for (tab of tabs; track tab.status) {
          <button
            (click)="activeTab = tab.status; loadOrders()"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            [class]="activeTab === tab.status ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Orders -->
      <div class="space-y-4">
        @for (order of orders; track order.id) {
          <div class="card p-5">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <!-- Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <p class="text-sm font-bold text-zinc-900">{{ order.folio }}</p>
                  <app-status-badge [status]="order.estado" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <p class="text-xs text-zinc-400 mb-0.5">Cliente</p>
                    <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.nombre }}</p>
                    <p class="text-xs text-zinc-500">{{ order.cliente.telefono }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-zinc-400 mb-0.5">Dirección de envío</p>
                    <p class="text-sm font-medium text-zinc-900">{{ order.direccionEnvio }}</p>
                    <p class="text-xs text-zinc-500">{{ order.ciudad }}</p>
                    @if (order.referencias) {
                      <p class="text-xs text-zinc-400 italic mt-0.5">{{ order.referencias }}</p>
                    }
                  </div>
                </div>

                <div class="flex gap-3 mt-3">
                  @for (item of order.items; track item.id) {
                    <span class="inline-flex items-center px-2 py-1 bg-zinc-50 rounded-lg text-xs text-zinc-600">
                      {{ item.nombreProducto }} × {{ item.cantidad }}
                    </span>
                  }
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-2 sm:w-48 flex-shrink-0">
                @if (order.estado === 'pago_confirmado' || order.estado === 'en_preparacion') {
                  <button
                    class="btn-primary w-full text-xs"
                    (click)="markInTransit(order)"
                    [id]="'transit-btn-' + order.id"
                  >
                    <span class="material-symbols-outlined text-base">local_shipping</span>
                    Marcar en camino
                  </button>
                }
                @if (order.estado === 'en_camino') {
                  <button
                    class="btn-success w-full text-xs"
                    (click)="openDeliveryDialog(order)"
                    [id]="'deliver-btn-' + order.id"
                  >
                    <span class="material-symbols-outlined text-base">check_circle</span>
                    Marcar entregado
                  </button>
                }
                <p class="text-xs text-zinc-400 text-center">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
              </div>
            </div>
          </div>
        }

        @if (orders.length === 0) {
          <div class="card p-12 text-center">
            <span class="material-symbols-outlined text-5xl text-zinc-200 mb-3">check_circle</span>
            <p class="text-sm font-semibold text-zinc-400">No hay pedidos en esta categoría</p>
          </div>
        }
      </div>

      <!-- Delivery Photo Dialog -->
      @if (deliveryDialogOrder) {
        <div class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" (click)="deliveryDialogOrder = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-in-up" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-extrabold text-zinc-900 mb-1">Confirmar Entrega</h3>
            <p class="text-sm text-zinc-400 mb-4">{{ deliveryDialogOrder.folio }} — {{ deliveryDialogOrder.cliente.nombre }}</p>

            <!-- Photo upload -->
            <div class="mb-4">
              <p class="micro-label mb-2">Foto de entrega</p>
              @if (!photoPreview) {
                <label
                  for="delivery-photo-input"
                  class="flex flex-col items-center justify-center w-full h-48 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-2xl cursor-pointer hover:border-zinc-500 transition-colors"
                >
                  <span class="material-symbols-outlined text-3xl text-zinc-400 mb-2">add_a_photo</span>
                  <p class="text-sm text-zinc-500 font-medium">Click para tomar o subir foto</p>
                  <p class="text-xs text-zinc-400 mt-1">JPG, PNG — máx 5MB</p>
                </label>
                <input
                  type="file"
                  id="delivery-photo-input"
                  class="hidden"
                  accept="image/*"
                  capture="environment"
                  (change)="onPhotoSelected($event)"
                />
              } @else {
                <div class="relative">
                  <img
                    [src]="photoPreview"
                    alt="Preview de entrega"
                    class="w-full h-48 object-cover rounded-2xl"
                  />
                  <button
                    (click)="photoPreview = null"
                    class="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <span class="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              }
            </div>

            <div class="flex gap-3">
              <button
                class="btn-success flex-1"
                (click)="confirmDelivery()"
                [disabled]="!photoPreview"
                [class.opacity-50]="!photoPreview"
                [class.cursor-not-allowed]="!photoPreview"
                id="confirm-delivery-btn"
              >
                Confirmar Entrega
              </button>
              <button
                class="btn-secondary flex-1"
                (click)="deliveryDialogOrder = null"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LogisticaListComponent implements OnInit {
  orders: Order[] = [];
  activeTab: OrderStatus = 'pago_confirmado';
  deliveryDialogOrder: Order | null = null;
  photoPreview: string | null = null;

  tabs: { status: OrderStatus; label: string }[] = [
    { status: 'pago_confirmado', label: 'Por despachar' },
    { status: 'en_camino', label: 'En camino' },
    { status: 'entregado', label: 'Entregados' },
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const statusMap: Record<string, OrderStatus[]> = {
      pago_confirmado: ['pago_confirmado', 'en_preparacion'],
      en_camino: ['en_camino'],
      entregado: ['entregado'],
    };
    const statuses = statusMap[this.activeTab] || [this.activeTab];
    this.orderService.getOrdersByStatuses(statuses).subscribe(orders => {
      this.orders = orders;
    });
  }

  markInTransit(order: Order): void {
    this.orderService.markInTransit(order.id).subscribe(() => {
      this.loadOrders();
    });
  }

  openDeliveryDialog(order: Order): void {
    this.deliveryDialogOrder = order;
    this.photoPreview = null;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  confirmDelivery(): void {
    if (!this.deliveryDialogOrder || !this.photoPreview) return;
    this.orderService.markDelivered(this.deliveryDialogOrder.id, this.photoPreview).subscribe(() => {
      this.deliveryDialogOrder = null;
      this.photoPreview = null;
      this.loadOrders();
    });
  }
}
