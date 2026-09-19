import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus, ORDER_STATUS_LABELS } from '../../../core/models/order.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5" [class]="dotClass"></span>
      {{ label }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: OrderStatus;

  get label(): string {
    return ORDER_STATUS_LABELS[this.status] || this.status;
  }

  get badgeClasses(): string {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide';
    const map: Record<OrderStatus, string> = {
      nuevo: `${base} bg-zinc-100 text-zinc-700`,
      pago_pendiente: `${base} bg-amber-50 text-amber-700`,
      pago_en_revision: `${base} bg-zinc-800 text-white`,
      pago_confirmado: `${base} bg-emerald-50 text-emerald-700`,
      rechazado: `${base} bg-rose-50 text-rose-600`,
      en_preparacion: `${base} bg-zinc-200 text-zinc-800`,
      en_camino: `${base} bg-zinc-900 text-white`,
      entregado: `${base} bg-emerald-100 text-emerald-800`,
      cancelado: `${base} bg-rose-100 text-rose-700`,
    };
    return map[this.status] || `${base} bg-zinc-100 text-zinc-600`;
  }

  get dotClass(): string {
    const map: Record<OrderStatus, string> = {
      nuevo: 'bg-zinc-400',
      pago_pendiente: 'bg-amber-500',
      pago_en_revision: 'bg-white',
      pago_confirmado: 'bg-emerald-500',
      rechazado: 'bg-rose-500',
      en_preparacion: 'bg-zinc-500',
      en_camino: 'bg-white',
      entregado: 'bg-emerald-600',
      cancelado: 'bg-rose-500',
    };
    return map[this.status] || 'bg-zinc-400';
  }
}
