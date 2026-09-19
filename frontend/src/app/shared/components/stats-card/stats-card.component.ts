import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-5">
      <div class="flex items-start justify-between mb-3">
        <p class="micro-label">{{ title }}</p>
        @if (icon) {
          <span class="material-symbols-outlined text-zinc-300 text-xl">{{ icon }}</span>
        }
      </div>
      <p class="text-2xl font-extrabold text-zinc-900 tracking-tight">{{ formattedValue }}</p>
      @if (subtitle) {
        <p class="text-xs text-zinc-400 mt-1.5">{{ subtitle }}</p>
      }
    </div>
  `,
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() format: 'number' | 'currency' | 'percent' = 'number';

  get formattedValue(): string {
    switch (this.format) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(this.value);
      case 'percent':
        return `${this.value}%`;
      default:
        return new Intl.NumberFormat('es-CO').format(this.value);
    }
  }
}
