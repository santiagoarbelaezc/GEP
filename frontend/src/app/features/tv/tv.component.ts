import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order, OrderItem, OrderStatus, Payment } from '../../core/models/order.model';

// Catálogo de productos reales Plaxtilíneas para simulación en vivo
const SIMULATION_PRODUCTS: { nombre: string; variante: string; precio: number }[] = [
  { nombre: 'Malla Cafetera', variante: 'Rollo 1.00m x 50m / Secado Polietileno', precio: 145000 },
  { nombre: 'Polisombra Negra 80%', variante: 'Rollo 4m x 100m / Protección UV', precio: 320000 },
  { nombre: 'Plástico Negro Calibre 6', variante: 'Rollo 3m x 50m / Uso Agrícola', precio: 135000 },
  { nombre: 'Lámina Espuma Poliflex D-26', variante: '1.00m x 1.90m x 10cm / Densidad 26', precio: 115000 },
  { nombre: 'Soga Ganadera Polipropileno', variante: 'Madeja 12mm x 50m / Alta Resistencia', precio: 38000 },
  { nombre: 'Pegante de Contacto PL285', variante: 'Galón 3.785 L / Tapicería y Calzado', precio: 68000 },
  { nombre: 'Strech Industrial Transparente', variante: '50cm x 300m / Calibre 12', precio: 34000 },
  { nombre: 'Piso Estoperol Tráfico Pesado', variante: 'Rollo 1.40m x 8m / Vinilo Texturizado', precio: 390000 },
  { nombre: 'Tela Cerramiento Verde', variante: 'Rollo 2.10m x 100m / Obras y Fincas', precio: 110000 },
  { nombre: 'Plástico Invernadero 6m', variante: 'Ancho 6m x 30m / Filtro Solar UV', precio: 480000 },
];

const QUINDIO_CUSTOMERS = [
  { nombre: 'Carlos Andrés Martínez', ciudad: 'Armenia', direccion: 'Carrera 14 #19-45, Centro', tel: '311 456 7890' },
  { nombre: 'Laura Sofía Torres', ciudad: 'Calarcá', direccion: 'Calle 39 #24-15, Plaza Bolívar', tel: '312 890 1234' },
  { nombre: 'Andrés Felipe Vargas', ciudad: 'Quimbaya', direccion: 'Vía Panaca, Finca El Recuerdo', tel: '319 678 9012' },
  { nombre: 'Valentina Morales Gómez', ciudad: 'Circasia', direccion: 'Calle 7 #14-20, Alto de la Cruz', tel: '301 901 2345' },
  { nombre: 'Santiago Rojas Arbelaez', ciudad: 'Filandia', direccion: 'Calle del Tiempo Detenido #5-12', tel: '317 789 0124' },
  { nombre: 'Diana Marcela Quintero', ciudad: 'Salento', direccion: 'Calle Real #3-45, Centro', tel: '310 234 5678' },
  { nombre: 'Juan Pablo Ospina Gil', ciudad: 'Montenegro', direccion: 'Carrera 7 #18-24, Vía Parque del Café', tel: '315 345 6789' },
  { nombre: 'Cafeteros & Agro del Quindío S.A.S', ciudad: 'Armenia', direccion: 'Av. Centenario #28-15', tel: '606 745 1280' },
  { nombre: 'Glamping & Ecoturismo Valle del Cocora', ciudad: 'Salento', direccion: 'Km 4 Vía Cocora', tel: '606 759 3300' },
  { nombre: 'Cooperativa de Caficultores', ciudad: 'Quimbaya', direccion: 'Carrera 7 #12-40', tel: '606 758 2250' },
];

@Component({
  selector: 'app-tv',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen max-h-screen bg-zinc-950 text-zinc-100 p-3 lg:p-4 flex flex-col font-sans select-none overflow-hidden">
      
      <!-- ── Header Sobrio y Elegante (Estilo Admin) ── -->
      <header class="h-16 shrink-0 px-6 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 flex items-center justify-between gap-4 mb-3 shadow-lg">
        
        <!-- Logo & Título Limpio -->
        <div class="flex items-center gap-3.5">
          <div class="w-9 h-9 bg-white text-zinc-950 rounded-xl flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            G
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-sm sm:text-base font-extrabold text-white tracking-tight">
                GEP &bull; Pedidos en Vivo
              </h1>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                En Vivo
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-medium">
              Plaxtilíneas &bull; Quindío
            </p>
          </div>
        </div>

        <!-- Reloj Digital y Salida (Tipografía Admin) -->
        <div class="flex items-center gap-5">
          <div class="text-right">
            <p class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none tabular-nums">
              {{ currentTime }}
            </p>
            <p class="text-[10px] sm:text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mt-1 capitalize">
              {{ currentDate }}
            </p>
          </div>

          <button
            (click)="onLogout()"
            class="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700/60 cursor-pointer"
            title="Cerrar sesión"
          >
            <span class="material-symbols-outlined text-base">logout</span>
          </button>
        </div>
      </header>

      <!-- ── Contenedor Principal Split (100% Ajustado a la Pantalla) ── -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-0 overflow-hidden">
        
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- LADO IZQUIERDO: HERO ELEGANTE Y DETALLADO                               -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <section class="lg:col-span-7 flex flex-col min-h-0 h-full overflow-hidden">
          
          @if (heroOrder) {
            <div
              class="h-full bg-zinc-900/80 rounded-2xl border border-zinc-800 p-4 lg:p-5 flex flex-col justify-between overflow-hidden shadow-lg animate-hero-entry"
            >
              <!-- Indicador Superior Sobrio -->
              <div class="flex items-center justify-between pb-3 border-b border-zinc-800/80 shrink-0">
                <div class="flex items-center gap-2.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Último Pedido
                  </span>
                  <span class="text-xs text-zinc-400 font-medium tabular-nums">
                    {{ heroOrder.createdAt | date:'HH:mm:ss' }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Distintivo de Pago Sobrio -->
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                    [class]="getPaymentStatusInfo(heroOrder).class"
                  >
                    <span class="material-symbols-outlined text-xs">{{ getPaymentStatusInfo(heroOrder).icon }}</span>
                    <span>{{ getPaymentStatusInfo(heroOrder).label }}</span>
                  </span>
                </div>
              </div>

              <!-- Folio, Monto y Ficha del Cliente (Estilo Admin) -->
              <div class="my-2 shrink-0">
                <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <h2 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                    {{ heroOrder.folio }}
                  </h2>
                  <div class="text-right">
                    <span class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">Total a Facturar</span>
                    <span class="price-value-xl text-2xl lg:text-3xl text-white font-extrabold">
                      {{ heroOrder.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </div>
                </div>

                <!-- Tarjeta del Cliente y Método de Pago -->
                <div class="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div class="min-w-0">
                    <p class="text-sm sm:text-base font-bold text-zinc-100 truncate">{{ heroOrder.cliente.nombre }}</p>
                    <p class="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 truncate font-medium">
                      <span class="material-symbols-outlined text-sm text-zinc-400 shrink-0">location_on</span>
                      <strong class="text-zinc-300 font-semibold">{{ heroOrder.ciudad }}</strong> &bull; {{ heroOrder.direccionEnvio }}
                    </p>
                  </div>
                  
                  <div class="sm:text-right border-t sm:border-t-0 sm:border-l border-zinc-800/80 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                    <span class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 sm:justify-end">
                      <span class="material-symbols-outlined text-sm text-zinc-400">payments</span>
                      {{ heroOrder.pago?.metodo || 'Pago por Definir' }}
                    </span>
                    <span class="text-[10px] text-zinc-400 font-medium block mt-0.5">
                      {{ heroOrder.pago?.referencia ? 'Ref: ' + heroOrder.pago?.referencia : 'Sin comprobante adjunto' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- ── LISTA DE PRODUCTOS QUE PIDIERON (AMPLIADA Y ELEGANTE) ── -->
              <div class="flex-1 flex flex-col min-h-0 overflow-hidden my-1.5">
                <div class="flex items-center justify-between mb-2 shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-zinc-400">inventory_2</span>
                    <h3 class="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider">
                      Productos Solicitados ({{ heroOrder.items.length }})
                    </h3>
                  </div>
                </div>

                <div class="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                  @for (item of heroOrder.items; track item.id) {
                    <div class="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between gap-3.5">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-zinc-800/90 text-white flex items-center justify-center font-extrabold text-sm shrink-0 border border-zinc-700/60 shadow-xs">
                          x{{ item.cantidad }}
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm sm:text-base font-bold text-white truncate tracking-tight">{{ item.nombreProducto }}</p>
                          <p class="text-xs text-zinc-400 truncate mt-0.5">{{ item.nombreVariante }}</p>
                        </div>
                      </div>

                      <div class="text-right shrink-0">
                        <span class="price-value-sm text-zinc-100 font-extrabold block text-sm sm:text-base">
                          {{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}
                        </span>
                        <span class="text-[11px] text-zinc-400 font-medium">
                          {{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }} c/u
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Footer Sobrio -->
              <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
                <span class="flex items-center gap-1.5 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                  Plaxtilíneas Quindío &bull; Despacho Central
                </span>
                <span class="text-zinc-400 font-medium">#{{ heroOrder.id }}</span>
              </div>

            </div>
          } @else {
            <div class="h-full rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center p-8 text-center">
              <span class="material-symbols-outlined text-4xl text-zinc-600 mb-2 animate-spin">sync</span>
              <p class="text-xs text-zinc-400">Cargando pedidos en vivo...</p>
            </div>
          }

        </section>

        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- LADO DERECHO: CONTENEDORES PEQUEÑOS EN COLA CON PAGINACIÓN              -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <section class="lg:col-span-5 flex flex-col min-h-0 h-full overflow-hidden bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-3 sm:p-4">
          
          <div class="flex items-center justify-between mb-2 px-1 shrink-0">
            <h2 class="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm text-zinc-400">view_agenda</span>
              En Cola ({{ queueOrders.length }})
            </h2>
            <span class="text-[11px] text-zinc-400 font-medium">
              Pág. {{ currentPage }} de {{ totalPages }}
            </span>
          </div>

          <!-- Contenedores Pequeños Cuadrados Paginados (2x2) -->
          <div class="flex-1 grid grid-cols-2 grid-rows-2 gap-2.5 min-h-0 overflow-hidden">
            @for (order of paginatedQueueOrders; track order.id) {
              <div
                (click)="spotlightOrder(order)"
                class="p-3 sm:p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all cursor-pointer flex flex-col justify-between group shadow-sm active:scale-[0.99] min-h-0 overflow-hidden"
              >
                <!-- 1. Código del pedido y Estado del Pago -->
                <div class="flex items-center justify-between gap-1.5 shrink-0">
                  <span class="font-extrabold text-xs sm:text-sm text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                    {{ order.folio }}
                  </span>

                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0"
                    [class]="getPaymentBadge(order).class"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" [class]="getPaymentBadge(order).dot"></span>
                    {{ getPaymentBadge(order).shortLabel }}
                  </span>
                </div>

                <!-- 2. Nombre del cliente y Lugar -->
                <div class="my-auto py-1 min-w-0">
                  <p class="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                    {{ order.cliente.nombre }}
                  </p>
                  <p class="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 font-medium truncate">
                    <span class="material-symbols-outlined text-xs text-zinc-500 shrink-0">location_on</span>
                    {{ order.ciudad }}
                  </p>
                </div>

                <!-- 3. Valor -->
                <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between shrink-0">
                  <span class="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total</span>
                  <span class="price-value-sm text-sm sm:text-base font-extrabold text-white">
                    {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                  </span>
                </div>
              </div>
            }

            @if (paginatedQueueOrders.length === 0) {
              <div class="col-span-2 p-6 text-center bg-zinc-950/30 rounded-xl border border-zinc-800/60 text-zinc-400 text-xs flex items-center justify-center">
                No hay más pedidos en cola.
              </div>
            }
          </div>

          <!-- Paginación Compacta de la Cola (Estilo Admin) -->
          <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between shrink-0">
            <button
              type="button"
              (click)="prevPage()"
              [disabled]="currentPage === 1"
              class="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer border border-zinc-700/60"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
              <span>Ant.</span>
            </button>

            <div class="flex items-center gap-1">
              @for (p of pagesList; track p) {
                <button
                  type="button"
                  (click)="goToPage(p)"
                  class="w-6 h-6 rounded-lg text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                  [class]="currentPage === p ? 'bg-white text-zinc-950 font-bold shadow-xs' : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700/50'"
                >
                  {{ p }}
                </button>
              }
            </div>

            <button
              type="button"
              (click)="nextPage()"
              [disabled]="currentPage >= totalPages"
              class="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer border border-zinc-700/60"
            >
              <span>Sig.</span>
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

        </section>

      </div>

      <!-- ── Anuncio en Vivo Grande con Texto Mínimo (Verde Único Acento) ── -->
      @if (newOrderAlert) {
        <div class="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-alert-slide flex items-center gap-4 sm:gap-5 bg-zinc-900/95 border border-zinc-800 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl max-w-xl w-[92vw]">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <span class="material-symbols-outlined text-2xl sm:text-3xl animate-bounce">notifications_active</span>
          </div>

          <div class="min-w-0 flex-1">
            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              ¡Nuevo pedido en <span class="text-emerald-400 uppercase">{{ newOrderAlert.ciudad }}</span>!
            </h2>
            <p class="text-sm sm:text-base text-zinc-300 font-semibold mt-0.5 truncate">
              {{ newOrderAlert.cliente }} &bull; <span class="text-white font-black">{{ newOrderAlert.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </p>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes alertSlide {
      0% { opacity: 0; transform: translate(-50%, -24px) scale(0.96); }
      100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    }
    .animate-alert-slide {
      animation: alertSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes heroEntry {
      0% { opacity: 0; transform: scale(0.97) translateY(8px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-hero-entry {
      animation: heroEntry 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(24, 24, 27, 0.4);
      border-radius: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(82, 82, 91, 0.6);
      border-radius: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(161, 161, 170, 0.8);
    }
  `]
})
export class TvComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  heroOrder: Order | null = null;
  queueOrders: Order[] = [];

  // Paginación de la cola de pedidos
  currentPage = 1;
  pageSize = 4;

  currentTime = '';
  currentDate = '';
  newOrderAlert: {
    ciudad: string;
    folio: string;
    cliente: string;
    total: number;
    itemsCount: number;
  } | null = null;

  private clockSub?: Subscription;
  private simulationSub?: Subscription;
  private audioCtx?: AudioContext;
  private nextSimulatedId = 3000;
  private alertTimeout?: ReturnType<typeof setTimeout>;

  private unlockAudio = () => {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch {
      // Browser audio restriction fallback
    }
  };

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.queueOrders.length / this.pageSize));
  }

  get paginatedQueueOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.queueOrders.slice(start, start + this.pageSize);
  }

  get pagesList(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.clockSub = interval(1000).subscribe(() => this.updateClock());

    // Desbloquear audio automáticamente con cualquier toque o interacción
    window.addEventListener('pointerdown', this.unlockAudio, { once: true });
    window.addEventListener('keydown', this.unlockAudio, { once: true });

    // Cargar órdenes iniciales
    this.orderService.getOrders().subscribe(orders => {
      this.orders = [...orders];
      this.refreshLayout();
    });

    // ── Simulación Automática constante de nuevos pedidos (Cada 18 segundos) ──
    this.simulationSub = interval(18000).subscribe(() => {
      this.triggerNewSimulatedOrder();
    });
  }

  ngOnDestroy(): void {
    this.clockSub?.unsubscribe();
    this.simulationSub?.unsubscribe();
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    window.removeEventListener('pointerdown', this.unlockAudio);
    window.removeEventListener('keydown', this.unlockAudio);
  }

  refreshLayout(): void {
    if (this.orders.length > 0) {
      this.heroOrder = this.orders[0];
      this.queueOrders = this.orders.slice(1);
    }
  }

  spotlightOrder(order: Order): void {
    this.heroOrder = order;
  }

  getPaymentStatusInfo(order: Order): { label: string; class: string; icon: string } {
    if (!order.pago || order.pago.metodo === 'Pendiente' || order.estado === 'pago_pendiente' || order.estado === 'nuevo') {
      return {
        label: 'Pago Pendiente',
        class: 'bg-zinc-900/90 text-zinc-400 border-zinc-800',
        icon: 'schedule'
      };
    }
    if (order.estado === 'pago_en_revision' || order.pago.estado === 'pendiente' || order.pago.estado === 'revisado') {
      return {
        label: `En Revisión (${order.pago.metodo})`,
        class: 'bg-zinc-800 text-zinc-200 border-zinc-700/80',
        icon: 'hourglass_empty'
      };
    }
    if (order.pago.estado === 'confirmado' || order.estado === 'pago_confirmado' || order.estado === 'en_preparacion' || order.estado === 'en_camino' || order.estado === 'entregado') {
      return {
        label: `Pagado (${order.pago.metodo})`,
        class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold',
        icon: 'check_circle'
      };
    }
    return {
      label: 'Pago Pendiente',
      class: 'bg-zinc-900/90 text-zinc-400 border-zinc-800',
      icon: 'schedule'
    };
  }

  getPaymentBadge(order: Order): { shortLabel: string; class: string; icon: string; dot: string } {
    if (!order.pago || order.pago.metodo === 'Pendiente' || order.estado === 'pago_pendiente' || order.estado === 'nuevo') {
      return {
        shortLabel: 'Pago Pendiente',
        class: 'bg-zinc-900/90 text-zinc-400 border-zinc-800',
        icon: 'schedule',
        dot: 'bg-zinc-500'
      };
    }
    if (order.estado === 'pago_en_revision' || order.pago.estado === 'pendiente' || order.pago.estado === 'revisado') {
      return {
        shortLabel: 'En Revisión',
        class: 'bg-zinc-800 text-zinc-200 border-zinc-700/80',
        icon: 'hourglass_empty',
        dot: 'bg-white'
      };
    }
    if (order.pago.estado === 'confirmado' || order.estado === 'pago_confirmado' || order.estado === 'en_preparacion') {
      return {
        shortLabel: 'Pagado',
        class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold',
        icon: 'check_circle',
        dot: 'bg-emerald-400'
      };
    }
    return {
      shortLabel: 'Pago Pendiente',
      class: 'bg-zinc-900/90 text-zinc-400 border-zinc-800',
      icon: 'schedule',
      dot: 'bg-zinc-500'
    };
  }

  // ─── Generador de Simulación en Vivo Constante (Quindío & Plaxtilíneas) ───
  triggerNewSimulatedOrder(): void {
    const customer = QUINDIO_CUSTOMERS[Math.floor(Math.random() * QUINDIO_CUSTOMERS.length)];
    const numItems = 2 + Math.floor(Math.random() * 3); // 2 a 4 productos
    const items: OrderItem[] = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const prod = SIMULATION_PRODUCTS[(j + Math.floor(Math.random() * SIMULATION_PRODUCTS.length)) % SIMULATION_PRODUCTS.length];
      const cantidad = 1 + Math.floor(Math.random() * 4);
      const itemSubtotal = prod.precio * cantidad;
      subtotal += itemSubtotal;

      items.push({
        id: this.nextSimulatedId * 10 + j,
        productoId: 200 + j,
        nombreProducto: prod.nombre,
        nombreVariante: prod.variante,
        cantidad,
        precioUnitario: prod.precio,
        subtotal: itemSubtotal
      });
    }

    const impuestos = Math.round(subtotal * 0.19);
    const costoEnvio = Math.random() > 0.5 ? 25000 : 0;
    const total = subtotal + impuestos + costoEnvio;

    // Distribución realista: 55% sin pagar, 25% en revisión de soporte, 20% pagado
    const randScenario = Math.random();
    let pago: Payment | undefined = undefined;
    let estado: OrderStatus = 'nuevo';

    if (randScenario < 0.55) {
      // 55% Sin pagar / Pendiente
      estado = Math.random() > 0.5 ? 'nuevo' : 'pago_pendiente';
      pago = Math.random() > 0.4 ? {
        id: this.nextSimulatedId + 500,
        pedidoId: this.nextSimulatedId,
        metodo: 'Pendiente',
        referencia: '',
        estado: 'pendiente',
        monto: total
      } : undefined;
    } else if (randScenario < 0.80) {
      // 25% En Revisión (Cliente envió soporte de Nequi/Bancolombia/Daviplata)
      const reviewMethods = ['Nequi', 'Bancolombia', 'Daviplata'];
      const m = reviewMethods[Math.floor(Math.random() * reviewMethods.length)];
      estado = 'pago_en_revision';
      pago = {
        id: this.nextSimulatedId + 500,
        pedidoId: this.nextSimulatedId,
        metodo: m,
        referencia: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        comprobanteUrl: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1789948206/IMG_6859_f7mhv9.png',
        estado: 'pendiente',
        monto: total
      };
    } else {
      // 20% Ya aprobado y en preparación
      estado = 'en_preparacion';
      pago = {
        id: this.nextSimulatedId + 500,
        pedidoId: this.nextSimulatedId,
        metodo: 'Transferencia Bancaria',
        referencia: `OK-${Math.floor(10000 + Math.random() * 90000)}`,
        estado: 'confirmado',
        monto: total
      };
    }

    const newOrder: Order = {
      id: this.nextSimulatedId++,
      folio: `GEP-${String(2024000 + this.orders.length + 1)}`,
      clienteId: 99,
      cliente: {
        nombre: customer.nombre,
        telefono: customer.tel,
        email: customer.nombre.toLowerCase().replace(/\s+/g, '.') + '@gmail.com'
      },
      ciudad: customer.ciudad,
      direccionEnvio: customer.direccion,
      items,
      subtotal,
      descuento: 0,
      impuestos,
      costoEnvio,
      total,
      estado,
      pago,
      historial: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Insertar en la primera posición (Hero)
    this.orders.unshift(newOrder);
    this.heroOrder = newOrder;
    this.queueOrders = this.orders.slice(1);
    this.currentPage = 1;

    // Sonido y Alerta Grande en Pantalla por Ciudad
    this.playCashChime();
    this.triggerAlert(newOrder);
  }

  // ─── Efecto de Sonido Profesional (Campana de Caja Registradora) ───
  private playCashChime(): void {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const startTime = ctx.currentTime;

      // Nota 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, startTime);
      gain1.gain.setValueAtTime(0.28, startTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(startTime);
      osc1.stop(startTime + 0.35);

      // Nota 2: A5 (880.00 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, startTime + 0.1);
      gain2.gain.setValueAtTime(0.32, startTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(startTime + 0.1);
      osc2.stop(startTime + 0.55);

      // Nota 3: D6 (1174.66 Hz) - Campana brillante de caja
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1174.66, startTime + 0.2);
      gain3.gain.setValueAtTime(0.38, startTime + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(startTime + 0.2);
      osc3.stop(startTime + 0.8);

    } catch (e) {
      console.warn('Web Audio no disponible:', e);
    }
  }

  private triggerAlert(order: Order): void {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    this.newOrderAlert = {
      ciudad: order.ciudad,
      folio: order.folio,
      cliente: order.cliente.nombre,
      total: order.total,
      itemsCount: order.items.length
    };
    this.alertTimeout = setTimeout(() => {
      this.newOrderAlert = null;
    }, 6000);
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
