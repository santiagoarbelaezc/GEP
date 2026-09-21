import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsService } from '../../../core/services/stats.service';
import { OrderService } from '../../../core/services/order.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DashboardKPIs, DailyTicket } from '../../../core/models/stats.model';
import { Order } from '../../../core/models/order.model';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsCardComponent, StatusBadgeComponent, NgxChartsModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="page-title">Dashboard</h1>
        <p class="text-sm text-zinc-400 mt-1">Resumen operativo &bull; {{ today | date:'EEEE, dd MMMM yyyy' }}</p>
      </div>

      <!-- KPI Cards -->
      @if (kpis) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-stagger">
          <app-stats-card
            title="Pedidos Hoy"
            [value]="kpis.pedidosHoy"
            subtitle="+14% vs día anterior"
            icon="shopping_bag"
          />
          <app-stats-card
            title="Ticket Promedio"
            [value]="kpis.ticketPromedio"
            format="currency"
            subtitle="Últimos 30 días"
            icon="payments"
          />
          <app-stats-card
            title="Ventas del Día"
            [value]="kpis.ventasDelDia"
            format="currency"
            subtitle="Actualizado en tiempo real"
            icon="trending_up"
          />
          <app-stats-card
            title="Pendientes de Pago"
            [value]="kpis.pendientesPago"
            subtitle="Requieren revisión de caja"
            icon="schedule"
          />
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Performance Chart -->
        <div class="lg:col-span-2 card p-6">
          <!-- Chart Header & Timeframe Switcher -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-zinc-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 class="text-sm font-bold text-zinc-900">Volumen de Pedidos por Día</h3>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">
                {{ selectedDays === 7 ? 'Última semana' : selectedDays === 14 ? 'Última quincena' : 'Último mes' }} &bull; Fechas claras y datos consolidados
              </p>
            </div>

            <!-- Time Range Pills -->
            <div class="inline-flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600 self-start sm:self-auto">
              <button
                (click)="changeTimeRange(7)"
                class="px-3 py-1.5 rounded-lg transition-all"
                [class]="selectedDays === 7 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'hover:text-zinc-900'"
              >
                7 Días
              </button>
              <button
                (click)="changeTimeRange(14)"
                class="px-3 py-1.5 rounded-lg transition-all"
                [class]="selectedDays === 14 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'hover:text-zinc-900'"
              >
                14 Días
              </button>
              <button
                (click)="changeTimeRange(30)"
                class="px-3 py-1.5 rounded-lg transition-all"
                [class]="selectedDays === 30 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'hover:text-zinc-900'"
              >
                30 Días
              </button>
            </div>
          </div>

          <!-- Quick Metrics Bar -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6 p-3 bg-zinc-50/70 rounded-2xl border border-zinc-100 text-xs">
            <div>
              <span class="text-zinc-400 block text-[11px]">Total Período</span>
              <span class="font-extrabold text-zinc-900 text-sm">{{ totalOrders }} pedidos</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[11px]">Promedio Diario</span>
              <span class="font-extrabold text-zinc-900 text-sm">{{ averageOrders | number:'1.1-1' }} / día</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[11px]">Día Pico (Máximo)</span>
              <span class="font-extrabold text-emerald-700 text-sm flex items-center gap-1">
                {{ peakOrders?.value || 0 }} pedidos
                <span class="text-[10px] text-zinc-400 font-normal">({{ peakOrders?.name }})</span>
              </span>
            </div>
          </div>

          <!-- Chart Visual Area -->
          @if (chartData.length > 0) {
            <div class="h-[250px] sm:h-[300px] w-full">
              <ngx-charts-bar-vertical
                [results]="chartData"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="false"
                [showYAxisLabel]="false"
                [gradient]="false"
                [animations]="true"
                [roundEdges]="true"
                [barPadding]="barPadding"
                [customColors]="customColors"
                [scheme]="colorScheme"
                [showGridLines]="true"
              >
                <ng-template #tooltipTemplate let-model="model">
                  <div class="bg-zinc-950 text-white px-3 py-2 rounded-xl shadow-2xl border border-zinc-800 text-xs select-none">
                    <p class="text-zinc-400 text-[10.5px] uppercase tracking-wider font-semibold">{{ model.name }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span class="text-sm font-black text-white">{{ model.value }} pedidos</span>
                    </div>
                  </div>
                </ng-template>
              </ngx-charts-bar-vertical>
            </div>

            <!-- Legend explanation -->
            <div class="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded bg-zinc-900 inline-block"></span>
                  Días normales
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
                  Pico de volumen
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"></span>
                  Día de hoy
                </span>
              </div>
              <span>Actualización en tiempo real</span>
            </div>
          }
        </div>

        <!-- Recent Orders Sidebar Card -->
        <div class="card p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <p class="micro-label">Últimos Pedidos</p>
              <a routerLink="/admin/pedidos" class="text-xs font-semibold text-zinc-900 hover:underline underline-offset-2">
                Ver todos &rarr;
              </a>
            </div>

            <div class="space-y-3">
              @for (order of recentOrders; track order.id) {
                <a
                  [routerLink]="['/admin/pedidos', order.id]"
                  class="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 transition-all cursor-pointer group"
                >
                  <div class="truncate mr-2">
                    <p class="text-sm font-bold text-zinc-900 group-hover:text-black">{{ order.folio }}</p>
                    <p class="text-xs text-zinc-400 truncate">{{ order.cliente.nombre }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <app-status-badge [status]="order.estado" />
                    <p class="text-xs font-semibold text-zinc-700 mt-1">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                  </div>
                </a>
              }
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-zinc-100 text-center">
            <a routerLink="/admin/pedidos" class="btn-secondary text-xs py-2 w-full justify-center">
              Ir a Gestión de Pedidos
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  kpis: DashboardKPIs | null = null;
  chartData: DailyTicket[] = [];
  recentOrders: Order[] = [];
  today = new Date();

  // Time Range Switcher (Default: 14 días para mayor nitidez y legibilidad)
  selectedDays: 7 | 14 | 30 = 14;

  // Visual Customization
  customColors: { name: string; value: string }[] = [];
  colorScheme: Color = {
    name: 'gepMonochrome',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#18181b'],
  };

  // Metrics
  totalOrders = 0;
  averageOrders = 0;
  peakOrders: DailyTicket | null = null;

  get barPadding(): number {
    if (this.selectedDays === 7) return 24;
    if (this.selectedDays === 14) return 14;
    return 6;
  }

  constructor(
    private statsService: StatsService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.statsService.getDashboardKPIs().subscribe(data => {
      this.kpis = data;
    });

    this.loadChart(this.selectedDays);

    this.orderService.getOrders().subscribe(orders => {
      this.recentOrders = orders.slice(0, 5);
    });
  }

  changeTimeRange(days: 7 | 14 | 30): void {
    this.selectedDays = days;
    this.loadChart(days);
  }

  private loadChart(days: number): void {
    this.statsService.getTicketsPerDay(days).subscribe(data => {
      this.chartData = data;
      this.computeMetrics(data);
      this.applyPalette(data);
    });
  }

  private computeMetrics(data: DailyTicket[]): void {
    if (!data || data.length === 0) return;
    this.totalOrders = data.reduce((acc, curr) => acc + curr.value, 0);
    this.averageOrders = this.totalOrders / data.length;

    let peak = data[0];
    for (const item of data) {
      if (item.value > peak.value) {
        peak = item;
      }
    }
    this.peakOrders = peak;
  }

  private applyPalette(data: DailyTicket[]): void {
    if (!data || data.length === 0) return;

    let maxVal = Math.max(...data.map(d => d.value));

    this.customColors = data.map((d, index) => {
      // Current day (last bar)
      if (index === data.length - 1) {
        return { name: d.name, value: '#10b981' }; // Emerald highlight for today
      }
      // Peak day
      if (d.value === maxVal) {
        return { name: d.name, value: '#059669' }; // Deep emerald for record peak
      }
      // Standard days
      return { name: d.name, value: '#18181b' }; // Sleek dark zinc
    });
  }
}
