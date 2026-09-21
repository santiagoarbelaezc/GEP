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

export const PROTOTYPE_COMPROBANTE_URL =
  'https://res.cloudinary.com/doxdjiyvi/image/upload/v1789948206/IMG_6859_f7mhv9.png';

// ─── Mock Data — Catálogo Espumas, Plásticos y Empaques ───────────────────

const MOCK_ITEMS: OrderItem[][] = [
  [
    { id: 1, productoId: 101, nombreProducto: 'Lámina Espuma PE 20mm', nombreVariante: '1.00 x 2.00 m', cantidad: 50, precioUnitario: 12000, subtotal: 600000 },
    { id: 2, productoId: 102, nombreProducto: 'Rollo Plástico Burbuja', nombreVariante: '1.20m x 100m', cantidad: 5, precioUnitario: 85000, subtotal: 425000 },
  ],
  [
    { id: 3, productoId: 103, nombreProducto: 'Stretch Film Industrial', nombreVariante: '50cm x 300m / Cal. 12', cantidad: 12, precioUnitario: 32000, subtotal: 384000 },
  ],
  [
    { id: 4, productoId: 104, nombreProducto: 'Esquinero de Cartón', nombreVariante: '2" x 1.20m', cantidad: 200, precioUnitario: 1500, subtotal: 300000 },
    { id: 5, productoId: 105, nombreProducto: 'Bolsa LDPE Transparente', nombreVariante: '40x60 cm / Cal. 2', cantidad: 1000, precioUnitario: 180, subtotal: 180000 },
    { id: 6, productoId: 106, nombreProducto: 'Cinta Embalaje Transparente', nombreVariante: '48mm x 100m', cantidad: 36, precioUnitario: 4500, subtotal: 162000 },
  ],
  [
    { id: 7, productoId: 107, nombreProducto: 'Espuma Polietileno Rollo', nombreVariante: '1mm x 1.20m x 200m', cantidad: 3, precioUnitario: 145000, subtotal: 435000 },
  ],
  [
    { id: 8, productoId: 108, nombreProducto: 'Foam Board 10mm', nombreVariante: '1.22 x 2.44 m / Blanco', cantidad: 20, precioUnitario: 28000, subtotal: 560000 },
    { id: 9, productoId: 109, nombreProducto: 'Bolsa Ziplock', nombreVariante: '15x20 cm', cantidad: 500, precioUnitario: 250, subtotal: 125000 },
  ],
  [
    { id: 10, productoId: 110, nombreProducto: 'Papel Kraft Rollo', nombreVariante: '60cm x 300m / 80g', cantidad: 4, precioUnitario: 72000, subtotal: 288000 },
    { id: 11, productoId: 111, nombreProducto: 'Espuma Poliuretano Plancha', nombreVariante: '30mm / D-18 / 1x2m', cantidad: 30, precioUnitario: 18000, subtotal: 540000 },
  ],
  [
    { id: 12, productoId: 112, nombreProducto: 'Película Termoencogible PVC', nombreVariante: '40cm x 500m / Cal. 60', cantidad: 8, precioUnitario: 55000, subtotal: 440000 },
    { id: 13, productoId: 113, nombreProducto: 'Esquinero de Espuma', nombreVariante: 'Perfil L 5cm x 1m', cantidad: 100, precioUnitario: 2800, subtotal: 280000 },
  ],
];

const CLIENTES = [
  { id: 1, nombre: 'Empaques del Valle S.A.S', telefono: '602 887 4520', email: 'compras@empaquesdelvalle.com' },
  { id: 2, nombre: 'Plásticos Andinos Ltda.', telefono: '604 512 3300', email: 'pedidos@plasticosandinos.co' },
  { id: 3, nombre: 'Distribuidora Nacional de Empaques', telefono: '601 745 9900', email: 'logistica@disnacional.com' },
  { id: 4, nombre: 'Carlos Martínez', telefono: '311 456 7890', email: 'carlos.martinez@gmail.com' },
  { id: 5, nombre: 'Foam Solutions Colombia', telefono: '605 234 5678', email: 'info@foamsolutions.co' },
  { id: 6, nombre: 'Laura Torres', telefono: '312 890 1234', email: 'laura.t@hotmail.com' },
  { id: 7, nombre: 'Industrias de Embalaje del Caribe S.A.', telefono: '605 678 9012', email: 'ventas@embalajecaribe.com' },
  { id: 8, nombre: 'Espumas y Colchones del Eje', telefono: '606 345 6789', email: 'compras@espumaseje.co' },
  { id: 9, nombre: 'Andrés Vargas', telefono: '319 678 9012', email: 'andres.v@outlook.com' },
  { id: 10, nombre: 'ProtecPack S.A.S', telefono: '602 456 7890', email: 'contacto@protecpack.co' },
  { id: 11, nombre: 'Empaques Flexibles del Pacífico', telefono: '602 111 2233', email: 'admon@empflexpacifico.co' },
  { id: 12, nombre: 'Valentina Díaz', telefono: '301 901 2345', email: 'vale.diaz@gmail.com' },
  { id: 13, nombre: 'Multiempaques Bogotá S.A.', telefono: '601 333 4455', email: 'pedidos@multiempaques.co' },
  { id: 14, nombre: 'Polímeros del Norte Ltda.', telefono: '605 567 8901', email: 'gerencia@polimerosnorte.com' },
  { id: 15, nombre: 'Santiago Rojas', telefono: '317 789 0124', email: 'santi.rojas@gmail.com' },
];

function generateMockOrders(): Order[] {
  const statuses: OrderStatus[] = [
    'nuevo', 'pago_pendiente', 'pago_en_revision', 'pago_confirmado',
    'en_preparacion', 'en_camino', 'entregado', 'rechazado', 'cancelado',
  ];

  const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena', 'Manizales'];
  const direcciones = [
    'Calle 15 #23-45, Zona Industrial',
    'Carrera 43A #1Sur-50, Ofc 301',
    'Av. Boyacá #64-50, Bodega 12',
    'Calle 85 #15-40, Apto 302',
    'Km 5 Vía Mamonal',
    'Carrera 7 #120-35, Torre B',
    'Calle 30 #18-120, P.I. El Bosque',
    'Av. Kevin Ángel #54-30',
  ];

  const now = new Date();
  const orders: Order[] = [];

  for (let i = 0; i < 18; i++) {
    const items = MOCK_ITEMS[i % MOCK_ITEMS.length];
    const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
    const descuento = i % 5 === 0 ? Math.round(subtotal * 0.05) : 0;
    const impuestos = Math.round((subtotal - descuento) * 0.19);
    const costoEnvio = i % 3 === 0 ? 25000 : i % 3 === 1 ? 35000 : 0;
    const total = subtotal - descuento + impuestos + costoEnvio;
    const estado = statuses[i % statuses.length];
    const createdAt = new Date(now.getTime() - (i * 3600000 + Math.random() * 7200000));
    const clienteData = CLIENTES[i % CLIENTES.length];

    const isPendingPayment = ['nuevo', 'pago_pendiente', 'pago_en_revision'].includes(estado);
    const pago: Payment = {
      id: i + 100,
      pedidoId: i + 1,
      metodo: i % 3 === 0 ? 'Nequi' : i % 3 === 1 ? 'Bancolombia' : 'Davivienda',
      referencia: `REF-${1000 + i}`,
      comprobanteUrl: PROTOTYPE_COMPROBANTE_URL,
      estado: isPendingPayment ? 'pendiente' : 'confirmado',
      revisadoPor: !isPendingPayment ? 2 : undefined,
      revisadoPorNombre: !isPendingPayment ? 'María García' : undefined,
      fechaRevision: !isPendingPayment ? createdAt.toISOString() : undefined,
      monto: total,
    };

    orders.push({
      id: i + 1,
      folio: `GEP-${String(2024001 + i)}`,
      clienteId: clienteData.id,
      cliente: { nombre: clienteData.nombre, telefono: clienteData.telefono, email: clienteData.email },
      direccionEnvio: direcciones[i % direcciones.length],
      ciudad: ciudades[i % ciudades.length],
      referencias: i % 3 === 0 ? 'Bodega principal, portería vehicular' : undefined,
      items,
      subtotal,
      descuento,
      impuestos,
      costoEnvio,
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

  const operators = ['Sistema', 'Admin', 'María García', 'Pedro López'];

  for (let i = 0; i <= idx; i++) {
    const prev = i === 0 ? 'nuevo' : flow[i - 1];
    const ts = new Date(baseDate.getTime() + i * 1800000); // 30 min between each
    history.push({
      id: i + 1, pedidoId,
      estadoAnterior: prev,
      estadoNuevo: flow[i],
      usuarioId: i === 0 ? 0 : (i % operators.length) + 1,
      usuarioNombre: operators[i % operators.length],
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

  getOrdersByClient(clienteId: number): Observable<Order[]> {
    const filtered = this.orders.filter(o => o.clienteId === clienteId);
    return of(filtered).pipe(delay(300));
  }

  getPayments(): Observable<Payment[]> {
    const payments = this.orders
      .filter(o => o.pago)
      .map(o => o.pago!);
    return of(payments).pipe(delay(300));
  }

  getPaymentsByStatus(estado: Payment['estado']): Observable<Payment[]> {
    const payments = this.orders
      .filter(o => o.pago && o.pago.estado === estado)
      .map(o => o.pago!);
    return of(payments).pipe(delay(200));
  }

  getOrderForPayment(paymentId: number): Observable<Order | undefined> {
    return of(this.orders.find(o => o.pago?.id === paymentId)).pipe(delay(200));
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
