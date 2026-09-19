export type OrderStatus =
  | 'nuevo'
  | 'pago_pendiente'
  | 'pago_en_revision'
  | 'pago_confirmado'
  | 'rechazado'
  | 'en_preparacion'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

export interface OrderClient {
  nombre: string;
  telefono: string;
  email: string;
}

export interface OrderItem {
  id: number;
  productoId: number;
  varianteId?: number;
  nombreProducto: string;
  nombreVariante?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  pedidoId: number;
  metodo: string;
  referencia: string;
  comprobanteUrl?: string;
  estado: 'pendiente' | 'revisado' | 'confirmado' | 'rechazado';
  revisadoPor?: number;
  fechaRevision?: string;
}

export interface OrderStatusHistory {
  id: number;
  pedidoId: number;
  estadoAnterior: OrderStatus;
  estadoNuevo: OrderStatus;
  usuarioId: number;
  usuarioNombre: string;
  nota?: string;
  timestamp: string;
}

export interface Delivery {
  id: number;
  pedidoId: number;
  fotoUrl: string;
  usuarioId: number;
  createdAt: string;
}

export interface Order {
  id: number;
  folio: string;
  cliente: OrderClient;
  direccionEnvio: string;
  ciudad: string;
  referencias?: string;
  items: OrderItem[];
  total: number;
  estado: OrderStatus;
  pago?: Payment;
  historial?: OrderStatusHistory[];
  entrega?: Delivery;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nuevo: 'Nuevo',
  pago_pendiente: 'Pago Pendiente',
  pago_en_revision: 'Pago en Revisión',
  pago_confirmado: 'Pago Confirmado',
  rechazado: 'Rechazado',
  en_preparacion: 'En Preparación',
  en_camino: 'En Camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

/** Stepper steps for the tracking page */
export const TRACKING_STEPS: OrderStatus[] = [
  'nuevo',
  'pago_confirmado',
  'en_preparacion',
  'en_camino',
  'entregado',
];
