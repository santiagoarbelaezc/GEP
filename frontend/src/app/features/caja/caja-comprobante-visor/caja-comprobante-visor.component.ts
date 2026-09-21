import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuditService } from '../../../core/services/audit.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-caja-comprobante-visor',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="fixed inset-0 w-screen h-screen bg-zinc-950 text-white flex flex-col select-none overflow-hidden font-sans z-[999999]">
      
      <!-- ── Barra Superior de Control y Navegación ── -->
      <header class="h-16 px-4 sm:px-6 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between gap-4 z-50 shrink-0">
        
        <!-- Izquierda: Botón Volver & Folio -->
        <div class="flex items-center gap-3">
          <button
            (click)="volverAlPedido()"
            class="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold border border-zinc-700 cursor-pointer active:scale-95 shadow-sm"
            title="Volver a la orden (Esc)"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span>
            <span class="hidden sm:inline">Volver a Pedido</span>
          </button>

          <div class="border-l border-zinc-800 pl-3 flex items-center gap-2.5">
            <span class="font-mono text-sm font-bold text-white tracking-wide">
              {{ order?.folio || 'Cargando...' }}
            </span>
            @if (order) {
              <app-status-badge [status]="order.estado" />
            }
          </div>
        </div>

        <!-- Centro: Datos de Cotejo Rápido -->
        @if (order) {
          <div class="hidden md:flex items-center gap-4 bg-zinc-950/80 px-4 py-1.5 rounded-xl border border-zinc-800 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-zinc-400">Total a Validar:</span>
              <span class="price-value-base text-emerald-400">
                {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
              </span>
            </div>
            <span class="text-zinc-700">•</span>
            <div class="flex items-center gap-1.5 text-zinc-300">
              <span class="material-symbols-outlined text-sm text-zinc-400">account_balance</span>
              <span>{{ order.pago?.metodo || 'Bancario' }}</span>
              <span class="font-mono text-zinc-400 text-[11px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                Ref: {{ order.pago?.referencia || 'S/R' }}
              </span>
            </div>
          </div>
        }

        <!-- Derecha: Controles de Zoom, Rotación & Aprobación -->
        <div class="flex items-center gap-2.5">
          
          <!-- Controles de Zoom HUD -->
          <div class="flex items-center bg-zinc-800/80 backdrop-blur-md rounded-xl border border-zinc-700 p-1 shadow-inner">
            <button
              type="button"
              (click)="zoomOut()"
              [disabled]="scale <= 0.6"
              class="w-8 h-8 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700/80 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Alejar (-)"
            >
              <span class="material-symbols-outlined text-base">remove</span>
            </button>

            <span class="text-xs font-mono font-bold px-2 text-white min-w-[52px] text-center">
              {{ (scale * 100).toFixed(0) }}%
            </span>

            <button
              type="button"
              (click)="zoomIn()"
              [disabled]="scale >= 5.5"
              class="w-8 h-8 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700/80 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Acercar (+)"
            >
              <span class="material-symbols-outlined text-base">add</span>
            </button>

            <button
              type="button"
              (click)="rotate()"
              class="w-8 h-8 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700/80 flex items-center justify-center border-l border-zinc-700/60 ml-0.5 pl-0.5 transition-colors cursor-pointer"
              title="Girar imagen 90°"
            >
              <span class="material-symbols-outlined text-base">rotate_right</span>
            </button>

            <button
              type="button"
              (click)="resetView()"
              class="w-8 h-8 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700/80 flex items-center justify-center transition-colors cursor-pointer"
              title="Restablecer tamaño y posición"
            >
              <span class="material-symbols-outlined text-base">restart_alt</span>
            </button>
          </div>

          <!-- Botón de Aprobación Inmediata de Pago -->
          @if (order && order.estado !== 'pago_confirmado' && order.estado !== 'en_preparacion' && order.estado !== 'en_camino' && order.estado !== 'entregado') {
            <button
              type="button"
              (click)="aprobarPagoDirecto()"
              [disabled]="!order.pago?.comprobanteUrl || guardando"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Validar comprobante y enviar orden a Bodega"
            >
              <span class="material-symbols-outlined text-base">verified</span>
              <span class="hidden sm:inline">Dar OK al Pago</span>
            </button>
          }

          <!-- Botón Cerrar (Esc) -->
          <button
            type="button"
            (click)="volverAlPedido()"
            class="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-700 cursor-pointer"
            title="Cerrar visor"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

      </header>

      <!-- ── Canvas Principal de Visualización (Zoom con scroll & Pan) ── -->
      <main
        class="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden p-0 m-0 cursor-default"
        (wheel)="onWheel($event)"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp()"
        [style.cursor]="scale > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'"
      >
        @if (loading) {
          <div class="flex flex-col items-center gap-3 text-zinc-400">
            <span class="material-symbols-outlined text-4xl animate-spin text-emerald-400">sync</span>
            <span class="text-sm font-medium">Cargando comprobante de pago...</span>
          </div>
        } @else if (order?.pago?.comprobanteUrl) {
          <img
            [src]="order!.pago!.comprobanteUrl"
            alt="Comprobante de Pago Completo"
            (dblclick)="toggleZoom()"
            [style.transform]="'translate(' + panX + 'px, ' + panY + 'px) scale(' + scale + ') rotate(' + rotation + 'deg)'"
            [style.transition]="isDragging ? 'none' : 'transform 0.12s ease-out'"
            class="max-w-[94vw] max-h-[88vh] w-auto h-auto object-contain block p-0 m-0 select-none origin-center will-change-transform drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-sm"
          />
        } @else {
          <div class="text-center p-8 max-w-md bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <span class="material-symbols-outlined text-5xl text-amber-500 mb-3 block">warning</span>
            <h3 class="text-lg font-bold text-white mb-1">Sin comprobante registrado</h3>
            <p class="text-xs text-zinc-400 mb-4">
              Este pedido no tiene un soporte de pago adjunto todavía.
            </p>
            <button
              (click)="volverAlPedido()"
              class="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors"
            >
              Regresar al Detalle del Pedido
            </button>
          </div>
        }

        <!-- ── Toast de Feedback Flotante ── -->
        @if (toastMessage) {
          <div class="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce z-50">
            <span class="material-symbols-outlined text-base">check_circle</span>
            <span>{{ toastMessage }}</span>
          </div>
        }

        <!-- ── Barra de Ayuda / Micro Guía Flotante Inferior ── -->
        <footer class="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-30">
          <div class="pointer-events-auto bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800/80 shadow-2xl text-[11px] text-zinc-300 flex items-center gap-3">
            <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span class="material-symbols-outlined text-sm">mouse</span>
              Scroll para Zoom
            </span>
            <span class="text-zinc-600">•</span>
            <span class="flex items-center gap-1.5 text-zinc-300">
              <span class="material-symbols-outlined text-sm">pan_tool</span>
              Arrastra para Mover
            </span>
            <span class="text-zinc-600">•</span>
            <span class="flex items-center gap-1.5 text-zinc-300">
              <span class="material-symbols-outlined text-sm">touch_app</span>
              Doble Clic para Alternar
            </span>
            <span class="text-zinc-600">•</span>
            <span class="text-zinc-400">Esc para volver</span>
          </div>
        </footer>

      </main>

    </div>
  `
})
export class CajaComprobanteVisorComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  guardando = false;
  toastMessage = '';

  // Motor de Zoom, Pan y Rotación
  scale = 1.0;
  panX = 0;
  panY = 0;
  rotation = 0;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadOrder(id);
      } else {
        this.loading = false;
      }
    });
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: order => {
        this.order = order || null;
        this.loading = false;
      },
      error: () => {
        this.order = null;
        this.loading = false;
      }
    });
  }

  volverAlPedido(): void {
    if (this.order) {
      this.router.navigate(['/caja/pedido', this.order.id]);
    } else {
      this.router.navigate(['/caja/operativa']);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.volverAlPedido();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === '+' || event.key === '=') {
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      this.zoomOut();
    } else if (event.key === '0' || event.key.toLowerCase() === 'r' && !event.ctrlKey) {
      if (event.key.toLowerCase() === 'r') {
        this.rotate();
      } else {
        this.resetView();
      }
    }
  }

  // ─── Lógica del Zoom con Rueda del Ratón (Scroll) ───
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const step = 0.25;
    if (event.deltaY < 0) {
      // Rueda hacia arriba -> Acercar
      this.scale = Math.min(5.5, Number((this.scale + step).toFixed(2)));
    } else {
      // Rueda hacia abajo -> Alejar
      this.scale = Math.max(0.6, Number((this.scale - step).toFixed(2)));
    }

    if (this.scale <= 1.0) {
      this.panX = 0;
      this.panY = 0;
    }
  }

  zoomIn(): void {
    this.scale = Math.min(5.5, Number((this.scale + 0.3).toFixed(2)));
  }

  zoomOut(): void {
    this.scale = Math.max(0.6, Number((this.scale - 0.3).toFixed(2)));
    if (this.scale <= 1.0) {
      this.panX = 0;
      this.panY = 0;
    }
  }

  rotate(): void {
    this.rotation = (this.rotation + 90) % 360;
  }

  resetView(): void {
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.rotation = 0;
  }

  toggleZoom(): void {
    if (this.scale > 1.0) {
      this.resetView();
    } else {
      this.scale = 2.2;
    }
  }

  // ─── Lógica de Pan / Arrastre ───
  onMouseDown(event: MouseEvent): void {
    if (this.scale > 1.0) {
      this.isDragging = true;
      this.dragStartX = event.clientX - this.panX;
      this.dragStartY = event.clientY - this.panY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.scale > 1.0) {
      this.panX = event.clientX - this.dragStartX;
      this.panY = event.clientY - this.dragStartY;
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  // ─── Aprobación Directa de Pago desde el Visor ───
  aprobarPagoDirecto(): void {
    if (!this.order) return;
    this.guardando = true;
    const currentOrder = this.order;
    const nota = `Pago aprobado directamente desde el Visor Completo de Comprobantes. Ref: ${currentOrder.pago?.referencia || 'N/A'}`;

    this.orderService.confirmAndSendToPreparation(currentOrder.id, nota).subscribe({
      next: updated => {
        if (updated) {
          this.order = updated;
        } else {
          currentOrder.estado = 'pago_confirmado';
        }
        this.guardando = false;
        this.toastMessage = '¡Pago validado con éxito! Orden enviada a Bodega.';

        this.auditService.logAction({
          usuarioId: 2,
          usuarioNombre: 'Santiago Arbelaez',
          rol: 'caja',
          accion: 'confirmar_pago',
          entidad: 'pago',
          entidadRef: currentOrder.folio,
          detalle: `Comprobante verificado en visor de pantalla completa por $${currentOrder.total.toLocaleString()}. Ref: ${currentOrder.pago?.referencia}.`,
          ip: '192.168.1.15'
        });

        setTimeout(() => {
          this.volverAlPedido();
        }, 1200);
      },
      error: () => {
        this.guardando = false;
      }
    });
  }
}
