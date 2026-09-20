import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (order && order.pago) {
      <!-- Print controls -->
      <div class="print:hidden mb-6 animate-fade-in">
        <a routerLink="/admin/pagos" class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 mb-3 transition-colors">
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Volver a pagos
        </a>
        <div class="flex items-center gap-3">
          <h1 class="page-title">Recibo de Pago</h1>
          <button (click)="printReceipt()" class="btn-primary text-xs">
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir
          </button>
        </div>
      </div>

      <!-- Receipt Document -->
      <div class="max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl print:border-none print:rounded-none shadow-sm p-8 print:p-0 animate-fade-in">
        <!-- Header -->
        <div class="text-center mb-6 pb-5 border-b border-dashed border-zinc-300">
          <div class="w-10 h-10 bg-black rounded-xl flex items-center justify-center mx-auto mb-3 print:bg-zinc-900">
            <span class="text-white text-sm font-extrabold">G</span>
          </div>
          <h2 class="text-lg font-extrabold text-zinc-900">GEP</h2>
          <p class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Distribuidora de Espumas, Plásticos y Empaques</p>
          <p class="text-xs text-zinc-400 mt-2">NIT: 900.123.456-7</p>
        </div>

        <div class="text-center mb-6">
          <h3 class="text-base font-extrabold text-zinc-900 uppercase tracking-wider">Recibo de Pago</h3>
          <p class="text-sm text-zinc-500 mt-1">{{ order.folio }}</p>
        </div>

        <!-- Details -->
        <div class="space-y-3 mb-6 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-400">Cliente</span>
            <span class="text-zinc-900 font-semibold text-right max-w-[60%]">{{ order.cliente.nombre }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-400">Fecha de pago</span>
            <span class="text-zinc-900 font-medium">{{ order.pago!.fechaRevision ? (order.pago!.fechaRevision | date:'dd/MM/yyyy HH:mm') : (order.createdAt | date:'dd/MM/yyyy HH:mm') }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-400">Método</span>
            <span class="text-zinc-900 font-medium">{{ order.pago!.metodo }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-400">Referencia</span>
            <span class="text-zinc-900 font-mono font-medium">{{ order.pago!.referencia }}</span>
          </div>
          @if (order.pago!.revisadoPorNombre) {
            <div class="flex justify-between">
              <span class="text-zinc-400">Verificado por</span>
              <span class="text-zinc-900 font-medium">{{ order.pago!.revisadoPorNombre }}</span>
            </div>
          }
        </div>

        <!-- Amount -->
        <div class="bg-zinc-900 rounded-2xl p-5 text-center mb-6 print:bg-zinc-900">
          <p class="text-xs text-zinc-400 mb-1 uppercase tracking-widest">Monto Recibido</p>
          <p class="text-3xl font-extrabold text-white">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
        </div>

        <!-- Status -->
        <div class="text-center mb-6">
          <span class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
            [class]="order.pago!.estado === 'confirmado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
          >
            <span class="material-symbols-outlined text-base">{{ order.pago!.estado === 'confirmado' ? 'check_circle' : 'schedule' }}</span>
            {{ order.pago!.estado === 'confirmado' ? 'PAGO CONFIRMADO' : 'PAGO PENDIENTE' }}
          </span>
        </div>

        <!-- Footer -->
        <div class="border-t border-dashed border-zinc-300 pt-5 text-center">
          <p class="text-xs text-zinc-400">Este recibo es soporte de la transacción realizada.</p>
          <p class="text-xs text-zinc-400 mt-1">Conserve este documento para cualquier reclamo.</p>
          <p class="text-[10px] text-zinc-300 mt-3">Generado el {{ printDate | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-300 mb-2">hourglass_empty</span>
          <p class="text-sm text-zinc-400">Cargando recibo...</p>
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
export class ReceiptComponent implements OnInit {
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

  printReceipt(): void {
    window.print();
  }
}
