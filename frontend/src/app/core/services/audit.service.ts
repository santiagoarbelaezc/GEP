import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuditLog, UserSession, AuditAction, AuditEntity } from '../models/audit.model';
import { UserRole } from '../models/user.model';

function generateMockLogs(): AuditLog[] {
  const logs: AuditLog[] = [];
  const now = new Date();

  const entries: { usuario: string; id: number; rol: UserRole; accion: AuditAction; entidad: AuditEntity; ref?: string; detalle: string; hoursAgo: number }[] = [
    { usuario: 'María García', id: 2, rol: 'caja', accion: 'login', entidad: 'sistema', detalle: 'Inicio de sesión desde caja principal', hoursAgo: 0.1 },
    { usuario: 'María García', id: 2, rol: 'caja', accion: 'confirmar_pago', entidad: 'pago', ref: 'GEP-2024003', detalle: 'Confirmó pago de $298,000 — Nequi REF-1002', hoursAgo: 0.25 },
    { usuario: 'Pedro López', id: 3, rol: 'logistica', accion: 'marcar_entregado', entidad: 'pedido', ref: 'GEP-2024008', detalle: 'Entrega confirmada con evidencia fotográfica', hoursAgo: 0.5 },
    { usuario: 'María García', id: 2, rol: 'caja', accion: 'confirmar_pago', entidad: 'pago', ref: 'GEP-2024005', detalle: 'Confirmó pago de $205,000 — Bancolombia REF-1004', hoursAgo: 0.8 },
    { usuario: 'Admin', id: 1, rol: 'admin', accion: 'cambiar_estado', entidad: 'pedido', ref: 'GEP-2024001', detalle: 'Cambió estado de "nuevo" a "pago_pendiente"', hoursAgo: 1.2 },
    { usuario: 'Pedro López', id: 3, rol: 'logistica', accion: 'marcar_en_camino', entidad: 'pedido', ref: 'GEP-2024006', detalle: 'Pedido despachado — Ruta Bogotá Norte', hoursAgo: 1.5 },
    { usuario: 'María García', id: 2, rol: 'caja', accion: 'rechazar_pago', entidad: 'pago', ref: 'GEP-2024010', detalle: 'Comprobante ilegible, se solicita reenvío', hoursAgo: 2.0 },
    { usuario: 'Admin', id: 1, rol: 'admin', accion: 'imprimir_factura', entidad: 'factura', ref: 'GEP-2024003', detalle: 'Factura de venta generada e impresa', hoursAgo: 2.5 },
    { usuario: 'Pedro López', id: 3, rol: 'logistica', accion: 'login', entidad: 'sistema', detalle: 'Inicio de sesión desde dispositivo móvil', hoursAgo: 3.0 },
    { usuario: 'Pedro López', id: 3, rol: 'logistica', accion: 'marcar_en_camino', entidad: 'pedido', ref: 'GEP-2024007', detalle: 'Pedido despachado — Ruta Medellín', hoursAgo: 3.5 },
    { usuario: 'María García', id: 2, rol: 'caja', accion: 'confirmar_pago', entidad: 'pago', ref: 'GEP-2024012', detalle: 'Confirmó pago de $175,000 — Nequi REF-1011', hoursAgo: 4.0 },
    { usuario: 'Admin', id: 1, rol: 'admin', accion: 'ver_cliente', entidad: 'cliente', ref: 'Empaques del Valle', detalle: 'Consultó perfil del cliente', hoursAgo: 4.5 },
    { usuario: 'Camila Soto', id: 4, rol: 'caja', accion: 'login', entidad: 'sistema', detalle: 'Inicio de sesión — turno tarde', hoursAgo: 5.0 },
    { usuario: 'Camila Soto', id: 4, rol: 'caja', accion: 'confirmar_pago', entidad: 'pago', ref: 'GEP-2024014', detalle: 'Confirmó pago de $420,000 — Bancolombia REF-1013', hoursAgo: 5.5 },
    { usuario: 'Diego Ramírez', id: 5, rol: 'logistica', accion: 'marcar_entregado', entidad: 'pedido', ref: 'GEP-2024004', detalle: 'Entrega confirmada — Zona Industrial Cali', hoursAgo: 6.0 },
    { usuario: 'Admin', id: 1, rol: 'admin', accion: 'cambiar_estado', entidad: 'pedido', ref: 'GEP-2024015', detalle: 'Cambió estado de "pago_confirmado" a "en_preparacion"', hoursAgo: 6.5 },
    { usuario: 'María García', id: 2, rol: 'caja', accion: 'logout', entidad: 'sistema', detalle: 'Cierre de sesión — fin de turno mañana', hoursAgo: 7.0 },
    { usuario: 'Pedro López', id: 3, rol: 'logistica', accion: 'marcar_entregado', entidad: 'pedido', ref: 'GEP-2024009', detalle: 'Entrega confirmada — Barranquilla Centro', hoursAgo: 7.5 },
    { usuario: 'Admin', id: 1, rol: 'admin', accion: 'imprimir_recibo', entidad: 'pago', ref: 'GEP-2024005', detalle: 'Recibo de pago generado', hoursAgo: 8.0 },
    { usuario: 'Camila Soto', id: 4, rol: 'caja', accion: 'confirmar_pago', entidad: 'pago', ref: 'GEP-2024016', detalle: 'Confirmó pago de $310,000 — Nequi REF-1015', hoursAgo: 8.5 },
  ];

  entries.forEach((entry, i) => {
    logs.push({
      id: i + 1,
      timestamp: new Date(now.getTime() - entry.hoursAgo * 3600000).toISOString(),
      usuarioId: entry.id,
      usuarioNombre: entry.usuario,
      rol: entry.rol,
      accion: entry.accion,
      entidad: entry.entidad,
      entidadRef: entry.ref,
      detalle: entry.detalle,
      ip: '192.168.1.' + (10 + entry.id),
    });
  });

  return logs;
}

function generateMockSessions(): UserSession[] {
  const now = new Date();
  return [
    {
      id: 1, usuarioId: 2, usuarioNombre: 'María García', rol: 'caja',
      loginAt: new Date(now.getTime() - 0.1 * 3600000).toISOString(),
      ultimaActividad: new Date(now.getTime() - 0.25 * 3600000).toISOString(),
      accionesRealizadas: 12, activo: true,
    },
    {
      id: 2, usuarioId: 3, usuarioNombre: 'Pedro López', rol: 'logistica',
      loginAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
      ultimaActividad: new Date(now.getTime() - 0.5 * 3600000).toISOString(),
      accionesRealizadas: 8, activo: true,
    },
    {
      id: 3, usuarioId: 4, usuarioNombre: 'Camila Soto', rol: 'caja',
      loginAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
      ultimaActividad: new Date(now.getTime() - 5.5 * 3600000).toISOString(),
      accionesRealizadas: 6, activo: true,
    },
    {
      id: 4, usuarioId: 5, usuarioNombre: 'Diego Ramírez', rol: 'logistica',
      loginAt: new Date(now.getTime() - 8 * 3600000).toISOString(),
      ultimaActividad: new Date(now.getTime() - 6 * 3600000).toISOString(),
      accionesRealizadas: 5, activo: false,
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private logs: AuditLog[] = generateMockLogs();
  private sessions: UserSession[] = generateMockSessions();

  getLogs(filters?: {
    rol?: UserRole;
    accion?: AuditAction;
    entidad?: AuditEntity;
    usuarioId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<AuditLog[]> {
    let result = [...this.logs];

    if (filters) {
      if (filters.rol) result = result.filter(l => l.rol === filters.rol);
      if (filters.accion) result = result.filter(l => l.accion === filters.accion);
      if (filters.entidad) result = result.filter(l => l.entidad === filters.entidad);
      if (filters.usuarioId) result = result.filter(l => l.usuarioId === filters.usuarioId);
      if (filters.fechaDesde) result = result.filter(l => l.timestamp >= filters.fechaDesde!);
      if (filters.fechaHasta) result = result.filter(l => l.timestamp <= filters.fechaHasta!);
    }

    return of(result).pipe(delay(300));
  }

  getLogsByUser(usuarioId: number): Observable<AuditLog[]> {
    return of(this.logs.filter(l => l.usuarioId === usuarioId)).pipe(delay(200));
  }

  getUserSessions(): Observable<UserSession[]> {
    return of(this.sessions).pipe(delay(200));
  }

  getActiveSessions(): Observable<UserSession[]> {
    return of(this.sessions.filter(s => s.activo)).pipe(delay(200));
  }

  getTodayActionCount(): Observable<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const count = this.logs.filter(l => new Date(l.timestamp) >= startOfDay).length;
    return of(count).pipe(delay(100));
  }

  getActionCountByRole(rol: UserRole): Observable<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const count = this.logs.filter(l => l.rol === rol && new Date(l.timestamp) >= startOfDay).length;
    return of(count).pipe(delay(100));
  }

  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const newLog: AuditLog = {
      ...log,
      id: this.logs.length + 1,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
  }
}
