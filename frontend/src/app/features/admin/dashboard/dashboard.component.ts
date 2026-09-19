import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsService } from '../../../core/services/stats.service';
import { OrderService } from '../../../core/services/order.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DashboardKPIs, DailyTicket } from '../../../core/models/stats.model';
import { Order } from '../../../core/models/order.model';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsCardComponent, StatusBadgeComponent, NgxChartsModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="page-title">Dashboard</h1>
        <p class="text-sm text-zinc-400 mt-1">Resumen del día · {{ today | date:'EEEE dd MMMM yyyy' }}</p>
      </div>

      <!-- KPI Cards -->
      @if (kpis) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-stagger">
          <app-stats-card
            title="Pedidos Hoy"
            [value]="kpis.pedidosHoy"
            subtitle="+12% vs ayer"
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
            subtitle="Requieren revisión"
            icon="schedule"
          />
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart -->
        <div class="lg:col-span-2 card p-6">
          <p class="micro-label mb-4">Pedidos por día · Últimos 30 días</p>
          @if (chartData.length > 0) {
            <div class="h-[280px]">
              <ngx-charts-bar-vertical
                [results]="chartData"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="false"
                [showYAxisLabel]="false"
                [gradient]="false"
                [animations]="true"
                [roundEdges]="true"
                [barPadding]="4"
                scheme="cool"
              >
              </ngx-charts-bar-vertical>
            </div>
          }
        </div>

        <!-- Recent Orders -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <p class="micro-label">Últimos Pedidos</p>
            <a routerLink="/admin/pedidos" class="text-xs font-semibold text-zinc-900 hover:underline underline-offset-2">
              Ver todos →
            </a>
          </div>

          <div class="space-y-3">
            @for (order of recentOrders; track order.id) {
              <a
                [routerLink]="['/admin/pedidos', order.id]"
                class="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <div>
                  <p class="text-sm font-semibold text-zinc-900 group-hover:text-black">{{ order.folio }}</p>
                  <p class="text-xs text-zinc-400">{{ order.cliente.nombre }}</p>
                </div>
                <div class="text-right">
                  <app-status-badge [status]="order.estado" />
                  <p class="text-xs text-zinc-400 mt-1">{{ order.total | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                </div>
              </a>
            }
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

  constructor(
    private statsService: StatsService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.statsService.getDashboardKPIs().subscribe(data => {
      this.kpis = data;
    });

    this.statsService.getTicketsPerDay(30).subscribe(data => {
      this.chartData = data;
    });

    this.orderService.getOrders().subscribe(orders => {
      this.recentOrders = orders.slice(0, 5);
    });
  }
}
