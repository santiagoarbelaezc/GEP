import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  DashboardKPIs,
  DailyTicket,
  ProductStat,
  DeliveryTimeStat,
} from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {

  getDashboardKPIs(): Observable<DashboardKPIs> {
    return of({
      pedidosHoy: 24,
      ticketPromedio: 187500,
      ventasDelDia: 4500000,
      pendientesPago: 7,
    }).pipe(delay(300));
  }

  getTicketsPerDay(days: number = 30): Observable<DailyTicket[]> {
    const data: DailyTicket[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      data.push({
        name: `${d.getDate()}/${d.getMonth() + 1}`,
        value: Math.floor(Math.random() * 30) + 5,
      });
    }
    return of(data).pipe(delay(400));
  }

  getTopProducts(): Observable<ProductStat[]> {
    return of([
      { name: 'Camiseta Oversize', value: 142 },
      { name: 'Hoodie Premium', value: 98 },
      { name: 'Jogger Cargo', value: 87 },
      { name: 'Gorra Snapback', value: 76 },
      { name: 'Chaqueta Bomber', value: 64 },
      { name: 'Bermuda Denim', value: 53 },
      { name: 'Medias Pack x3', value: 48 },
      { name: 'Camiseta Básica', value: 41 },
    ]).pipe(delay(300));
  }

  getDeliveryTimeStats(): Observable<DeliveryTimeStat> {
    return of({
      promedio: 38,
      minimo: 12,
      maximo: 72,
    }).pipe(delay(200));
  }

  getRejectionRate(): Observable<number> {
    return of(4.2).pipe(delay(200));
  }
}
