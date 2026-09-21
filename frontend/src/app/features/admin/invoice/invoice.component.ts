import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (order) {
      <!-- Print controls (hidden on print) -->
      <div class="print:hidden mb-6 animate-fade-in max-w-4xl mx-auto">
        <div class="flex items-center justify-between">
          <a routerLink="/admin/pagos" class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 transition-colors">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Volver a pagos
          </a>
          <div class="flex items-center gap-3">
            @if (isPaid) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                <span class="material-symbols-outlined text-sm">verified</span>
                Pago Confirmado
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                <span class="material-symbols-outlined text-sm">schedule</span>
                Pendiente de Pago
              </span>
            }
            <a [routerLink]="['/admin/recibo', order.id]" class="btn-secondary text-xs py-2 px-4">
              <span class="material-symbols-outlined text-base">receipt</span>
              Ver Recibo
            </a>
            <button (click)="printInvoice()" class="btn-primary text-xs py-2 px-5 flex items-center gap-2 shadow-sm">
              <span class="material-symbols-outlined text-base">print</span>
              Imprimir Factura
            </button>
          </div>
        </div>
      </div>

      <!-- Invoice Sheet (Fits exactly on 1 Letter/A4 page) -->
      <div class="invoice-sheet relative overflow-hidden max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl print:border-none print:rounded-none print:shadow-none shadow-sm p-8 print:p-0 animate-fade-in" id="invoice-content">
        
        <!-- Watermark when Paid -->
        @if (isPaid) {
          <div class="watermark-container pointer-events-none select-none" aria-hidden="true">
            <div class="watermark-stamp">
              <div class="flex items-center justify-center gap-2">
                <span class="material-symbols-outlined watermark-icon">verified</span>
                <span>PAGADO</span>
              </div>
              <div class="watermark-meta">
                <span>{{ (order.pago?.fechaRevision || order.createdAt) | date:'dd/MM/yyyy' }}</span>
                <span>&bull;</span>
                <span>{{ order.pago?.metodo || 'VERIFICADO' }}</span>
                @if (order.pago?.referencia) {
                  <span>&bull;</span>
                  <span>{{ order.pago?.referencia }}</span>
                }
              </div>
            </div>
          </div>
        }

        <!-- Header -->
        <div class="relative z-1 flex items-start justify-between pb-4 mb-4 border-b border-zinc-200">
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 print:bg-black">
              G
            </div>
            <div>
              <h2 class="text-base font-extrabold text-zinc-900 tracking-tight leading-none">GEP S.A.S.</h2>
              <p class="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">Gestión de Empaques y Plásticos</p>
              <div class="mt-1.5 text-[11px] text-zinc-500 leading-snug">
                <p>NIT: 901.482.930-1 &bull; Régimen Común</p>
                <p>Calle 45 #23-10, Zona Industrial &bull; Bogotá D.C.</p>
                <p>Tel: +57 (601) 320 4500 &bull; contacto&#64;gep-empaques.co</p>
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="flex items-center justify-end gap-1.5 mb-1">
              <span class="inline-block px-2.5 py-0.5 bg-zinc-100 print:bg-zinc-100 rounded text-[10px] font-bold tracking-wider text-zinc-700 uppercase">
                Factura de Venta
              </span>
              @if (isPaid) {
                <span class="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-extrabold tracking-wider uppercase print:bg-emerald-50 print:text-emerald-900">
                  CANCELADA
                </span>
              }
            </div>
            <h3 class="text-xl font-extrabold text-zinc-900 tracking-tight">{{ order.folio }}</h3>
            <div class="text-[11px] text-zinc-500 mt-1 space-y-0.5">
              <p><span class="text-zinc-400">Fecha Emisión:</span> {{ order.createdAt | date:'dd/MM/yyyy' }}</p>
              <p><span class="text-zinc-400">Hora:</span> {{ order.createdAt | date:'HH:mm' }}</p>
              <p><span class="text-zinc-400">Vencimiento:</span> {{ order.createdAt | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>
        </div>

        <!-- Client Information Box -->
        <div class="relative z-1 mb-4 bg-zinc-50/80 border border-zinc-200/80 rounded-xl p-3.5 print:bg-zinc-50 print:border-zinc-300">
          <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px]">
            <div>
              <span class="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider block">Adquirente / Razón Social</span>
              <span class="font-bold text-zinc-900">{{ order.cliente.nombre }}</span>
            </div>
            <div>
              <span class="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider block">Teléfono de Contacto</span>
              <span class="font-medium text-zinc-800">{{ order.cliente.telefono }}</span>
            </div>
            <div>
              <span class="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider block">Correo Electrónico</span>
              <span class="font-medium text-zinc-800">{{ order.cliente.email }}</span>
            </div>
            <div>
              <span class="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider block">Destino de Entrega</span>
              <span class="font-medium text-zinc-800">{{ order.direccionEnvio }}, {{ order.ciudad }}</span>
              @if (order.referencias) {
                <span class="text-[10.5px] text-zinc-500 block italic">({{ order.referencias }})</span>
              }
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="relative z-1 mb-4">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-zinc-900 bg-zinc-100/70 print:bg-zinc-100">
                <th class="text-left py-2 px-2.5 font-bold text-zinc-900">Descripción del Artículo</th>
                <th class="text-left py-2 px-2.5 font-bold text-zinc-700">Variante / Ref.</th>
                <th class="text-center py-2 px-2 font-bold text-zinc-900 w-16">Cant.</th>
                <th class="text-right py-2 px-2.5 font-bold text-zinc-900 w-28">Precio Unit.</th>
                <th class="text-right py-2 px-2.5 font-bold text-zinc-900 w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              @for (item of order.items; track item.id; let last = $last) {
                <tr [class.border-b]="!last" class="border-zinc-100">
                  <td class="py-2 px-2.5 font-semibold text-zinc-900">{{ item.nombreProducto }}</td>
                  <td class="py-2 px-2.5 text-zinc-600">{{ item.nombreVariante || 'Estándar' }}</td>
                  <td class="py-2 px-2 text-center font-bold text-zinc-800">{{ item.cantidad }}</td>
                  <td class="py-2 px-2.5 text-right text-zinc-700">{{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td class="py-2 px-2.5 text-right font-bold text-zinc-900">{{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Bottom Section: Payment Info (Left) & Financial Totals (Right) -->
        <div class="relative z-1 grid grid-cols-2 gap-6 items-start pb-4 border-b border-zinc-200">
          <!-- Left: Payment details & notes -->
          <div class="space-y-3">
            @if (order.pago) {
              <div class="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 print:bg-zinc-50 print:border-zinc-300">
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Detalles del Pago</p>
                <div class="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span class="text-zinc-400 block text-[10px]">Medio</span>
                    <span class="font-bold text-zinc-800">{{ order.pago.metodo }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-400 block text-[10px]">Referencia</span>
                    <span class="font-mono font-medium text-zinc-800">{{ order.pago.referencia }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-400 block text-[10px]">Estado</span>
                    <span class="font-bold capitalize" [class]="order.pago.estado === 'confirmado' ? 'text-emerald-700' : 'text-amber-700'">
                      {{ order.pago.estado }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <div class="text-[10px] text-zinc-400 leading-relaxed pl-1">
              <p class="font-semibold text-zinc-500">Términos y Condiciones:</p>
              <p>Mercancía sujeta a revisión en el momento de entrega. La firma o confirmación digital constituye aceptación a satisfacción según el Código de Comercio de Colombia Art. 772.</p>
            </div>
          </div>

          <!-- Right: Totals Breakdown -->
          <div class="bg-zinc-50/60 border border-zinc-200/70 rounded-xl p-3.5 print:bg-transparent print:border-none print:p-0">
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between text-zinc-600">
                <span>Subtotal sin impuestos</span>
                <span class="font-semibold text-zinc-800">{{ order.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              @if (order.descuento > 0) {
                <div class="flex justify-between text-emerald-700">
                  <span>Descuento aplicado</span>
                  <span class="font-semibold">-{{ order.descuento | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
              }
              <div class="flex justify-between text-zinc-600">
                <span>IVA (19.0%)</span>
                <span class="font-semibold text-zinc-800">{{ order.impuestos | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              @if (order.costoEnvio > 0) {
                <div class="flex justify-between text-zinc-600">
                  <span>Costo de Transporte y Flete</span>
                  <span class="font-semibold text-zinc-800">{{ order.costoEnvio | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                </div>
              }
              <div class="flex justify-between items-baseline pt-2 mt-1 border-t-2 border-zinc-900">
                <span class="text-sm font-extrabold text-zinc-900 tracking-tight">TOTAL A PAGAR</span>
                <span class="text-base font-extrabold text-zinc-900 tracking-tight">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="relative z-1 pt-3 flex items-center justify-between text-[10px] text-zinc-400">
          <div>
            <span class="font-medium text-zinc-600">GEP</span> &bull; Soluciones Integrales en Espumas, Plásticos y Empaques
          </div>
          <div>
            Impreso el {{ printDate | date:'dd/MM/yyyy HH:mm' }} &bull; Copia Comercial Válida
          </div>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-300 mb-2">hourglass_empty</span>
          <p class="text-sm text-zinc-400">Cargando factura...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .watermark-container {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-20deg);
      z-index: 0;
      opacity: 0.13;
      pointer-events: none;
      user-select: none;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .watermark-stamp {
      border: 5px solid #059669;
      color: #059669;
      border-radius: 20px;
      padding: 14px 40px;
      text-align: center;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      font-size: 3.25rem;
      line-height: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.08);
    }

    .watermark-icon {
      font-size: 3.2rem !important;
      line-height: 1;
    }

    .watermark-meta {
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      font-weight: 700;
      display: flex;
      gap: 8px;
      align-items: center;
      white-space: nowrap;
    }

    @media print {
      :host {
        display: block !important;
        width: 100% !important;
      }
      .invoice-sheet {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      table {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .watermark-container {
        opacity: 0.16 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .watermark-stamp {
        border-color: #059669 !important;
        color: #059669 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `],
})
export class InvoiceComponent implements OnInit {
  order: Order | null = null;
  printDate = new Date();

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

  get isPaid(): boolean {
    if (!this.order) return false;
    return (
      this.order.pago?.estado === 'confirmado' ||
      ['pago_confirmado', 'en_preparacion', 'en_camino', 'entregado'].includes(this.order.estado)
    );
  }

  printInvoice(): void {
    window.print();
  }
}
