import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, Payment } from '../../../core/models/order.model';

const DEFAULT_RECEIPT_IMAGE =
  'https://res.cloudinary.com/doxdjiyvi/image/upload/v1789948206/IMG_6859_f7mhv9.png';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (order) {
      <!-- Top Action Controls (hidden on print) -->
      <div class="print:hidden mb-6 animate-fade-in max-w-6xl mx-auto">
        <div class="flex items-center justify-between">
          <a routerLink="/admin/pagos" class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 transition-colors font-medium">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Volver a pagos
          </a>
          <div class="flex items-center gap-3">
            <a [routerLink]="['/admin/factura', order.id]" class="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">receipt_long</span>
              Ver Factura
            </a>
            <button (click)="printReceipt()" class="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2 shadow-sm">
              <span class="material-symbols-outlined text-base">print</span>
              Imprimir Recibo
            </button>
          </div>
        </div>
      </div>

      <!-- Main Two-Column Layout: Left (Receipt Ticket) & Right (Interactive Comprobante Zoom) -->
      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">

        <!-- ── Left Section: Recibo de Caja (Ticket formal) ────────────────── -->
        <div class="lg:col-span-5 w-full">
          <div class="receipt-sheet bg-white border border-zinc-200 rounded-3xl print:border-none print:rounded-none shadow-sm p-7 print:p-0">
            <!-- Header -->
            <div class="text-center mb-5 pb-4 border-b border-dashed border-zinc-300">
              <div class="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-2.5 print:bg-black text-white font-extrabold text-sm shadow-xs">
                G
              </div>
              <h2 class="text-base font-extrabold text-zinc-900 tracking-tight leading-none">GEP S.A.S.</h2>
              <p class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Distribuidora de Espumas, Plásticos y Empaques</p>
              <p class="text-[11px] text-zinc-500 mt-1">NIT: 901.482.930-1 &bull; Bogotá, Colombia</p>
            </div>

            <div class="text-center mb-5">
              <span class="inline-block px-2.5 py-0.5 bg-zinc-100 rounded text-[10px] font-bold tracking-wider text-zinc-700 uppercase mb-1">
                Recibo de Caja / Comprobante
              </span>
              <h3 class="text-lg font-extrabold text-zinc-900 tracking-tight">{{ order.folio }}</h3>
              <p class="text-xs text-zinc-400 mt-0.5">Fecha: {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>

            <!-- Details -->
            <div class="space-y-2.5 mb-5 text-xs bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80">
              <div class="flex justify-between items-center">
                <span class="text-zinc-400 font-medium">Cliente</span>
                <span class="text-zinc-900 font-bold text-right truncate max-w-[65%]">{{ order.cliente.nombre }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-400 font-medium">Fecha de Pago</span>
                <span class="text-zinc-900 font-semibold">
                  {{ (currentPago.fechaRevision || order.createdAt) | date:'dd/MM/yyyy HH:mm' }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-400 font-medium">Método de Pago</span>
                <span class="text-zinc-900 font-bold">{{ currentPago.metodo }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-zinc-400 font-medium">Nº Referencia / Aprobación</span>
                <span class="text-zinc-900 font-mono font-bold">{{ currentPago.referencia }}</span>
              </div>
              @if (currentPago.revisadoPorNombre) {
                <div class="flex justify-between items-center">
                  <span class="text-zinc-400 font-medium">Verificado por</span>
                  <span class="text-emerald-700 font-semibold">{{ currentPago.revisadoPorNombre }}</span>
                </div>
              }
            </div>

            <!-- Amount Banner -->
            <div class="bg-zinc-900 rounded-2xl p-4 text-center mb-5 print:bg-black text-white shadow-sm">
              <p class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5">Total Recibido</p>
              <p class="text-2xl font-extrabold tracking-tight">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
            </div>

            <!-- Status Badge -->
            <div class="text-center mb-5">
              <span
                class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs"
                [class]="currentPago.estado === 'confirmado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
              >
                <span class="material-symbols-outlined text-sm">{{ currentPago.estado === 'confirmado' ? 'verified' : 'schedule' }}</span>
                {{ currentPago.estado === 'confirmado' ? 'TRANSACCIÓN APROBADA' : 'PAGO EN REVISIÓN' }}
              </span>
            </div>

            <!-- Footer -->
            <div class="border-t border-dashed border-zinc-300 pt-4 text-center">
              <p class="text-[11px] text-zinc-400">Este recibo digital constituye soporte formal de pago.</p>
              <p class="text-[11px] text-zinc-400">Conserve este documento ante cualquier inquietud contable.</p>
              <p class="text-[10px] text-zinc-300 mt-2">Documento generado el {{ printDate | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

        <!-- ── Right Section: Comprobante Digital con Zoom Interactivo ─────── -->
        <div class="lg:col-span-7 w-full print:hidden">
          <div class="bg-white border border-zinc-200 rounded-3xl shadow-sm p-6">
            <!-- Header bar of Comprobante -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-100">
              <div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                  <h3 class="text-sm font-bold text-zinc-900">Comprobante de Pago Digital</h3>
                </div>
                <p class="text-xs text-zinc-400 mt-0.5">
                  Ref: <span class="font-mono text-zinc-700 font-medium">{{ currentPago.referencia }}</span> &bull; {{ currentPago.metodo }}
                </p>
              </div>

              <!-- Zoom level controls & actions -->
              <div class="flex items-center gap-2">
                <div class="inline-flex items-center bg-zinc-100 p-0.5 rounded-xl text-xs font-semibold text-zinc-600">
                  <button
                    (click)="setZoomScale(1.8)"
                    class="px-2.5 py-1 rounded-lg transition-all"
                    [class]="zoomScale === 1.8 ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-zinc-900'"
                  >
                    1.8x
                  </button>
                  <button
                    (click)="setZoomScale(2.4)"
                    class="px-2.5 py-1 rounded-lg transition-all"
                    [class]="zoomScale === 2.4 ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-zinc-900'"
                  >
                    2.4x
                  </button>
                  <button
                    (click)="setZoomScale(3.2)"
                    class="px-2.5 py-1 rounded-lg transition-all"
                    [class]="zoomScale === 3.2 ? 'bg-white text-zinc-900 shadow-xs' : 'hover:text-zinc-900'"
                  >
                    3.2x
                  </button>
                </div>

                <a
                  [href]="currentPago.comprobanteUrl || defaultImage"
                  target="_blank"
                  class="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black transition-colors"
                  title="Abrir imagen original"
                >
                  <span class="material-symbols-outlined text-base">open_in_new</span>
                </a>
              </div>
            </div>

            <!-- Interactive Cursor Zoom Viewport -->
            <div
              class="relative overflow-hidden rounded-2xl bg-zinc-900/95 border border-zinc-200/80 shadow-inner select-none flex items-center justify-center p-3 cursor-crosshair group"
              style="height: 580px;"
              (mousemove)="onZoomMove($event)"
              (mouseenter)="onZoomEnter()"
              (mouseleave)="onZoomLeave()"
            >
              <img
                [src]="currentPago.comprobanteUrl || defaultImage"
                alt="Comprobante de Pago con Zoom"
                class="max-h-full w-auto max-w-[360px] object-contain rounded-xl shadow-lg transition-transform duration-75 ease-out pointer-events-none bg-white"
                [style.transform-origin]="zoomX + '% ' + zoomY + '%'"
                [style.transform]="isHovering ? 'scale(' + zoomScale + ')' : 'scale(1)'"
              />

              <!-- Floating guidance pill when not hovering -->
              @if (!isHovering) {
                <div class="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none shadow-xl border border-white/10">
                  <span class="material-symbols-outlined text-sm text-emerald-400">zoom_in</span>
                  Pasa el cursor sobre el comprobante para ampliar detalles
                </div>
              } @else {
                <!-- Active zoom level pill -->
                <div class="absolute top-4 right-4 bg-black/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5 shadow-md border border-white/10">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Lupa {{ zoomScale }}x activa
                </div>
              }
            </div>

            <!-- Bottom helper hints -->
            <div class="mt-4 flex items-center justify-between text-xs text-zinc-400 px-1">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-zinc-500">touch_app</span>
                Mueve el puntero por el comprobante para examinar número, fecha y QR
              </div>
              <span class="font-medium text-zinc-500">Resolución nativa verificada</span>
            </div>
          </div>
        </div>

      </div>
    } @else if (loading) {
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-300 animate-spin mb-2">progress_activity</span>
          <p class="text-sm text-zinc-400">Cargando recibo de pago...</p>
        </div>
      </div>
    } @else {
      <div class="max-w-md mx-auto card p-8 text-center mt-8">
        <span class="material-symbols-outlined text-5xl text-zinc-300 mb-3">receipt_long</span>
        <h3 class="text-base font-bold text-zinc-900 mb-1">Recibo no encontrado</h3>
        <p class="text-xs text-zinc-400 mb-5">No fue posible ubicar los datos para el recibo solicitado.</p>
        <a routerLink="/admin/pagos" class="btn-primary text-xs py-2 px-4">
          Volver a pagos
        </a>
      </div>
    }
  `,
  styles: [`
    @media print {
      :host {
        display: block !important;
        width: 100% !important;
      }
      .receipt-sheet {
        max-width: 480px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  `],
})
export class ReceiptComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  printDate = new Date();
  defaultImage = DEFAULT_RECEIPT_IMAGE;

  // Interactive Cursor Zoom
  zoomScale = 2.4;
  zoomX = 50;
  zoomY = 50;
  isHovering = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(id).subscribe({
      next: order => {
        this.order = order ?? null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get currentPago(): Payment {
    if (this.order?.pago) {
      return {
        ...this.order.pago,
        comprobanteUrl: this.order.pago.comprobanteUrl || DEFAULT_RECEIPT_IMAGE,
      };
    }
    return {
      id: (this.order?.id || 1) + 100,
      pedidoId: this.order?.id || 1,
      metodo: 'Transferencia Bancaria',
      referencia: `REF-${1000 + (this.order?.id || 1)}`,
      comprobanteUrl: DEFAULT_RECEIPT_IMAGE,
      estado: 'confirmado',
      monto: this.order?.total || 0,
      fechaRevision: this.order?.createdAt,
      revisadoPorNombre: 'María García',
    };
  }

  onZoomMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.zoomX = Math.max(0, Math.min(100, x));
    this.zoomY = Math.max(0, Math.min(100, y));
  }

  onZoomEnter(): void {
    this.isHovering = true;
  }

  onZoomLeave(): void {
    this.isHovering = false;
    this.zoomX = 50;
    this.zoomY = 50;
  }

  setZoomScale(scale: number): void {
    this.zoomScale = scale;
  }

  printReceipt(): void {
    window.print();
  }
}
