import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-caja-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title">Revisión de Pagos</h1>
          <p class="text-sm text-zinc-400 mt-1">{{ orders.length }} pedido{{ orders.length !== 1 ? 's' : '' }} pendientes de revisión</p>
        </div>
        @if (pendingCount > 0) {
          <span class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold">
            <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            {{ pendingCount }} pendiente{{ pendingCount > 1 ? 's' : '' }}
          </span>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (order of orders; track order.id) {
          <div
            class="card p-5 cursor-pointer hover:border-zinc-400 hover:shadow-md transition-all duration-200"
            [class.ring-2]="selectedOrder?.id === order.id"
            [class.ring-black]="selectedOrder?.id === order.id"
            (click)="selectOrder(order)"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm font-bold text-zinc-900">{{ order.folio }}</p>
                <p class="text-xs text-zinc-400">{{ order.createdAt | date:'dd/MM/yy HH:mm' }}</p>
              </div>
              <app-status-badge [status]="order.estado" />
            </div>
            <p class="text-sm font-medium text-zinc-800">{{ order.cliente.nombre }}</p>
            <p class="text-xs text-zinc-400 mb-3">{{ order.cliente.telefono }}</p>
            <div class="flex items-center justify-between pt-3 border-t border-zinc-100">
              <span class="text-sm font-bold text-zinc-900">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              <span class="text-xs text-zinc-400">{{ order.pago?.metodo || 'Sin pago' }}</span>
            </div>
          </div>
        }

        @if (orders.length === 0) {
          <div class="md:col-span-2 card p-12 text-center">
            <span class="material-symbols-outlined text-5xl text-zinc-200 mb-3">check_circle</span>
            <p class="text-sm font-semibold text-zinc-400">No hay pedidos pendientes de revisión</p>
          </div>
        }
      </div>

      <!-- Detail Panel (sliding from right) -->
      @if (selectedOrder) {
        <div class="fixed inset-0 z-40" (click)="selectedOrder = null">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        </div>
        <div class="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right border-l border-zinc-200">
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-extrabold text-zinc-900">{{ selectedOrder.folio }}</h2>
                <p class="text-xs text-zinc-400 mt-0.5">Revisión de comprobante</p>
              </div>
              <button
                (click)="selectedOrder = null"
                class="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <span class="material-symbols-outlined text-zinc-500">close</span>
              </button>
            </div>

            <!-- Client -->
            <div class="mb-6">
              <p class="micro-label mb-2">Cliente</p>
              <p class="text-sm font-semibold text-zinc-900">{{ selectedOrder.cliente.nombre }}</p>
              <p class="text-xs text-zinc-500">{{ selectedOrder.cliente.email }} · {{ selectedOrder.cliente.telefono }}</p>
            </div>

            <!-- Payment proof -->
            @if (selectedOrder.pago?.comprobanteUrl) {
              <div class="mb-6">
                <p class="micro-label mb-3">Comprobante de Pago</p>
                <div class="bg-zinc-100/70 rounded-2xl overflow-hidden p-3 flex justify-center border border-zinc-200/80">
                  <img
                    [src]="selectedOrder.pago!.comprobanteUrl"
                    alt="Comprobante de pago"
                    class="w-auto max-w-[260px] max-h-[460px] object-contain rounded-xl shadow-sm cursor-zoom-in hover:scale-[1.02] transition-transform duration-300 bg-white"
                  />
                </div>
                <div class="mt-3 grid grid-cols-2 gap-3">
                  <div class="bg-zinc-50 rounded-xl p-3">
                    <p class="text-xs text-zinc-400">Método</p>
                    <p class="text-sm font-semibold text-zinc-900">{{ selectedOrder.pago!.metodo }}</p>
                  </div>
                  <div class="bg-zinc-50 rounded-xl p-3">
                    <p class="text-xs text-zinc-400">Referencia</p>
                    <p class="text-sm font-semibold text-zinc-900">{{ selectedOrder.pago!.referencia }}</p>
                  </div>
                </div>
              </div>
            } @else {
              <div class="mb-6 bg-amber-50 rounded-2xl p-4 text-center">
                <span class="material-symbols-outlined text-amber-500 text-3xl mb-1">warning</span>
                <p class="text-sm font-semibold text-amber-700">Sin comprobante adjunto</p>
              </div>
            }

            <!-- Total -->
            <div class="bg-zinc-50 rounded-2xl p-4 mb-6 text-center">
              <p class="micro-label mb-1">Total del Pedido</p>
              <p class="text-2xl font-extrabold text-zinc-900">{{ selectedOrder.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
            </div>

            <!-- Note input -->
            <div class="mb-6">
              <label class="micro-label mb-2 block">Nota (opcional)</label>
              <textarea
                class="input-premium min-h-[80px] resize-none"
                placeholder="Agregar una nota sobre la revisión..."
                [(ngModel)]="reviewNote"
                id="review-note"
              ></textarea>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3">
              <button
                class="btn-success flex-1"
                (click)="confirmPayment()"
                id="confirm-payment-btn"
              >
                <span class="material-symbols-outlined text-lg">check_circle</span>
                Confirmar Pago
              </button>
              <button
                class="btn-danger flex-1"
                (click)="rejectPayment()"
                id="reject-payment-btn"
              >
                <span class="material-symbols-outlined text-lg">cancel</span>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.3s ease-out forwards;
    }
  `],
})
export class CajaListComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  reviewNote = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const statuses: OrderStatus[] = ['nuevo', 'pago_pendiente', 'pago_en_revision'];
    this.orderService.getOrdersByStatuses(statuses).subscribe(orders => {
      this.orders = orders;
    });
  }

  get pendingCount(): number {
    return this.orders.filter(o => o.estado === 'pago_en_revision' || o.estado === 'nuevo').length;
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.reviewNote = '';
  }

  confirmPayment(): void {
    if (!this.selectedOrder) return;
    this.orderService.confirmPayment(this.selectedOrder.id).subscribe(() => {
      this.selectedOrder = null;
      this.loadOrders();
    });
  }

  rejectPayment(): void {
    if (!this.selectedOrder) return;
    this.orderService.rejectPayment(this.selectedOrder.id, this.reviewNote || 'Rechazado por caja').subscribe(() => {
      this.selectedOrder = null;
      this.loadOrders();
    });
  }
}
