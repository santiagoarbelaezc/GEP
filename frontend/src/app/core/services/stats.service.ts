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
      pedidosHoy: 28,
      ticketPromedio: 245000,
      ventasDelDia: 6860000,
      pendientesPago: 4,
    }).pipe(delay(200));
  }

  getTicketsPerDay(days: number = 14): Observable<DailyTicket[]> {
    const data: DailyTicket[] = [];
    const now = new Date();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Values with realistic variation and weekly patterns (higher on weekdays)
    const baseValues = [14, 22, 28, 31, 26, 18, 12, 16, 25, 29, 34, 27, 21, 28];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const diaNum = String(d.getDate()).padStart(2, '0');
      const mes = meses[d.getMonth()];
      const diaSem = diasSemana[d.getDay()];

      let name: string;
      if (days <= 7) {
        name = i === 0 ? 'Hoy' : `${diaSem} ${diaNum}`;
      } else if (days <= 14) {
        name = i === 0 ? `Hoy ${diaNum}` : `${diaNum} ${mes}`;
      } else {
        name = `${diaNum} ${mes}`;
      }

      const valIndex = (days - 1 - i) % baseValues.length;
      const value = baseValues[valIndex] + Math.floor(Math.random() * 5) - 2;

      data.push({
        name,
        value: Math.max(5, value),
      });
    }
    return of(data).pipe(delay(200));
  }

  getTopProducts(): Observable<ProductStat[]> {
    return of([
      { name: 'Malla Cafetera 1x50m', value: 184 },
      { name: 'Polisombra Negra 80%', value: 162 },
      { name: 'Plástico Invernadero UV', value: 138 },
      { name: 'Espuma Poliflex D-26', value: 115 },
      { name: 'Strech Transparente', value: 98 },
      { name: 'Plástico Negro Cal. 6', value: 87 },
      { name: 'Pegante PL285 Galón', value: 74 },
      { name: 'Soga Ganadera 12mm', value: 65 },
    ]).pipe(delay(200));
  }

  getDeliveryTimeStats(): Observable<DeliveryTimeStat> {
    return of({
      promedio: 34,
      minimo: 10,
      maximo: 64,
    }).pipe(delay(200));
  }

  getRejectionRate(): Observable<number> {
    return of(2.8).pipe(delay(200));
  }
}
