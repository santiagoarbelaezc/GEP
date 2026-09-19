import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Order,
  OrderStatus,
  OrderStatusHistory,
  OrderItem,
  Payment,
} from '../models/order.model';

// ─── Mock Data ────────────────────────────────────────────────────────────

const MOCK_ITEMS: OrderItem[][] = [
  [
    { id: 1, productoId: 101, nombreProducto: 'Camiseta Oversize', nombreVariante: 'Negro / L', cantidad: 2, precioUnitario: 89000, subtotal: 178000 },
    { id: 2, productoId: 102, nombreProducto: 'Jogger Cargo', nombreVariante: 'Gris / M', cantidad: 1, precioUnitario: 120000, subtotal: 120000 },
  ],
  [
    { id: 3, productoId: 103, nombreProducto: 'Hoodie Premium', nombreVariante: 'Blanco / XL', cantidad: 1, precioUnitario: 175000, subtotal: 175000 },
  ],
  [
    { id: 4, productoId: 104, nombreProducto: 'Gorra Snapback', nombreVariante: 'Negro', cantidad: 3, precioUnitario: 45000, subtotal: 135000 },
    { id: 5, productoId: 105, nombreProducto: 'Medias Pack x3', nombreVariante: 'Multicolor', cantidad: 2, precioUnitario: 35000, subtotal: 70000 },
  ],
  [
    { id: 6, productoId: 106, nombreProducto: 'Chaqueta Bomber', nombreVariante: 'Negro / M', cantidad: 1, precioUnitario: 250000, subtotal: 250000 },
  ],
  [
    { id: 7, productoId: 107, nombreProducto: 'Bermuda Denim', nombreVariante: 'Azul / 32', cantidad: 1, precioUnitario: 95000, subtotal: 95000 },
    { id: 8, productoId: 108, nombreProducto: 'Camiseta Básica', nombreVariante: 'Blanco / S', cantidad: 3, precioUnitario: 55000, subtotal: 165000 },
  ],
];

function generateMockOrders(): Order[] {
  const statuses: OrderStatus[] = [
    'nuevo', 'pago_pendiente', 'pago_en_revision', 'pago_confirmado',
    'en_preparacion', 'en_camino', 'entregado', 'rechazado', 'cancelado',
  ];

  const clientes = [
    { nombre: 'Carlos Martínez', telefono: '311 456 7890', email: 'carlos@email.com' },
    { nombre: 'Ana Rodríguez', telefono: '300 123 4567', email: 'ana.r@email.com' },
    { nombre: 'Luis Gómez', telefono: '315 789 0123', email: 'luis.gomez@email.com' },
    { nombre: 'María López', telefono: '320 234 5678', email: 'maria.l@email.com' },
    { nombre: 'Pedro Sánchez', telefono: '318 567 8901', email: 'pedro.s@email.com' },
    { nombre: 'Laura Torres', telefono: '312 890 1234', email: 'laura.t@email.com' },
    { nombre: 'Diego Ramírez', telefono: '305 345 6789', email: 'diego.r@email.com' },
    { nombre: 'Sofía Herrera', telefono: '316 012 3456', email: 'sofia.h@email.com' },
    { nombre: 'Andrés Vargas', telefono: '319 678 9012', email: 'andres.v@email.com' },
    { nombre: 'Valentina Díaz', telefono: '301 901 2345', email: 'vale.d@email.com' },
    { nombre: 'Julián Castro', telefono: '313 456 7891', email: 'julian.c@email.com' },
    { nombre: 'Camila Moreno', telefono: '302 123 4568', email: 'cami.m@email.com' },
    { nombre: 'Santiago Rojas', telefono: '317 789 0124', email: 'santi.r@email.com' },
    { nombre: 'Daniela Jiménez', telefono: '314 234 5679', email: 'dani.j@email.com' },
    { nombre: 'Felipe Ortiz', telefono: '310 567 8902', email: 'felipe.o@email.com' },
  ];

  const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'];
  const direcciones = [
    'Calle 85 #15-40, Apto 302',
    'Carrera 7 #120-35, Torre B',
    'Av. El Poblado #10A-25',
    'Calle 72 #9-55, Local 3',
    'Transversal 39 #24-180',
    'Diagonal 48 #15-60, Casa 12',
    'Carrera 43A #1S-50, Ofc 401',
    'Calle 100 #19-61, Piso 8',
  ];

  const now = new Date();
  const orders: Order[] = [];

  for (let i = 0; i < 18; i++) {
    const items = MOCK_ITEMS[i % MOCK_ITEMS.length];
    const total = items.reduce((sum, it) => sum + it.subtotal, 0);
    const estado = statuses[i % statuses.length];
    const createdAt = new Date(now.getTime() - (i * 3600000 + Math.random() * 7200000));

    const pago: Payment | undefined =
      ['pago_en_revision', 'pago_confirmado', 'en_preparacion', 'en_camino', 'entregado'].includes(estado)
        ? {
            id: i + 100,
            pedidoId: i + 1,
            metodo: i % 2 === 0 ? 'Nequi' : 'Bancolombia',
            referencia: `REF-${1000 + i}`,
            comprobanteUrl: 'https://placehold.co/400x600/f5f5f5/27272a?text=Comprobante',
            estado: estado === 'pago_en_revision' ? 'pendiente' : 'confirmado',
            revisadoPor: estado !== 'pago_en_revision' ? 1 : undefined,
            fechaRevision: estado !== 'pago_en_revision' ? createdAt.toISOString() : undefined,
          }
        : undefined;

    orders.push({
      id: i + 1,
      folio: `GEP-${String(2024001 + i)}`,
      cliente: clientes[i % clientes.length],
      direccionEnvio: direcciones[i % direcciones.length],
      ciudad: ciudades[i % ciudades.length],
      referencias: i % 3 === 0 ? 'Edificio azul, portería sur' : undefined,
      items,
      total,
      estado,
      pago,
      historial: generateHistory(i + 1, estado, createdAt),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }

  return orders;
}

function generateHistory(pedidoId: number, currentStatus: OrderStatus, baseDate: Date): OrderStatusHistory[] {
  const flow: OrderStatus[] = [
    'nuevo', 'pago_pendiente', 'pago_en_revision', 'pago_confirmado',
    'en_preparacion', 'en_camino', 'entregado',
  ];
  const idx = flow.indexOf(currentStatus);
  const history: OrderStatusHistory[] = [];

  if (idx < 0) {
    // rechazado or cancelado
    history.push({
      id: 1, pedidoId,
      estadoAnterior: 'nuevo', estadoNuevo: currentStatus,
      usuarioId: 1, usuarioNombre: 'Sistema',
      nota: currentStatus === 'rechazado' ? 'Comprobante inválido' : 'Cancelado por el cliente',
      timestamp: baseDate.toISOString(),
    });
    return history;
  }

  for (let i = 0; i <= idx; i++) {
    const prev = i === 0 ? 'nuevo' : flow[i - 1];
    const ts = new Date(baseDate.getTime() + i * 1800000); // 30 min between each
    history.push({
      id: i + 1, pedidoId,
      estadoAnterior: prev,
      estadoNuevo: flow[i],
      usuarioId: i === 0 ? 0 : 1,
      usuarioNombre: i === 0 ? 'Sistema' : 'Admin',
      nota: i === 0 ? 'Pedido recibido desde la web' : undefined,
      timestamp: ts.toISOString(),
    });
  }

  return history;
}

// ─── Service ──────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class OrderService {
  private orders: Order[] = generateMockOrders();

  getOrders(filters?: {
    estado?: OrderStatus;
    busqueda?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<Order[]> {
    let result = [...this.orders];

    if (filters) {
      if (filters.estado) {
        result = result.filter(o => o.estado === filters.estado);
      }
      if (filters.busqueda) {
        const q = filters.busqueda.toLowerCase();
        result = result.filter(
          o =>
            o.folio.toLowerCase().includes(q) ||
            o.cliente.nombre.toLowerCase().includes(q) ||
            o.cliente.email.toLowerCase().includes(q)
        );
      }
      if (filters.fechaDesde) {
        result = result.filter(o => o.createdAt >= filters.fechaDesde!);
      }
      if (filters.fechaHasta) {
        result = result.filter(o => o.createdAt <= filters.fechaHasta!);
      }
    }

    return of(result).pipe(delay(300));
  }

  getOrderById(id: number): Observable<Order | undefined> {
    return of(this.orders.find(o => o.id === id)).pipe(delay(200));
  }

  getOrderByFolio(folio: string): Observable<Order | undefined> {
    return of(this.orders.find(o => o.folio.toLowerCase() === folio.toLowerCase())).pipe(delay(300));
  }

  getOrderHistory(id: number): Observable<OrderStatusHistory[]> {
    const order = this.orders.find(o => o.id === id);
    return of(order?.historial ?? []).pipe(delay(200));
  }

  getNewOrders(): Observable<Order[]> {
    const news = this.orders.filter(o => o.estado === 'nuevo');
    return of(news).pipe(delay(100));
  }

  getOrdersByStatuses(statuses: OrderStatus[]): Observable<Order[]> {
    const filtered = this.orders.filter(o => statuses.includes(o.estado));
    return of(filtered).pipe(delay(300));
  }

  updateStatus(id: number, newStatus: OrderStatus, nota?: string): Observable<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (order) {
      const prev = order.estado;
      order.estado = newStatus;
      order.updatedAt = new Date().toISOString();

      const historyEntry: OrderStatusHistory = {
        id: (order.historial?.length ?? 0) + 1,
        pedidoId: id,
        estadoAnterior: prev,
        estadoNuevo: newStatus,
        usuarioId: 1,
        usuarioNombre: 'Usuario Actual',
        nota,
        timestamp: new Date().toISOString(),
      };
      if (!order.historial) order.historial = [];
      order.historial.push(historyEntry);
    }
    return of(order).pipe(delay(400));
  }

  confirmPayment(id: number): Observable<Order | undefined> {
    return this.updateStatus(id, 'pago_confirmado', 'Pago verificado correctamente');
  }

  rejectPayment(id: number, nota: string): Observable<Order | undefined> {
    return this.updateStatus(id, 'rechazado', nota);
  }

  markInTransit(id: number): Observable<Order | undefined> {
    return this.updateStatus(id, 'en_camino', 'Pedido despachado');
  }

  markDelivered(id: number, _photoUrl?: string): Observable<Order | undefined> {
    return this.updateStatus(id, 'entregado', 'Entrega confirmada con foto');
  }
}
