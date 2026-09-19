import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { Order, OrderStatus, ORDER_STATUS_LABELS, TRACKING_STEPS } from '../../core/models/order.model';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <header class="border-b border-zinc-100 px-4 py-5">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span class="text-white text-xs font-extrabold">G</span>
          </div>
          <span class="text-sm font-bold text-zinc-900">GEP · Rastreo de Pedido</span>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-8">
        <!-- Search (only if no order loaded) -->
        @if (!order) {
          <div class="text-center mb-10 animate-fade-in">
            <span class="material-symbols-outlined text-5xl text-zinc-200 mb-4">package_2</span>
            <h1 class="text-xl font-extrabold text-zinc-900 mb-2">Rastrear tu pedido</h1>
            <p class="text-sm text-zinc-400 mb-6">Ingresa el folio de tu pedido para ver el estado actual</p>

            <div class="flex gap-3 max-w-sm mx-auto">
              <input
                type="text"
                class="input-premium flex-1"
                placeholder="Ej: GEP-2024001"
                [(ngModel)]="searchFolio"
                (keyup.enter)="searchOrder()"
                id="tracking-search-input"
              />
              <button
                class="btn-primary"
                (click)="searchOrder()"
                id="tracking-search-btn"
              >
                Buscar
              </button>
            </div>

            @if (notFound) {
              <div class="mt-4 bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl text-sm font-medium inline-flex items-center gap-2">
                <span class="material-symbols-outlined text-base">error</span>
                No se encontró ningún pedido con ese folio
              </div>
            }
          </div>
        }

        <!-- Order found -->
        @if (order) {
          <div class="animate-slide-in-up">
            <!-- Back button -->
            <button
              (click)="order = null; notFound = false"
              class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 mb-6 transition-colors"
            >
              <span class="material-symbols-outlined text-base">arrow_back</span>
              Buscar otro pedido
            </button>

            <!-- Order header -->
            <div class="text-center mb-8">
              <p class="micro-label mb-2">Pedido</p>
              <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight">{{ order.folio }}</h1>
              <p class="text-sm text-zinc-400 mt-1">{{ order.createdAt | date:'dd MMMM yyyy, HH:mm' }}</p>
            </div>

            <!-- Stepper -->
            <div class="card p-6 mb-6">
              <p class="micro-label mb-5 text-center">Estado del Pedido</p>

              <!-- Horizontal stepper -->
              <div class="flex items-center justify-between relative px-4">
                <!-- Background line -->
                <div class="absolute top-5 left-8 right-8 h-0.5 bg-zinc-200"></div>
                <div
                  class="absolute top-5 left-8 h-0.5 bg-zinc-900 transition-all duration-700"
                  [style.width]="progressWidth"
                ></div>

                @for (step of steps; track step; let i = $index) {
                  <div class="flex flex-col items-center relative z-10" [class.flex-1]="true">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                      [class]="getStepClass(i)"
                    >
                      @if (isStepCompleted(i)) {
                        <span class="material-symbols-outlined text-lg text-white">check</span>
                      } @else if (isStepActive(i)) {
                        <span class="w-3 h-3 bg-white rounded-full"></span>
                      } @else {
                        <span class="w-3 h-3 bg-zinc-300 rounded-full"></span>
                      }
                    </div>
                    <p
                      class="text-[10px] font-semibold mt-2 text-center max-w-[80px] leading-tight"
                      [class]="isStepCompleted(i) || isStepActive(i) ? 'text-zinc-900' : 'text-zinc-400'"
                    >
                      {{ getStepLabel(step) }}
                    </p>
                  </div>
                }
              </div>

              <!-- Current status message -->
              <div class="mt-6 pt-4 border-t border-zinc-100 text-center">
                <app-status-badge [status]="order.estado" />
                @if (isRejectedOrCancelled) {
                  <p class="text-sm text-rose-500 mt-2 font-medium">
                    {{ order.estado === 'rechazado' ? 'El pago fue rechazado. Contacta soporte.' : 'Este pedido ha sido cancelado.' }}
                  </p>
                }
              </div>
            </div>

            <!-- Products -->
            <div class="card p-6 mb-6">
              <p class="micro-label mb-4">Productos</p>
              <div class="space-y-3">
                @for (item of order.items; track item.id) {
                  <div class="flex items-center justify-between py-2">
                    <div>
                      <p class="text-sm font-semibold text-zinc-900">{{ item.nombreProducto }}</p>
                      @if (item.nombreVariante) {
                        <p class="text-xs text-zinc-400">{{ item.nombreVariante }}</p>
                      }
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-bold text-zinc-900">{{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                      <p class="text-xs text-zinc-400">{{ item.cantidad }} × {{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                    </div>
                  </div>
                }
              </div>
              <div class="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span class="text-sm font-bold text-zinc-900">Total</span>
                <span class="text-lg font-extrabold text-zinc-900">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            </div>

            <!-- Delivery info -->
            <div class="card p-6">
              <p class="micro-label mb-4">Entrega</p>
              <div class="space-y-2">
                <div class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-zinc-400 text-lg mt-0.5">location_on</span>
                  <div>
                    <p class="text-sm font-medium text-zinc-900">{{ order.direccionEnvio }}</p>
                    <p class="text-xs text-zinc-500">{{ order.ciudad }}</p>
                  </div>
                </div>
                @if (order.referencias) {
                  <div class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-zinc-400 text-lg mt-0.5">info</span>
                    <p class="text-xs text-zinc-500">{{ order.referencias }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </main>

      <!-- Footer -->
      <footer class="border-t border-zinc-100 px-4 py-4 mt-12">
        <p class="text-center text-xs text-zinc-300">GEP · Sistema de Gestión de Pedidos</p>
      </footer>
    </div>
  `,
})
export class TrackingComponent implements OnInit {
  order: Order | null = null;
  searchFolio = '';
  notFound = false;
  steps = TRACKING_STEPS;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const folio = this.route.snapshot.paramMap.get('folio');
    if (folio) {
      this.searchFolio = folio;
      this.searchOrder();
    }
  }

  searchOrder(): void {
    if (!this.searchFolio.trim()) return;
    this.notFound = false;
    this.orderService.getOrderByFolio(this.searchFolio.trim()).subscribe(order => {
      if (order) {
        this.order = order;
      } else {
        this.notFound = true;
      }
    });
  }

  get currentStepIndex(): number {
    if (!this.order) return -1;
    const idx = this.steps.indexOf(this.order.estado);
    if (idx >= 0) return idx;
    // Map intermediate states
    if (this.order.estado === 'pago_pendiente' || this.order.estado === 'pago_en_revision') return 0;
    return -1;
  }

  get isRejectedOrCancelled(): boolean {
    return this.order?.estado === 'rechazado' || this.order?.estado === 'cancelado';
  }

  get progressWidth(): string {
    if (this.isRejectedOrCancelled) return '0%';
    const idx = this.currentStepIndex;
    if (idx < 0) return '0%';
    const percent = (idx / (this.steps.length - 1)) * 100;
    return `${percent}%`;
  }

  isStepCompleted(index: number): boolean {
    return index < this.currentStepIndex;
  }

  isStepActive(index: number): boolean {
    return index === this.currentStepIndex;
  }

  getStepClass(index: number): string {
    if (this.isStepCompleted(index)) return 'bg-zinc-900';
    if (this.isStepActive(index)) return 'bg-zinc-900 animate-pulse-glow';
    return 'bg-zinc-100';
  }

  getStepLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] || status;
  }
}
