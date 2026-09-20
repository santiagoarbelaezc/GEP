import { UserRole } from './user.model';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'confirmar_pago'
  | 'rechazar_pago'
  | 'cambiar_estado'
  | 'marcar_en_camino'
  | 'marcar_entregado'
  | 'crear_pedido'
  | 'ver_pedido'
  | 'ver_cliente'
  | 'imprimir_factura'
  | 'imprimir_recibo';

export type AuditEntity = 'pedido' | 'cliente' | 'pago' | 'sistema' | 'factura';

export interface AuditLog {
  id: number;
  timestamp: string;
  usuarioId: number;
  usuarioNombre: string;
  rol: UserRole;
  accion: AuditAction;
  entidad: AuditEntity;
  entidadId?: number;
  entidadRef?: string; // e.g. folio del pedido
  detalle: string;
  ip?: string;
}

export interface UserSession {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  rol: UserRole;
  loginAt: string;
  ultimaActividad: string;
  accionesRealizadas: number;
  activo: boolean;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  confirmar_pago: 'Confirmó pago',
  rechazar_pago: 'Rechazó pago',
  cambiar_estado: 'Cambió estado',
  marcar_en_camino: 'Marcó en camino',
  marcar_entregado: 'Marcó entregado',
  crear_pedido: 'Creó pedido',
  ver_pedido: 'Vio pedido',
  ver_cliente: 'Vio cliente',
  imprimir_factura: 'Imprimió factura',
  imprimir_recibo: 'Imprimió recibo',
};

export const AUDIT_ACTION_ICONS: Record<AuditAction, string> = {
  login: 'login',
  logout: 'logout',
  confirmar_pago: 'check_circle',
  rechazar_pago: 'cancel',
  cambiar_estado: 'swap_horiz',
  marcar_en_camino: 'local_shipping',
  marcar_entregado: 'verified',
  crear_pedido: 'add_circle',
  ver_pedido: 'visibility',
  ver_cliente: 'person_search',
  imprimir_factura: 'print',
  imprimir_recibo: 'receipt_long',
};
