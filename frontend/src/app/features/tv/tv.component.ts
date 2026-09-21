import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
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
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white p-4 sm:p-6 lg:p-8 flex flex-col font-sans select-none overflow-x-hidden">
      
      <!-- ── Header Minimalista del Monitor TV con Reloj Prominente ── -->
      <header class="py-4 px-6 sm:px-8 bg-zinc-900/95 backdrop-blur-md rounded-3xl border border-zinc-800/80 flex items-center justify-between gap-6 mb-6 shrink-0 shadow-2xl">
        
        <!-- Logo & Título Limpio -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white text-zinc-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
            G
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                GEP &bull; PEDIDOS EN VIVO
              </h1>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest animate-pulse">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                En Vivo
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium mt-0.5">
              Plaxtilíneas &bull; Quindío
            </p>
          </div>
        </div>

        <!-- Reloj Digital Grande y Salida -->
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight leading-none drop-shadow-md">
              {{ currentTime }}
            </p>
            <p class="text-xs sm:text-sm text-emerald-400 font-bold uppercase tracking-widest mt-1.5 capitalize">
              {{ currentDate }}
            </p>
          </div>

          <button
            (click)="onLogout()"
            class="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700/80 cursor-pointer shadow-md"
            title="Cerrar sesión"
          >
            <span class="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      <!-- ── Contenedor Principal Split (Hero Grande + Cola Derecha) ── -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- LADO IZQUIERDO: PRIMER PEDIDO (HERO MASIVO Y DETALLADO)                 -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <section class="lg:col-span-7 xl:col-span-7 flex flex-col min-h-0">
          
          @if (heroOrder) {
            <div
              class="flex-1 bg-zinc-900/95 rounded-3xl border-2 border-emerald-500/60 p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.12)] animate-hero-entry"
            >
              <!-- Indicador Superior Limpio -->
              <div class="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div class="flex items-center gap-3">
                  <span class="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-zinc-950 flex items-center gap-2 shadow-md uppercase tracking-wider">
                    <span class="w-2 h-2 rounded-full bg-zinc-950 animate-ping"></span>
                    ÚLTIMO PEDIDO
                  </span>
                  <span class="text-xs text-zinc-400 font-mono">
                    {{ heroOrder.createdAt | date:'HH:mm:ss' }}
                  </span>
                </div>

                <app-status-badge [status]="heroOrder.estado" />
              </div>

              <!-- Folio, Monto y Cliente -->
              <div class="my-4">
                <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <h2 class="text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                    {{ heroOrder.folio }}
                  </h2>
                  <div class="text-right">
                    <span class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">Total</span>
                    <span class="price-value-xl text-3xl lg:text-4xl text-emerald-400 font-black">
                      {{ heroOrder.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </div>
                </div>

                <!-- Tarjeta del Cliente Simplificada -->
                <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p class="text-xl font-black text-zinc-100">{{ heroOrder.cliente.nombre }}</p>
                    <p class="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm text-emerald-400">location_on</span>
                      <strong class="text-zinc-200">{{ heroOrder.ciudad }}</strong> &bull; {{ heroOrder.direccionEnvio }}
                    </p>
                  </div>
                  
                  <div class="sm:text-right border-t sm:border-t-0 sm:border-l border-zinc-800 pt-2 sm:pt-0 sm:pl-4 shrink-0">
                    <span class="text-sm font-bold text-zinc-200 flex items-center gap-1.5 sm:justify-end">
                      <span class="material-symbols-outlined text-base text-zinc-400">payments</span>
                      {{ heroOrder.pago?.metodo || 'Transferencia' }}
                    </span>
                    <span class="text-[11px] font-mono text-zinc-400 block mt-0.5">
                      Ref: {{ heroOrder.pago?.referencia || 'Pendiente' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- ── LISTA DE PRODUCTOS QUE PIDIERON ── -->
              <div class="flex-1 flex flex-col min-h-0 mt-2">
                <div class="flex items-center justify-between mb-2.5">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-emerald-400">inventory_2</span>
                    <h3 class="text-xs font-black text-zinc-300 uppercase tracking-wider">
                      Productos Solicitados ({{ heroOrder.items.length }})
                    </h3>
                  </div>
                </div>

                <div class="space-y-2 overflow-y-auto max-h-[300px] pr-1.5 custom-scrollbar">
                  @for (item of heroOrder.items; track item.id) {
                    <div class="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex items-center justify-between gap-4">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-zinc-700">
                          x{{ item.cantidad }}
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-bold text-white truncate">{{ item.nombreProducto }}</p>
                          <p class="text-[11px] text-zinc-400 truncate">{{ item.nombreVariante }}</p>
                        </div>
                      </div>

                      <div class="text-right shrink-0">
                        <span class="price-value-sm text-white font-bold block">
                          {{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}
                        </span>
                        <span class="text-[10px] text-zinc-500 font-mono">
                          {{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }} c/u
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Footer Minimalista -->
              <div class="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Plaxtilíneas Quindío
                </span>
                <span class="font-mono text-[11px]">#{{ heroOrder.id }}</span>
              </div>

            </div>
          } @else {
            <div class="flex-1 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-12 text-center">
              <span class="material-symbols-outlined text-5xl text-zinc-600 mb-2 animate-spin">sync</span>
              <p class="text-sm text-zinc-400">Cargando pedidos en vivo...</p>
            </div>
          }

        </section>

        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- LADO DERECHO: CONTENEDORES PEQUEÑOS EN COLA CON PAGINACIÓN              -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <section class="lg:col-span-5 xl:col-span-5 flex flex-col min-h-0 bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-4 sm:p-5">
          
          <div class="flex items-center justify-between mb-3 px-1">
            <h2 class="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-emerald-400">view_agenda</span>
              En Cola ({{ queueOrders.length }})
            </h2>
            <span class="text-xs text-zinc-400 font-mono">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
          </div>

          <!-- Contenedores Pequeños Paginados -->
          <div class="flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar min-h-0">
            @for (order of paginatedQueueOrders; track order.id; let i = $index) {
              <div
                (click)="spotlightOrder(order)"
                class="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all cursor-pointer flex flex-col gap-1.5 group shadow-sm active:scale-[0.99]"
              >
                <!-- Fila 1: Folio, Posición y Estado -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-black flex items-center justify-center border border-zinc-700">
                      #{{ (currentPage - 1) * pageSize + i + 2 }}
                    </span>
                    <span class="font-mono font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                      {{ order.folio }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-zinc-400 font-mono">{{ order.createdAt | date:'HH:mm' }}</span>
                    <app-status-badge [status]="order.estado" />
                  </div>
                </div>

                <!-- Fila 2: Cliente y Ciudad -->
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-zinc-200 truncate max-w-[60%]">
                    {{ order.cliente.nombre }}
                  </span>
                  <span class="text-[11px] text-zinc-400 flex items-center gap-1 shrink-0">
                    <span class="material-symbols-outlined text-xs text-zinc-500">location_on</span>
                    {{ order.ciudad }}
                  </span>
                </div>

                <!-- Fila 3: Total y Cantidad de Productos -->
                <div class="pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <span class="text-zinc-500 text-[11px]">
                    {{ order.items.length }} {{ order.items.length === 1 ? 'producto' : 'productos' }}
                  </span>
                  <span class="price-value-sm text-emerald-400 font-black">
                    {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                  </span>
                </div>
              </div>
            }

            @if (paginatedQueueOrders.length === 0) {
              <div class="p-8 text-center bg-zinc-950/40 rounded-2xl border border-zinc-800/80 text-zinc-500 text-xs">
                No hay más pedidos en cola.
              </div>
            }
          </div>

          <!-- Paginación de la Cola -->
          <div class="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              (click)="prevPage()"
              [disabled]="currentPage === 1"
              class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold flex items-center gap-1 cursor-pointer border border-zinc-700"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
              <span>Anterior</span>
            </button>

            <div class="flex items-center gap-1">
              @for (p of pagesList; track p) {
                <button
                  type="button"
                  (click)="goToPage(p)"
                  class="w-7 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  [class]="currentPage === p ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-750 border border-zinc-700/60'"
                >
                  {{ p }}
                </button>
              }
            </div>

            <button
              type="button"
              (click)="nextPage()"
              [disabled]="currentPage >= totalPages"
              class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold flex items-center gap-1 cursor-pointer border border-zinc-700"
            >
              <span>Siguiente</span>
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

        </section>

      </div>

      <!-- ── Notificación Flotante Discreta ── -->
      @if (flashNotification) {
        <div class="fixed bottom-6 right-6 bg-emerald-500 text-zinc-950 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-400">
          <span class="material-symbols-outlined text-xl font-bold">notifications_active</span>
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider">Nuevo Pedido</p>
            <p class="text-xs font-black">{{ flashNotification }}</p>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
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

  currentTime = '';
  currentDate = '';
  flashNotification: string | null = null;

  private clockSub?: Subscription;
  private simulationSub?: Subscription;
  private audioCtx?: AudioContext;
  private nextSimulatedId = 3000;

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
    window.removeEventListener('pointerdown', this.unlockAudio);
    window.removeEventListener('keydown', this.unlockAudio);
  }

  refreshLayout(): void {
    if (this.orders.length > 0) {
      this.heroOrder = this.orders[0];
      this.queueOrders = this.orders.slice(1, 15);
    }
  }

  spotlightOrder(order: Order): void {
    this.heroOrder = order;
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
    const paymentMethods = ['Nequi', 'Bancolombia', 'Daviplata', 'Efectivo'];
    const selectedMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

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
      estado: 'nuevo',
      pago: {
        id: this.nextSimulatedId + 500,
        pedidoId: this.nextSimulatedId,
        metodo: selectedMethod,
        referencia: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        estado: 'pendiente',
        monto: total
      },
      historial: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Insertar en la primera posición (Hero)
    this.orders.unshift(newOrder);
    this.heroOrder = newOrder;
    this.queueOrders = this.orders.slice(1, 15);

    // Sonido y Flash siempre activos
    this.playCashChime();
    this.showFlashNotification(`${newOrder.folio} &bull; ${newOrder.cliente.nombre} (${newOrder.ciudad})`);
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

  private showFlashNotification(msg: string): void {
    this.flashNotification = msg;
    setTimeout(() => {
      this.flashNotification = null;
    }, 4500);
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
