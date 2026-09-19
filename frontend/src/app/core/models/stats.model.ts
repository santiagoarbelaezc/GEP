export interface DashboardKPIs {
  pedidosHoy: number;
  ticketPromedio: number;
  ventasDelDia: number;
  pendientesPago: number;
}

export interface DailyTicket {
  name: string;   // fecha formateada
  value: number;  // cantidad de pedidos
}

export interface ProductStat {
  name: string;
  value: number;
}

export interface DeliveryTimeStat {
  promedio: number;    // en horas
  minimo: number;
  maximo: number;
}

export interface StatsOverview {
  kpis: DashboardKPIs;
  ticketsPorDia: DailyTicket[];
  productosTopVendidos: ProductStat[];
  tiempoEntrega: DeliveryTimeStat;
  tasaRechazo: number; // porcentaje 0-100
}
