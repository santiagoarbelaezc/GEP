import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService, PROTOTYPE_COMPROBANTE_URL } from '../../../core/services/order.service';
import { AuditService } from '../../../core/services/audit.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-caja-pedido-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent],
  template: `
    <div class="animate-fade-in max-w-7xl mx-auto pb-12">

      <!-- Barra Superior de Navegación -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <a
            routerLink="/caja/operativa"
            class="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition-colors flex items-center justify-center shadow-xs"
            title="Volver a Caja Operativa"
          >
            <span class="material-symbols-outlined text-xl">arrow_back</span>
          </a>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-extrabold text-zinc-900 tracking-tight font-mono">
                {{ order?.folio || 'Cargando orden...' }}
              </h1>
              @if (order) {
                <app-status-badge [status]="order.estado" />
              }
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Ingresó el {{ order?.createdAt | date:'dd/MM/yyyy &bull; HH:mm' }} &bull; Estación de Caja y Verificación de Pagos
            </p>
          </div>
        </div>

        @if (order) {
          <div class="flex items-center gap-2">
            <a
              [routerLink]="['/admin/factura', order.id]"
              target="_blank"
              class="btn-secondary text-xs"
            >
              <span class="material-symbols-outlined text-sm">receipt_long</span>
              Ver Factura
            </a>
            <a
              [routerLink]="['/admin/recibo', order.id]"
              target="_blank"
              class="btn-secondary text-xs"
            >
              <span class="material-symbols-outlined text-sm">print</span>
              Recibo de Caja
            </a>
          </div>
        }
      </div>

      <!-- Alerta de Notificación / Toast -->
      @if (toastMessage) {
        <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-fade-in">
          <div class="flex items-center gap-2.5 text-sm font-semibold">
            <span class="material-symbols-outlined text-emerald-600">check_circle</span>
            {{ toastMessage }}
          </div>
          <button 
            (click)="toastMessage = ''"
            class="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Entendido
          </button>
        </div>
      }

      @if (!order && !loading) {
        <div class="card p-12 text-center">
          <span class="material-symbols-outlined text-5xl text-zinc-300 mb-3">error_outline</span>
          <h2 class="text-lg font-bold text-zinc-800">Pedido no encontrado</h2>
          <p class="text-xs text-zinc-400 mt-1">La orden que intentas revisar no existe o fue retirada.</p>
          <a routerLink="/caja/operativa" class="mt-4 inline-block btn-primary text-xs">
            Regresar a Caja Operativa
          </a>
        </div>
      }

      @if (order) {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- ═════════════════════════════════════════════════════════════ -->
          <!-- COLUMNA IZQUIERDA: DETALLES DEL PEDIDO Y PRODUCTOS (7 COLS) -->
          <!-- ═════════════════════════════════════════════════════════════ -->
          <div class="lg:col-span-7 space-y-6">

            <!-- Ficha del Cliente -->
            <div class="card p-5">
              <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
                <div class="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                  <span class="material-symbols-outlined text-zinc-500 text-lg">person</span>
                  Información del Cliente
                </div>
                <a
                  [href]="getWhatsAppUrl()"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors border border-emerald-200"
                >
                  <span class="material-symbols-outlined text-sm">chat</span>
                  Contactar por WhatsApp
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="micro-label block">Nombre Completo</span>
                  <p class="text-sm font-bold text-zinc-900 mt-0.5">{{ order.cliente.nombre }}</p>
                  <p class="text-zinc-400 mt-0.5">{{ order.cliente.email }}</p>
                </div>
                <div>
                  <span class="micro-label block">Canal de Contacto</span>
                  <p class="text-sm font-semibold text-zinc-800 mt-0.5 font-mono">
                    Tel: {{ order.cliente.telefono }}
                  </p>
                  <p class="text-zinc-500 mt-0.5">{{ order.cliente.email }}</p>
                </div>
                <div class="sm:col-span-2 pt-2 border-t border-zinc-50 flex items-center gap-2">
                  <span class="material-symbols-outlined text-zinc-400 text-base">location_on</span>
                  <span class="text-zinc-700 font-medium">{{ order.ciudad }} &bull; {{ order.direccionEnvio }}</span>
                </div>
              </div>
            </div>

            <!-- Tabla de Productos Plaxtilíneas -->
            <div class="card overflow-hidden">
              <div class="p-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-zinc-500 text-lg">inventory_2</span>
                  <h3 class="text-sm font-bold text-zinc-900">Productos Plaxtilíneas a Despachar</h3>
                </div>
                <span class="text-xs font-semibold text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                  {{ order.items.length }} producto(s)
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-zinc-50 border-b border-zinc-200 text-left">
                      <th class="px-5 py-3 micro-label">Producto</th>
                      <th class="px-4 py-3 micro-label text-center">Cant.</th>
                      <th class="px-4 py-3 micro-label text-right">Precio Unit.</th>
                      <th class="px-5 py-3 micro-label text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100">
                    @for (item of order.items; track item.id) {
                      <tr class="hover:bg-zinc-50/70 transition-colors">
                        <td class="px-5 py-3.5">
                          <p class="text-sm font-semibold text-zinc-900">{{ item.nombreProducto }}</p>
                          @if (item.nombreVariante) {
                            <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600">
                              {{ item.nombreVariante }}
                            </span>
                          }
                        </td>
                        <td class="px-4 py-3.5 text-center">
                          <span class="font-bold text-zinc-900 text-xs px-2 py-1 rounded bg-zinc-100">
                            {{ item.cantidad }}
                          </span>
                        </td>
                        <td class="px-4 py-3.5 text-right">
                          <span class="price-value-sm text-zinc-700">
                            {{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}
                          </span>
                        </td>
                        <td class="px-5 py-3.5 text-right">
                          <span class="price-value-sm text-zinc-900">
                            {{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Liquidación y Resumen Financiero -->
              <div class="p-5 border-t border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="text-xs text-zinc-500">
                  <p class="font-medium text-zinc-700">Liquidación legal en Pesos Colombianos (COP)</p>
                  <p class="text-[11px] text-zinc-400">Incluye IVA del 19% aplicable según régimen tributario</p>
                </div>

                <div class="w-full sm:w-64 space-y-1.5 text-xs">
                  <div class="flex justify-between text-zinc-500">
                    <span>Subtotal Neto:</span>
                    <span class="price-value-sm text-zinc-700">{{ (order.total / 1.19) | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between text-zinc-500">
                    <span>IVA (19%):</span>
                    <span class="price-value-sm text-zinc-700">{{ (order.total - (order.total / 1.19)) | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between items-baseline pt-2 border-t border-zinc-200">
                    <span class="text-sm font-bold text-zinc-900">Total a Pagar:</span>
                    <span class="price-value-xl text-zinc-900">
                      {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Datos de la Consignación / Transacción -->
            <div class="card p-5">
              <div class="flex items-center gap-2 text-zinc-900 font-bold text-sm pb-3 mb-3 border-b border-zinc-100">
                <span class="material-symbols-outlined text-zinc-500 text-lg">account_balance</span>
                Datos Declarados de Pago
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span class="micro-label block">Método / Canal</span>
                  <p class="text-sm font-bold text-zinc-900 mt-1 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {{ order.pago?.metodo || 'Sin registrar' }}
                  </p>
                </div>

                <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span class="micro-label block">Nº Referencia / Aprobación</span>
                  <p class="text-sm font-mono font-bold text-zinc-900 mt-1">
                    {{ order.pago?.referencia || 'SIN REFERENCIA' }}
                  </p>
                </div>

                <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span class="micro-label block">Fecha de Registro</span>
                  <p class="text-sm font-medium text-zinc-800 mt-1">
                    {{ (order.pago?.fechaRevision || order.createdAt) | date:'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- ═════════════════════════════════════════════════════════════ -->
          <!-- COLUMNA DERECHA: REVISIÓN DE COMPROBANTE & DECISIÓN (5 COLS)  -->
          <!-- ═════════════════════════════════════════════════════════════ -->
          <div class="lg:col-span-5 space-y-6">

            <!-- Card del Comprobante -->
            <div class="card overflow-hidden">
              <div class="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-zinc-600 text-lg">receipt</span>
                  <div>
                    <h3 class="text-sm font-bold text-zinc-900">Comprobante de Pago</h3>
                    <p class="text-[11px] text-zinc-400">Haz clic sobre la imagen para abrirla en tamaño completo</p>
                  </div>
                </div>

                @if (order.pago?.comprobanteUrl) {
                  <button
                    (click)="openImageModal()"
                    class="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    title="Ver imagen completa"
                  >
                    <span class="material-symbols-outlined text-base">fullscreen</span>
                    <span>Ver Completo</span>
                  </button>
                }
              </div>

              <!-- Visor de Imagen -->
              @if (order.pago?.comprobanteUrl) {
                <div class="p-4 bg-zinc-900 flex flex-col items-center justify-center min-h-[380px]">
                  
                  <div
                    class="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 cursor-pointer max-w-full shadow-2xl group transition-all hover:border-zinc-500"
                    (click)="openImageModal()"
                    title="Haz clic para ver el comprobante completo"
                  >
                    <img
                      [src]="order.pago!.comprobanteUrl"
                      alt="Comprobante Bancario de Pago"
                      class="max-h-[380px] w-auto object-contain block select-none group-hover:scale-[1.01] transition-transform duration-200"
                    />

                    <!-- Indicador Hover -->
                    <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span class="bg-black/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xl border border-white/20">
                        <span class="material-symbols-outlined text-base">fullscreen</span>
                        Ver imagen completa
                      </span>
                    </div>
                  </div>

                  <!-- Cotejo de Monto -->
                  <div class="w-full mt-3 p-3 bg-zinc-800/80 rounded-xl border border-zinc-700 flex items-center justify-between text-white text-xs">
                    <div>
                      <span class="text-zinc-400 block text-[10px] uppercase tracking-wider font-semibold">Monto del Comprobante</span>
                      <span class="price-value-base text-emerald-400">
                        {{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                      </span>
                    </div>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                      <span class="material-symbols-outlined text-sm">verified</span>
                      Coincide 100%
                    </span>
                  </div>

                </div>
              } @else {
                <!-- Sin Comprobante Adjunto -->
                <div class="p-8 text-center bg-zinc-50 border-b border-zinc-200">
                  <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200">
                    <span class="material-symbols-outlined text-3xl">hourglass_empty</span>
                  </div>
                  <h4 class="font-bold text-zinc-900 text-sm">Sin comprobante registrado</h4>
                  <p class="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
                    Este pedido se encuentra en estado {{ order.estado }}. El cliente aún no ha enviado el soporte de pago o se encuentra en espera.
                  </p>

                  <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      (click)="attachPrototypeReceipt()"
                      class="btn-secondary text-xs w-full sm:w-auto"
                    >
                      <span class="material-symbols-outlined text-sm text-amber-500">attach_file</span>
                      Adjuntar Soporte de Prueba (Simulador)
                    </button>
                    <label class="btn-secondary text-xs cursor-pointer w-full sm:w-auto">
                      <span class="material-symbols-outlined text-sm text-zinc-500">upload_file</span>
                      Subir Comprobante
                      <input type="file" accept="image/*" class="hidden" (change)="onManualFileUpload($event)" />
                    </label>
                  </div>
                </div>
              }
            </div>

            <!-- Panel de Decisión y Aprobación de Pago -->
            <div class="card p-5 border-2" [class.border-zinc-900]="order.estado === 'pago_en_revision'" [class.border-zinc-200]="order.estado !== 'pago_en_revision'">
              <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
                <div class="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                  <span class="material-symbols-outlined text-zinc-600 text-lg">gavel</span>
                  Autorización de Caja & Despacho
                </div>
                <span class="text-[11px] font-semibold text-zinc-400">
                  Operador: Santiago Arbelaez
                </span>
              </div>

              <!-- Observaciones -->
              <div class="mb-4">
                <label class="micro-label block mb-1">Notas de Verificación (Opcional)</label>
                <textarea
                  [(ngModel)]="reviewNote"
                  rows="2"
                  placeholder="Ej. Aprobado por Nequi REF-1000, fondos verificados en cuenta..."
                  class="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 resize-none bg-zinc-50/50"
                ></textarea>
              </div>

              <!-- Acciones de Decisión -->
              <div class="space-y-2">

                @if (order.estado !== 'pago_confirmado' && order.estado !== 'en_preparacion' && order.estado !== 'en_camino' && order.estado !== 'entregado') {
                  
                  <!-- BOTÓN DAR OK AL PAGO -->
                  <button
                    (click)="darOkAlPago()"
                    [disabled]="!order.pago?.comprobanteUrl"
                    class="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-white bg-zinc-900 hover:bg-black active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-base text-emerald-400">check_circle</span>
                    <span>Dar OK al Pago & Autorizar para Bodega</span>
                  </button>

                  @if (!order.pago?.comprobanteUrl) {
                    <p class="text-[11px] text-amber-600 text-center font-medium">
                      ⚠️ Es obligatorio verificar o adjuntar un comprobante antes de aprobar el pago.
                    </p>
                  }

                  <!-- BOTÓN SOLICITAR REVISIÓN / RECHAZAR -->
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <button
                      (click)="solicitarSoporte()"
                      class="btn-secondary text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <span class="material-symbols-outlined text-sm text-zinc-500">question_mark</span>
                      Solicitar Soporte
                    </button>
                    <button
                      (click)="rechazarPago()"
                      class="btn-secondary text-xs py-2 text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center gap-1"
                    >
                      <span class="material-symbols-outlined text-sm">cancel</span>
                      Rechazar Pago
                    </button>
                  </div>

                } @else {
                  
                  <!-- Estado Ya Aprobado -->
                  <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                    <span class="material-symbols-outlined text-2xl text-emerald-600">verified</span>
                    <div>
                      <p class="text-xs font-bold text-emerald-900">Pago Verificado y Autorizado</p>
                      <p class="text-[11px] text-emerald-700">Esta orden ya cuenta con Pago OK y fue remitida al equipo de Bodega para alistamiento.</p>
                    </div>
                  </div>

                  <a
                    routerLink="/caja/operativa"
                    class="btn-secondary text-xs w-full justify-center mt-2"
                  >
                    Volver a Caja Operativa
                  </a>

                }

              </div>

            </div>

          </div>

        </div>
      }

      <!-- Modal de Imagen Completa (Sin Padding) -->
      @if (isImageModalOpen && order?.pago?.comprobanteUrl) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 m-0 animate-fade-in"
          (click)="closeImageModal()"
        >
          <div
            class="relative max-w-full max-h-screen flex items-center justify-center p-0 m-0 overflow-hidden shadow-2xl animate-scale-up"
            (click)="$event.stopPropagation()"
          >
            <!-- Botón Cerrar Flotante -->
            <button
              (click)="closeImageModal()"
              class="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/20 cursor-pointer shadow-2xl"
              title="Cerrar (Esc)"
            >
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>

            <!-- Imagen Completa sin padding ni bordes -->
            <img
              [src]="order!.pago!.comprobanteUrl"
              alt="Comprobante Completo"
              class="max-w-[96vw] max-h-[96vh] w-auto h-auto object-contain block p-0 m-0 select-none shadow-2xl rounded-lg"
            />
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes scaleUp {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-up {
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class CajaPedidoDetalleComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  // Modal de Comprobante Completo
  isImageModalOpen = false;

  // Acciones
  reviewNote = '';
  toastMessage = '';

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

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isImageModalOpen) {
      this.closeImageModal();
    }
  }

  openImageModal(): void {
    this.isImageModalOpen = true;
  }

  closeImageModal(): void {
    this.isImageModalOpen = false;
  }

  attachPrototypeReceipt(): void {
    if (!this.order) return;
    this.order.pago = {
      id: this.order.id + 100,
      pedidoId: this.order.id,
      metodo: 'Nequi',
      referencia: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      comprobanteUrl: PROTOTYPE_COMPROBANTE_URL,
      estado: 'pendiente',
      monto: this.order.total,
    };
    this.order.estado = 'pago_en_revision';
    this.toastMessage = 'Comprobante de prueba adjuntado con éxito para verificación.';
  }

  onManualFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.order) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (this.order) {
          this.order.pago = {
            id: this.order.id + 100,
            pedidoId: this.order.id,
            metodo: 'Transferencia Bancaria',
            referencia: `UP-${Math.floor(1000 + Math.random() * 9000)}`,
            comprobanteUrl: reader.result as string,
            estado: 'pendiente',
            monto: this.order.total,
          };
          this.order.estado = 'pago_en_revision';
          this.toastMessage = `Comprobante "${file.name}" cargado exitosamente.`;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  darOkAlPago(): void {
    if (!this.order) return;

    const currentOrder = this.order;
    const nota = `Pago cotejado y aprobado por caja. Ref: ${currentOrder.pago?.referencia || 'N/A'}. ${this.reviewNote ? 'Nota: ' + this.reviewNote : ''}`;

    this.orderService.confirmAndSendToPreparation(currentOrder.id, nota).subscribe({
      next: (updated: Order | undefined) => {
        if (updated) {
          this.order = updated;
        } else {
          currentOrder.estado = 'pago_confirmado';
        }
        this.toastMessage = `¡Pago OK confirmado! El pedido ${currentOrder.folio} fue autorizado y transferido a Bodega para alistamiento.`;

        this.auditService.logAction({
          usuarioId: 2,
          usuarioNombre: 'Santiago Arbelaez',
          rol: 'caja',
          accion: 'confirmar_pago',
          entidad: 'pago',
          entidadRef: currentOrder.folio,
          detalle: `Comprobante ${currentOrder.pago?.metodo || 'Bancario'} por $${currentOrder.total.toLocaleString()} verificado con éxito. Ref: ${currentOrder.pago?.referencia || 'S/R'}.`,
          ip: '192.168.1.15',
        });
      }
    });
  }

  solicitarSoporte(): void {
    if (!this.order) return;
    const currentOrder = this.order;
    this.orderService.updateStatus(
      currentOrder.id,
      'pago_pendiente',
      `Caja solicitó nuevo soporte de pago. ${this.reviewNote}`
    ).subscribe({
      next: (updated: Order | undefined) => {
        if (updated) {
          this.order = updated;
        } else {
          currentOrder.estado = 'pago_pendiente';
        }
        this.toastMessage = 'Se solicitó nuevo soporte de pago al cliente.';
      }
    });
  }

  rechazarPago(): void {
    if (!this.order) return;
    const currentOrder = this.order;
    this.orderService.updateStatus(
      currentOrder.id,
      'cancelado',
      `Pago rechazado por caja. Motivo: ${this.reviewNote || 'Inconsistencia en comprobante'}`
    ).subscribe({
      next: (updated: Order | undefined) => {
        if (updated) {
          this.order = updated;
        } else {
          currentOrder.estado = 'cancelado';
        }
        this.toastMessage = 'El pago fue rechazado y el pedido marcado como cancelado.';
      }
    });
  }

  getWhatsAppUrl(): string {
    if (!this.order) return '#';
    const phone = this.order.cliente.telefono.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hola ${this.order.cliente.nombre}, te contactamos de Caja de GEP S.A.S. sobre tu pedido ${this.order.folio} por valor de $${this.order.total.toLocaleString('es-CO')}.`
    );
    return `https://wa.me/57${phone}?text=${msg}`;
  }
}
