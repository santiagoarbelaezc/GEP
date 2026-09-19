import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-tv',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="min-h-screen bg-white p-6 lg:p-10">
      <!-- Header -->
      <header class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-lg font-extrabold">G</span>
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-zinc-900 tracking-tight">GEP · Pedidos en Vivo</h1>
            <p class="text-xs text-zinc-400 font-medium">Actualización automática cada 5 segundos</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span class="text-sm font-semibold text-zinc-600">En vivo</span>
          </div>
          <div class="text-right">
            <p class="text-2xl font-extrabold text-zinc-900 tabular-nums">{{ currentTime }}</p>
            <p class="text-xs text-zinc-400">{{ currentDate }}</p>
          </div>
          <button
            (click)="onLogout()"
            class="p-2 rounded-xl hover:bg-zinc-100 transition-colors ml-2"
            title="Salir"
          >
            <span class="material-symbols-outlined text-zinc-400">logout</span>
          </button>
        </div>
      </header>

      <!-- Orders Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (order of orders; track order.id; let i = $index) {
          <div
            class="card p-6 transition-all duration-500"
            [class.animate-pulse-glow]="isNew(order)"
            [style.animation-delay]="i * 0.1 + 's'"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
                <span class="text-white text-lg font-extrabold">#{{ i + 1 }}</span>
              </div>
              <app-status-badge [status]="order.estado" />
            </div>

            <p class="text-lg font-extrabold text-zinc-900 tracking-tight mb-1">{{ order.folio }}</p>
            <p class="text-sm font-medium text-zinc-600 mb-4">{{ order.cliente.nombre }}</p>

            <div class="space-y-1.5 mb-4">
              @for (item of order.items.slice(0, 3); track item.id) {
                <div class="flex items-center justify-between">
                  <span class="text-xs text-zinc-500 truncate max-w-[60%]">{{ item.nombreProducto }}</span>
                  <span class="text-xs font-semibold text-zinc-700">x{{ item.cantidad }}</span>
                </div>
              }
              @if (order.items.length > 3) {
                <p class="text-xs text-zinc-400 italic">+{{ order.items.length - 3 }} más...</p>
              }
            </div>

            <div class="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <span class="text-base font-extrabold text-zinc-900">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              <span class="text-xs text-zinc-400">{{ order.createdAt | date:'HH:mm' }}</span>
            </div>
          </div>
        }
      </div>

      @if (orders.length === 0) {
        <div class="flex flex-col items-center justify-center h-[60vh]">
          <span class="material-symbols-outlined text-7xl text-zinc-200 mb-4">inbox</span>
          <p class="text-lg font-bold text-zinc-300">Esperando nuevos pedidos...</p>
          <p class="text-sm text-zinc-300 mt-1">Los pedidos aparecerán aquí automáticamente</p>
        </div>
      }

      <!-- New order flash notification -->
      @if (flashNotification) {
        <div class="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-in-up z-50 flex items-center gap-3">
          <span class="material-symbols-outlined text-amber-400">notifications_active</span>
          <div>
            <p class="text-sm font-bold">¡Nuevo pedido!</p>
            <p class="text-xs text-zinc-300">{{ flashNotification }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class TvComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  currentTime = '';
  currentDate = '';
  flashNotification: string | null = null;

  private pollSub?: Subscription;
  private clockSub?: Subscription;
  private previousOrderIds = new Set<number>();
  private audioCtx?: AudioContext;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateClock();

    // Clock update every second
    this.clockSub = interval(1000).subscribe(() => this.updateClock());

    // Initial load
    this.loadOrders();

    // Poll every 5 seconds
    this.pollSub = interval(5000)
      .pipe(switchMap(() => this.orderService.getOrders()))
      .subscribe(orders => {
        const newOrders = orders.filter(o => !this.previousOrderIds.has(o.id));
        if (newOrders.length > 0 && this.previousOrderIds.size > 0) {
          this.playBeep();
          this.showFlash(newOrders[0].folio + ' — ' + newOrders[0].cliente.nombre);
        }
        this.orders = orders.slice(0, 12);
        orders.forEach(o => this.previousOrderIds.add(o.id));
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.clockSub?.unsubscribe();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders.slice(0, 12);
      orders.forEach(o => this.previousOrderIds.add(o.id));
    });
  }

  isNew(order: Order): boolean {
    return order.estado === 'nuevo';
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  private playBeep(): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
      oscillator.start(this.audioCtx.currentTime);
      oscillator.stop(this.audioCtx.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  }

  private showFlash(message: string): void {
    this.flashNotification = message;
    setTimeout(() => {
      this.flashNotification = null;
    }, 4000);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
