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

// ─── Mock Data — Catálogo Real Plaxtilíneas (Espumas, Plásticos, Mallas y Telas) ─

const MOCK_ITEMS: OrderItem[][] = [
  [
    { id: 1, productoId: 201, nombreProducto: 'Malla Cafetera', nombreVariante: 'Rollo 1.00m x 50m / Secado Polietileno', cantidad: 3, precioUnitario: 145000, subtotal: 435000 },
    { id: 2, productoId: 217, nombreProducto: 'Soga Ganadera', nombreVariante: 'Madeja 12mm x 50m / Protección UV', cantidad: 4, precioUnitario: 38000, subtotal: 152000 },
  ],
  [
    { id: 3, productoId: 209, nombreProducto: 'Polisombra Negra', nombreVariante: '80% Sombra / Rollo 4m x 100m', cantidad: 2, precioUnitario: 320000, subtotal: 640000 },
    { id: 4, productoId: 224, nombreProducto: 'Clavos Acero', nombreVariante: 'Caja x 100 unid. 2 1/2"', cantidad: 6, precioUnitario: 12500, subtotal: 75000 },
  ],
  [
    { id: 5, productoId: 207, nombreProducto: 'Plástico Invernadero', nombreVariante: 'Ancho 6m x 30m / Filtro UV', cantidad: 1, precioUnitario: 480000, subtotal: 480000 },
    { id: 6, productoId: 205, nombreProducto: 'Plástico Negro', nombreVariante: 'Calibre 6 / Rollo 3m x 50m', cantidad: 2, precioUnitario: 135000, subtotal: 270000 },
  ],
  [
    { id: 7, productoId: 215, nombreProducto: 'Lámina Espuma Rosada Poliflex D-26', nombreVariante: '1.00m x 1.90m x 10cm', cantidad: 4, precioUnitario: 115000, subtotal: 460000 },
    { id: 8, productoId: 222, nombreProducto: 'Pegante PL285', nombreVariante: 'Galón 3.785 L / Contacto Profesional', cantidad: 2, precioUnitario: 68000, subtotal: 136000 },
  ],
  [
    { id: 9, productoId: 201, nombreProducto: 'Malla Plástica', nombreVariante: 'Rollo 1.20m x 30m / Cerramiento PEAD', cantidad: 3, precioUnitario: 120000, subtotal: 360000 },
    { id: 10, productoId: 204, nombreProducto: 'Tela Cerramiento', nombreVariante: 'Verde / Rollo 2.10m x 100m', cantidad: 2, precioUnitario: 110000, subtotal: 220000 },
  ],
  [
    { id: 11, productoId: 211, nombreProducto: 'Thermolon Negro', nombreVariante: 'Espesor 5mm x 1m x 50m / Aislante PE', cantidad: 3, precioUnitario: 165000, subtotal: 495000 },
    { id: 12, productoId: 223, nombreProducto: 'Ductolón', nombreVariante: 'Tubo 2m x 1/2" / Celda Cerrada', cantidad: 15, precioUnitario: 8500, subtotal: 127500 },
  ],
  [
    { id: 13, productoId: 213, nombreProducto: 'Strech Transparente', nombreVariante: '50cm x 300m / Cal. 12 Industrial', cantidad: 10, precioUnitario: 34000, subtotal: 340000 },
    { id: 14, productoId: 208, nombreProducto: 'Plástico Burbuja', nombreVariante: 'Rollo 1.20m x 100m / Amortiguación', cantidad: 3, precioUnitario: 89000, subtotal: 267000 },
  ],
  [
    { id: 15, productoId: 218, nombreProducto: 'Piso Estoperol Bolas', nombreVariante: 'Ancho 1.40m x 8m / Vinilo Tráfico', cantidad: 1, precioUnitario: 390000, subtotal: 390000 },
    { id: 16, productoId: 222, nombreProducto: 'Pegante PL285', nombreVariante: '1/4 Galón / Adhesivo de Contacto', cantidad: 2, precioUnitario: 24000, subtotal: 480000 },
  ],
  [
    { id: 17, productoId: 214, nombreProducto: 'Lámina Placus', nombreVariante: '1.00m x 2.00m x 15mm / Alta Densidad', cantidad: 6, precioUnitario: 52000, subtotal: 312000 },
    { id: 18, productoId: 221, nombreProducto: 'Lámina Espuma Blanca D-12', nombreVariante: '1.00m x 2.00m x 5cm', cantidad: 8, precioUnitario: 29000, subtotal: 232000 },
  ],
  [
    { id: 19, productoId: 203, nombreProducto: 'Tela Laminada Plastificada', nombreVariante: 'Ancho 1.50m x 20m / Impermeable', cantidad: 1, precioUnitario: 310000, subtotal: 310000 },
    { id: 20, productoId: 220, nombreProducto: 'Lona Kodra', nombreVariante: 'Ancho 1.50m x 10m / Plastificada', cantidad: 1, precioUnitario: 185000, subtotal: 185000 },
  ],
  [
    { id: 21, productoId: 225, nombreProducto: 'Cartón Corrugado', nombreVariante: 'Rollo 1.20m x 50kg / Protección Obra', cantidad: 2, precioUnitario: 125000, subtotal: 250000 },
    { id: 22, productoId: 219, nombreProducto: 'Mantel', nombreVariante: 'Rollo 1.40m x 25m / Tipo Cocina Lavable', cantidad: 2, precioUnitario: 95000, subtotal: 190000 },
  ],
  [
    { id: 23, productoId: 210, nombreProducto: 'Polisombra Verde y Blanca', nombreVariante: '80% Sombra Privacidad / 4m x 50m', cantidad: 1, precioUnitario: 290000, subtotal: 290000 },
    { id: 24, productoId: 206, nombreProducto: 'Plástico Transparente', nombreVariante: 'Calibre 4 / Rollo 2m x 50m', cantidad: 2, precioUnitario: 115000, subtotal: 230000 },
    { id: 25, productoId: 216, nombreProducto: 'Malla Plástica Antimosquito', nombreVariante: 'Rollo 1.20m x 30m / Blanco', cantidad: 2, precioUnitario: 78000, subtotal: 156000 },
  ],
];

// Clientes reales del Quindío (predominantemente personas naturales, ocasionalmente empresas)
const CLIENTES = [
  { id: 1, nombre: 'Carlos Andrés Martínez Restrepo', telefono: '311 456 7890', email: 'carlos.martinez@gmail.com' },
  { id: 2, nombre: 'Laura Sofía Torres Pineda', telefono: '312 890 1234', email: 'laura.torres@hotmail.com' },
  { id: 3, nombre: 'Andrés Felipe Vargas Henao', telefono: '319 678 9012', email: 'andres.vargas@outlook.com' },
  { id: 4, nombre: 'Valentina Morales Gómez', telefono: '301 901 2345', email: 'vale.morales@gmail.com' },
  { id: 5, nombre: 'Santiago Rojas Arbelaez', telefono: '317 789 0124', email: 'santi.rojas@gmail.com' },
  { id: 6, nombre: 'Diana Marcela Quintero', telefono: '310 234 5678', email: 'diana.quintero@gmail.com' },
  { id: 7, nombre: 'Juan Pablo Ospina Gil', telefono: '315 345 6789', email: 'juanpa.ospina@yahoo.com' },
  { id: 8, nombre: 'Mariana Castro Jaramillo', telefono: '314 567 8901', email: 'mariana.castro@gmail.com' },
  { id: 9, nombre: 'Felipe Restrepo Cárdenas', telefono: '316 789 0123', email: 'felipe.restrepo@outlook.com' },
  { id: 10, nombre: 'Claudia Patricia Benítez', telefono: '318 890 1234', email: 'claudia.benitez@gmail.com' },
  { id: 11, nombre: 'Mateo Salazar Ortiz', telefono: '313 456 7890', email: 'mateo.salazar@hotmail.com' },
  { id: 12, nombre: 'Camila Andrea Herrera', telefono: '320 567 8901', email: 'camila.herrera@gmail.com' },
  { id: 13, nombre: 'Cafeteros & Agro del Quindío S.A.S', telefono: '606 745 1280', email: 'compras@agrodelquindio.com' },
  { id: 14, nombre: 'Inversiones & Glamping Salento S.A.S', telefono: '606 759 3300', email: 'pedidos@glampingsalento.co' },
  { id: 15, nombre: 'Cooperativa de Caficultores de Quimbaya', telefono: '606 758 2250', email: 'compras@cafecoopquimbaya.co' },
  { id: 16, nombre: 'Ferretería & Construcciones Calarcá', telefono: '606 742 9900', email: 'logistica@construccionescalarca.com' },
];

function generateMockOrders(): Order[] {
  const statuses: OrderStatus[] = [
    'nuevo', 'pago_pendiente', 'pago_en_revision', 'pago_confirmado',
    'en_preparacion', 'en_camino', 'entregado', 'rechazado', 'cancelado',
  ];

  const ubicacionesQuindio = [
    { ciudad: 'Armenia', direccion: 'Carrera 14 #19-45, Centro' },
    { ciudad: 'Calarcá', direccion: 'Calle 39 #24-15, Parque Principal' },
    { ciudad: 'Quimbaya', direccion: 'Carrera 6 #8-30, Salida a Panaca' },
    { ciudad: 'Circasia', direccion: 'Calle 7 #14-20, Alto de la Cruz' },
    { ciudad: 'Filandia', direccion: 'Calle 6 #5-12, Calle del Tiempo Detenido' },
    { ciudad: 'Salento', direccion: 'Calle Real #3-45, Centro Histórico' },
    { ciudad: 'Montenegro', direccion: 'Carrera 7 #18-24, Vía Parque del Café' },
    { ciudad: 'La Tebaida', direccion: 'Av. Principal #10-35, Zona Franca' },
    { ciudad: 'Armenia', direccion: 'Av. Bolívar #14N-25, La Castellana' },
    { ciudad: 'Calarcá', direccion: 'Carrera 25 #42-10, Barrio Versalles' },
    { ciudad: 'Quimbaya', direccion: 'Vereda La Soledad, Finca El Recuerdo' },
    { ciudad: 'Circasia', direccion: 'Vereda La Julia, Finca El Paraíso' },
    { ciudad: 'Armenia', direccion: 'Av. Centenario #28-15, Zona Agroindustrial' },
    { ciudad: 'Salento', direccion: 'Km 4 Vía Valle de Cocora' },
    { ciudad: 'Quimbaya', direccion: 'Carrera 7 #12-40, Centro' },
    { ciudad: 'Calarcá', direccion: 'Variante Sur #15-80' },
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
    const ubicacion = ubicacionesQuindio[i % ubicacionesQuindio.length];

    // El comprobante y el pago SOLO existen a partir de 'pago_en_revision'
    const hasPaymentSubmitted = [
      'pago_en_revision',
      'pago_confirmado',
      'en_preparacion',
      'en_camino',
      'entregado',
    ].includes(estado);

    const isConfirmed = [
      'pago_confirmado',
      'en_preparacion',
      'en_camino',
      'entregado',
    ].includes(estado);

    const pago: Payment | undefined = hasPaymentSubmitted
      ? {
          id: i + 100,
          pedidoId: i + 1,
          metodo: i % 3 === 0 ? 'Nequi' : i % 3 === 1 ? 'Bancolombia' : 'Davivienda',
          referencia: `REF-${1000 + i}`,
          comprobanteUrl: PROTOTYPE_COMPROBANTE_URL,
          estado: isConfirmed ? 'confirmado' : 'pendiente',
          revisadoPor: isConfirmed ? 2 : undefined,
          revisadoPorNombre: isConfirmed ? 'María García' : undefined,
          fechaRevision: isConfirmed ? createdAt.toISOString() : undefined,
          monto: total,
        }
      : undefined;

    orders.push({
      id: i + 1,
      folio: `GEP-${String(2024001 + i)}`,
      clienteId: clienteData.id,
      cliente: { nombre: clienteData.nombre, telefono: clienteData.telefono, email: clienteData.email },
      direccionEnvio: ubicacion.direccion,
      ciudad: ubicacion.ciudad,
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

  confirmPayment(id: number, nota?: string): Observable<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (order && order.pago) {
      order.pago.estado = 'confirmado';
      order.pago.fechaRevision = new Date().toISOString();
      order.pago.revisadoPorNombre = 'Caja Principal';
    }
    return this.updateStatus(id, 'pago_confirmado', nota || 'Pago verificado correctamente por caja');
  }

  confirmAndSendToPreparation(id: number, nota?: string): Observable<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (order && order.pago) {
      order.pago.estado = 'confirmado';
      order.pago.fechaRevision = new Date().toISOString();
      order.pago.revisadoPorNombre = 'Caja Principal';
    }
    this.updateStatus(id, 'pago_confirmado', nota || 'Pago verificado por caja');
    return this.updateStatus(id, 'en_preparacion', 'Pago OK — Enviado a bodega para preparación');
  }

  rejectPayment(id: number, nota: string): Observable<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (order && order.pago) {
      order.pago.estado = 'rechazado';
      order.pago.fechaRevision = new Date().toISOString();
      order.pago.revisadoPorNombre = 'Caja Principal';
    }
    return this.updateStatus(id, 'rechazado', nota || 'Comprobante rechazado por caja');
  }

  sendToPreparation(id: number): Observable<Order | undefined> {
    return this.updateStatus(id, 'en_preparacion', 'Pedido enviado a bodega para preparación');
  }

  markInTransit(id: number): Observable<Order | undefined> {
    return this.updateStatus(id, 'en_camino', 'Pedido despachado');
  }

  markDelivered(id: number, _photoUrl?: string): Observable<Order | undefined> {
    return this.updateStatus(id, 'entregado', 'Entrega confirmada con foto');
  }
}
