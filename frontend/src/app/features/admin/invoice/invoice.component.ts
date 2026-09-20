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
      <div class="print:hidden mb-6 animate-fade-in">
        <a routerLink="/admin/pagos" class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 mb-3 transition-colors">
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Volver a pagos
        </a>
        <div class="flex items-center gap-3">
          <h1 class="page-title">Factura de Venta</h1>
          <button (click)="printInvoice()" class="btn-primary text-xs">
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir
          </button>
        </div>
      </div>

      <!-- Invoice Document -->
      <div class="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-2xl print:border-none print:rounded-none print:shadow-none shadow-sm p-8 print:p-0 animate-fade-in" id="invoice-content">
        <!-- Header -->
        <div class="flex items-start justify-between mb-8 pb-6 border-b border-zinc-200">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-black rounded-xl flex items-center justify-center print:bg-zinc-900">
                <span class="text-white text-sm font-extrabold">G</span>
              </div>
              <div>
                <h2 class="text-lg font-extrabold text-zinc-900">GEP</h2>
                <p class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Gestión de Empaques y Pedidos</p>
              </div>
            </div>
            <div class="mt-3 text-xs text-zinc-500 space-y-0.5">
              <p>NIT: 900.123.456-7</p>
              <p>Calle 45 #23-10, Zona Industrial</p>
              <p>Bogotá, Colombia</p>
              <p>Tel: 601 234 5678</p>
            </div>
          </div>
          <div class="text-right">
            <h3 class="text-xl font-extrabold text-zinc-900">FACTURA DE VENTA</h3>
            <p class="text-sm font-bold text-zinc-600 mt-1">{{ order.folio }}</p>
            <p class="text-xs text-zinc-400 mt-2">Fecha: {{ order.createdAt | date:'dd/MM/yyyy' }}</p>
            <p class="text-xs text-zinc-400">Hora: {{ order.createdAt | date:'HH:mm' }}</p>
          </div>
        </div>

        <!-- Client info -->
        <div class="mb-8 bg-zinc-50 rounded-xl p-5 print:bg-transparent print:border print:border-zinc-200">
          <p class="micro-label mb-3">Datos del Cliente</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-zinc-400">Nombre / Razón Social</p>
              <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.nombre }}</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400">Teléfono</p>
              <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.telefono }}</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400">Email</p>
              <p class="text-sm font-semibold text-zinc-900">{{ order.cliente.email }}</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400">Dirección de Envío</p>
              <p class="text-sm font-semibold text-zinc-900">{{ order.direccionEnvio }}, {{ order.ciudad }}</p>
            </div>
          </div>
        </div>

        <!-- Products table -->
        <div class="mb-8">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-zinc-900">
                <th class="text-left py-2 font-semibold text-zinc-900">Producto</th>
                <th class="text-left py-2 font-semibold text-zinc-900">Ref./Variante</th>
                <th class="text-center py-2 font-semibold text-zinc-900">Cant.</th>
                <th class="text-right py-2 font-semibold text-zinc-900">P. Unit.</th>
                <th class="text-right py-2 font-semibold text-zinc-900">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              @for (item of order.items; track item.id) {
                <tr class="border-b border-zinc-100">
                  <td class="py-2.5 font-medium text-zinc-900">{{ item.nombreProducto }}</td>
                  <td class="py-2.5 text-zinc-500">{{ item.nombreVariante || '—' }}</td>
                  <td class="py-2.5 text-center text-zinc-700">{{ item.cantidad }}</td>
                  <td class="py-2.5 text-right text-zinc-700">{{ item.precioUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td class="py-2.5 text-right font-semibold text-zinc-900">{{ item.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="flex justify-end mb-8">
          <div class="w-72">
            <div class="flex justify-between py-1.5 text-sm">
              <span class="text-zinc-500">Subtotal</span>
              <span class="text-zinc-900 font-medium">{{ order.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
            @if (order.descuento > 0) {
              <div class="flex justify-between py-1.5 text-sm">
                <span class="text-zinc-500">Descuento</span>
                <span class="text-emerald-600 font-medium">-{{ order.descuento | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            }
            <div class="flex justify-between py-1.5 text-sm">
              <span class="text-zinc-500">IVA (19%)</span>
              <span class="text-zinc-900 font-medium">{{ order.impuestos | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
            @if (order.costoEnvio > 0) {
              <div class="flex justify-between py-1.5 text-sm">
                <span class="text-zinc-500">Costo de Envío</span>
                <span class="text-zinc-900 font-medium">{{ order.costoEnvio | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            }
            <div class="flex justify-between py-2.5 border-t-2 border-zinc-900 mt-2">
              <span class="text-base font-extrabold text-zinc-900">TOTAL</span>
              <span class="text-base font-extrabold text-zinc-900">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Payment info -->
        @if (order.pago) {
          <div class="bg-zinc-50 rounded-xl p-5 mb-8 print:bg-transparent print:border print:border-zinc-200">
            <p class="micro-label mb-3">Información de Pago</p>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-xs text-zinc-400">Método</p>
                <p class="font-semibold text-zinc-900">{{ order.pago.metodo }}</p>
              </div>
              <div>
                <p class="text-xs text-zinc-400">Referencia</p>
                <p class="font-semibold text-zinc-900 font-mono">{{ order.pago.referencia }}</p>
              </div>
              <div>
                <p class="text-xs text-zinc-400">Estado</p>
                <p class="font-semibold capitalize" [class]="order.pago.estado === 'confirmado' ? 'text-emerald-600' : 'text-amber-600'">{{ order.pago.estado }}</p>
              </div>
            </div>
          </div>
        }

        <!-- Footer -->
        <div class="border-t border-zinc-200 pt-5 text-center">
          <p class="text-xs text-zinc-400">Esta factura se genera como soporte de la transacción comercial.</p>
          <p class="text-xs text-zinc-400 mt-1">GEP — Distribuidora de Espumas, Plásticos y Empaques</p>
          <p class="text-[10px] text-zinc-300 mt-2">Documento generado el {{ printDate | date:'dd/MM/yyyy HH:mm' }}</p>
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
    @media print {
      :host { display: block; }
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

  printInvoice(): void {
    window.print();
  }
}
