import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../core/models/order.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div
      class="card p-5 cursor-pointer hover:border-zinc-400 hover:shadow-md transition-all duration-200 group"
      (click)="cardClick.emit(order)"
    >
      <div class="flex items-start justify-between mb-3">
        <div>
          <p class="text-sm font-bold text-zinc-900 tracking-tight">{{ order.folio }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ order.createdAt | date:'dd MMM yyyy, HH:mm' }}</p>
        </div>
        <app-status-badge [status]="order.estado" />
      </div>

      <div class="mb-3">
        <p class="text-sm font-medium text-zinc-800">{{ order.cliente.nombre }}</p>
        <p class="text-xs text-zinc-400">{{ order.cliente.telefono }}</p>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-zinc-100">
        <div>
          <p class="micro-label mb-0.5">Total</p>
          <p class="text-base font-bold text-zinc-900">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
        </div>
        <div class="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-900 transition-colors">
          <span class="text-xs font-medium">{{ order.items.length }} producto{{ order.items.length > 1 ? 's' : '' }}</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class OrderCardComponent {
  @Input({ required: true }) order!: Order;
  @Output() cardClick = new EventEmitter<Order>();
}
