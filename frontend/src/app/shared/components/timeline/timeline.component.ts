import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatusHistory, ORDER_STATUS_LABELS } from '../../../core/models/order.model';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      @for (event of events; track event.id; let last = $last; let i = $index) {
        <div class="flex gap-4 pb-6" [class.pb-0]="last">
          <!-- Vertical line + dot -->
          <div class="flex flex-col items-center">
            <div
              class="w-3 h-3 rounded-full ring-4 ring-white z-10 flex-shrink-0"
              [class]="getDotColor(event.estadoNuevo)"
            ></div>
            @if (!last) {
              <div class="w-px flex-1 bg-zinc-200 mt-1"></div>
            }
          </div>

          <!-- Content -->
          <div class="flex-1 -mt-0.5">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-semibold text-zinc-900">
                  {{ getStatusLabel(event.estadoNuevo) }}
                </p>
                @if (event.nota) {
                  <p class="text-xs text-zinc-500 mt-1">{{ event.nota }}</p>
                }
              </div>
              <span class="text-xs text-zinc-400 whitespace-nowrap ml-3">
                {{ event.timestamp | date:'dd/MM HH:mm' }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">
              <span class="font-medium">{{ event.usuarioNombre }}</span>
            </p>
          </div>
        </div>
      }

      @if (events.length === 0) {
        <p class="text-sm text-zinc-400 italic">Sin historial disponible</p>
      }
    </div>
  `,
})
export class TimelineComponent {
  @Input({ required: true }) events: OrderStatusHistory[] = [];

  getStatusLabel(status: string): string {
    return (ORDER_STATUS_LABELS as Record<string, string>)[status] || status;
  }

  getDotColor(status: string): string {
    const map: Record<string, string> = {
      nuevo: 'bg-zinc-400',
      pago_pendiente: 'bg-amber-400',
      pago_en_revision: 'bg-zinc-800',
      pago_confirmado: 'bg-emerald-500',
      rechazado: 'bg-rose-500',
      en_preparacion: 'bg-zinc-600',
      en_camino: 'bg-zinc-900',
      entregado: 'bg-emerald-600',
      cancelado: 'bg-rose-500',
    };
    return map[status] || 'bg-zinc-400';
  }
}
