import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../core/services/stats.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ProductStat, DeliveryTimeStat } from '../../../core/models/stats.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, NgxChartsModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="page-title">Estadísticas</h1>
        <p class="text-sm text-zinc-400 mt-1">Análisis detallado del rendimiento</p>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-stagger">
        @if (deliveryTime) {
          <app-stats-card
            title="Tiempo Promedio de Entrega"
            [value]="deliveryTime.promedio"
            subtitle="En horas · Min: {{ deliveryTime.minimo }}h · Max: {{ deliveryTime.maximo }}h"
            icon="timer"
          />
        }
        <app-stats-card
          title="Tasa de Rechazo"
          [value]="rejectionRate"
          format="percent"
          subtitle="Últimos 30 días"
          icon="block"
        />
        <app-stats-card
          title="Productos Únicos"
          [value]="topProducts.length"
          subtitle="En el catálogo"
          icon="inventory_2"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Products chart -->
        <div class="card p-6">
          <p class="micro-label mb-4">Productos Más Vendidos</p>
          @if (topProducts.length > 0) {
            <div class="h-[350px]">
              <ngx-charts-bar-horizontal
                [results]="topProducts"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="false"
                [showYAxisLabel]="false"
                [gradient]="false"
                [animations]="true"
                [roundEdges]="true"
                scheme="cool"
              >
              </ngx-charts-bar-horizontal>
            </div>
          }
        </div>

        <!-- Delivery time & Rejection -->
        <div class="space-y-6">
          <div class="card p-6">
            <p class="micro-label mb-4">Distribución de Tiempos de Entrega</p>
            @if (deliveryTime) {
              <div class="flex items-end gap-8 mt-4">
                <div class="text-center flex-1">
                  <div class="h-16 bg-emerald-100 rounded-xl mb-2 flex items-end justify-center">
                    <div class="w-full bg-emerald-500 rounded-xl" [style.height.%]="(deliveryTime.minimo / deliveryTime.maximo) * 100"></div>
                  </div>
                  <p class="text-lg font-extrabold text-zinc-900">{{ deliveryTime.minimo }}h</p>
                  <p class="text-xs text-zinc-400">Mínimo</p>
                </div>
                <div class="text-center flex-1">
                  <div class="h-24 bg-zinc-100 rounded-xl mb-2 flex items-end justify-center">
                    <div class="w-full bg-zinc-900 rounded-xl" [style.height.%]="(deliveryTime.promedio / deliveryTime.maximo) * 100"></div>
                  </div>
                  <p class="text-lg font-extrabold text-zinc-900">{{ deliveryTime.promedio }}h</p>
                  <p class="text-xs text-zinc-400">Promedio</p>
                </div>
                <div class="text-center flex-1">
                  <div class="h-32 bg-rose-100 rounded-xl mb-2 flex items-end justify-center">
                    <div class="w-full bg-rose-500 rounded-xl" style="height: 100%"></div>
                  </div>
                  <p class="text-lg font-extrabold text-zinc-900">{{ deliveryTime.maximo }}h</p>
                  <p class="text-xs text-zinc-400">Máximo</p>
                </div>
              </div>
            }
          </div>

          <div class="card p-6">
            <p class="micro-label mb-4">Tasa de Rechazo</p>
            <div class="flex items-center gap-6">
              <div class="w-24 h-24 relative">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f4f4f5"
                    stroke-width="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#18181b"
                    stroke-width="3"
                    [attr.stroke-dasharray]="rejectionRate + ', 100'"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-lg font-extrabold text-zinc-900">{{ rejectionRate }}%</span>
                </div>
              </div>
              <div>
                <p class="text-sm font-semibold text-zinc-900">{{ rejectionRate }}% de pedidos rechazados</p>
                <p class="text-xs text-zinc-400 mt-1">Dentro del rango objetivo (&lt;5%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StatsComponent implements OnInit {
  topProducts: ProductStat[] = [];
  deliveryTime: DeliveryTimeStat | null = null;
  rejectionRate = 0;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getTopProducts().subscribe(data => {
      this.topProducts = data;
    });

    this.statsService.getDeliveryTimeStats().subscribe(data => {
      this.deliveryTime = data;
    });

    this.statsService.getRejectionRate().subscribe(rate => {
      this.rejectionRate = rate;
    });
  }
}
