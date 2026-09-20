import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client, ClientActivity } from '../models/client.model';

const MOCK_CLIENTS: Client[] = [
  {
    id: 1, nombre: 'Empaques del Valle S.A.S', tipoDocumento: 'nit', documento: '900.456.789-1',
    telefono: '602 887 4520', email: 'compras@empaquesdelvalle.com', direccion: 'Calle 15 #23-45, Zona Industrial',
    ciudad: 'Cali', empresa: 'Empaques del Valle', tipo: 'empresa', totalPedidos: 48, totalGastado: 32500000,
    ultimaCompra: '2026-09-18T10:30:00Z', activo: true, createdAt: '2025-03-10T08:00:00Z',
  },
  {
    id: 2, nombre: 'Plásticos Andinos Ltda.', tipoDocumento: 'nit', documento: '800.321.654-7',
    telefono: '604 512 3300', email: 'pedidos@plasticosandinos.co', direccion: 'Carrera 43A #1Sur-50, Ofc 301',
    ciudad: 'Medellín', empresa: 'Plásticos Andinos', tipo: 'empresa', totalPedidos: 35, totalGastado: 28700000,
    ultimaCompra: '2026-09-19T14:20:00Z', activo: true, createdAt: '2025-05-22T09:00:00Z',
  },
  {
    id: 3, nombre: 'Distribuidora Nacional de Empaques', tipoDocumento: 'nit', documento: '901.234.567-0',
    telefono: '601 745 9900', email: 'logistica@disnacional.com', direccion: 'Av. Boyacá #64-50, Bodega 12',
    ciudad: 'Bogotá', empresa: 'Distribuidora Nacional', tipo: 'empresa', totalPedidos: 62, totalGastado: 54000000,
    ultimaCompra: '2026-09-20T08:15:00Z', activo: true, createdAt: '2024-11-01T10:00:00Z',
  },
  {
    id: 4, nombre: 'Carlos Martínez', tipoDocumento: 'cedula', documento: '1.023.456.789',
    telefono: '311 456 7890', email: 'carlos.martinez@gmail.com', direccion: 'Calle 85 #15-40, Apto 302',
    ciudad: 'Bogotá', tipo: 'persona', totalPedidos: 5, totalGastado: 1850000,
    ultimaCompra: '2026-09-15T16:00:00Z', activo: true, createdAt: '2026-06-01T11:00:00Z',
  },
  {
    id: 5, nombre: 'Foam Solutions Colombia', tipoDocumento: 'nit', documento: '900.111.222-3',
    telefono: '605 234 5678', email: 'info@foamsolutions.co', direccion: 'Km 5 Vía Mamonal',
    ciudad: 'Cartagena', empresa: 'Foam Solutions', tipo: 'empresa', totalPedidos: 22, totalGastado: 18900000,
    ultimaCompra: '2026-09-17T11:45:00Z', activo: true, createdAt: '2025-08-15T07:30:00Z',
  },
  {
    id: 6, nombre: 'Laura Torres', tipoDocumento: 'cedula', documento: '52.789.321',
    telefono: '312 890 1234', email: 'laura.t@hotmail.com', direccion: 'Carrera 7 #120-35, Torre B',
    ciudad: 'Bogotá', tipo: 'persona', totalPedidos: 3, totalGastado: 920000,
    ultimaCompra: '2026-08-28T09:30:00Z', activo: true, createdAt: '2026-07-10T14:00:00Z',
  },
  {
    id: 7, nombre: 'Industrias de Embalaje del Caribe S.A.', tipoDocumento: 'nit', documento: '800.555.777-9',
    telefono: '605 678 9012', email: 'ventas@embalajecaribe.com', direccion: 'Calle 30 #18-120, P.I. El Bosque',
    ciudad: 'Barranquilla', empresa: 'Embalaje del Caribe', tipo: 'empresa', totalPedidos: 41, totalGastado: 37200000,
    ultimaCompra: '2026-09-19T16:00:00Z', activo: true, createdAt: '2025-01-20T08:00:00Z',
  },
  {
    id: 8, nombre: 'Espumas y Colchones del Eje', tipoDocumento: 'nit', documento: '900.333.444-5',
    telefono: '606 345 6789', email: 'compras@espumaseje.co', direccion: 'Av. Kevin Ángel #54-30',
    ciudad: 'Manizales', empresa: 'Espumas del Eje', tipo: 'empresa', totalPedidos: 18, totalGastado: 15400000,
    ultimaCompra: '2026-09-12T13:00:00Z', activo: true, createdAt: '2025-10-05T09:00:00Z',
  },
  {
    id: 9, nombre: 'Andrés Vargas', tipoDocumento: 'cedula', documento: '80.123.456',
    telefono: '319 678 9012', email: 'andres.v@outlook.com', direccion: 'Diagonal 48 #15-60, Casa 12',
    ciudad: 'Bucaramanga', tipo: 'persona', totalPedidos: 8, totalGastado: 3200000,
    ultimaCompra: '2026-09-10T10:20:00Z', activo: true, createdAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 10, nombre: 'ProtecPack S.A.S', tipoDocumento: 'nit', documento: '901.678.901-2',
    telefono: '602 456 7890', email: 'contacto@protecpack.co', direccion: 'Calle 25 #44-10, Bodega 5',
    ciudad: 'Cali', empresa: 'ProtecPack', tipo: 'empresa', totalPedidos: 29, totalGastado: 24300000,
    ultimaCompra: '2026-09-20T07:00:00Z', activo: true, createdAt: '2025-06-30T10:00:00Z',
  },
  {
    id: 11, nombre: 'Empaques Flexibles del Pacífico', tipoDocumento: 'nit', documento: '800.999.888-6',
    telefono: '602 111 2233', email: 'admon@empflexpacifico.co', direccion: 'Zona Franca del Pacífico, Lote 7',
    ciudad: 'Cali', empresa: 'Flexibles del Pacífico', tipo: 'empresa', totalPedidos: 55, totalGastado: 46800000,
    ultimaCompra: '2026-09-19T09:45:00Z', activo: true, createdAt: '2024-09-15T08:00:00Z',
  },
  {
    id: 12, nombre: 'Valentina Díaz', tipoDocumento: 'cedula', documento: '1.098.765.432',
    telefono: '301 901 2345', email: 'vale.diaz@gmail.com', direccion: 'Transversal 39 #24-180',
    ciudad: 'Bogotá', tipo: 'persona', totalPedidos: 2, totalGastado: 680000,
    ultimaCompra: '2026-07-20T15:00:00Z', activo: false, createdAt: '2026-05-01T12:00:00Z',
    notas: 'Cliente inactivo, no ha comprado en 2 meses',
  },
  {
    id: 13, nombre: 'Multiempaques Bogotá S.A.', tipoDocumento: 'nit', documento: '900.777.666-4',
    telefono: '601 333 4455', email: 'pedidos@multiempaques.co', direccion: 'Calle 13 #68D-35, Fontibón',
    ciudad: 'Bogotá', empresa: 'Multiempaques', tipo: 'empresa', totalPedidos: 37, totalGastado: 31500000,
    ultimaCompra: '2026-09-18T14:30:00Z', activo: true, createdAt: '2025-02-28T09:00:00Z',
  },
  {
    id: 14, nombre: 'Polímeros del Norte Ltda.', tipoDocumento: 'nit', documento: '800.444.333-1',
    telefono: '605 567 8901', email: 'gerencia@polimerosnorte.com', direccion: 'Km 3 Vía 40',
    ciudad: 'Barranquilla', empresa: 'Polímeros del Norte', tipo: 'empresa', totalPedidos: 15, totalGastado: 12100000,
    ultimaCompra: '2026-09-16T11:00:00Z', activo: true, createdAt: '2025-11-10T10:00:00Z',
  },
  {
    id: 15, nombre: 'Santiago Rojas', tipoDocumento: 'cedula', documento: '1.045.678.901',
    telefono: '317 789 0124', email: 'santi.rojas@gmail.com', direccion: 'Calle 100 #19-61, Piso 8',
    ciudad: 'Bogotá', tipo: 'persona', totalPedidos: 6, totalGastado: 2400000,
    ultimaCompra: '2026-09-14T17:30:00Z', activo: true, createdAt: '2026-04-20T08:00:00Z',
  },
];

function generateMockActivities(): ClientActivity[] {
  const activities: ClientActivity[] = [];
  let id = 1;
  const now = new Date();

  MOCK_CLIENTS.forEach(client => {
    // Generate 3-6 activities per client
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const tipos: ClientActivity['tipo'][] = ['pedido', 'pago', 'entrega', 'contacto'];
      const tipo = tipos[i % tipos.length];
      const descriptions: Record<ClientActivity['tipo'], string[]> = {
        pedido: ['Realizó nuevo pedido', 'Pedido de espuma PE 20mm', 'Pedido de stretch film', 'Pedido urgente de rollo burbuja'],
        pago: ['Pago confirmado vía Nequi', 'Transferencia Bancolombia recibida', 'Pago con comprobante adjunto'],
        entrega: ['Pedido entregado en bodega', 'Entrega confirmada con foto', 'Despacho completado'],
        nota: ['Nota interna agregada', 'Solicita cotización especial'],
        contacto: ['Llamada de seguimiento', 'Solicitud de cotización por email', 'Visita comercial programada'],
      };
      const descList = descriptions[tipo] || ['Actividad registrada'];

      activities.push({
        id: id++,
        clienteId: client.id,
        tipo,
        descripcion: descList[Math.floor(Math.random() * descList.length)],
        entidadId: tipo === 'pedido' || tipo === 'pago' ? Math.floor(Math.random() * 18) + 1 : undefined,
        timestamp: new Date(now.getTime() - (i * 86400000 + Math.random() * 86400000)).toISOString(),
      });
    }
  });

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private clients: Client[] = [...MOCK_CLIENTS];
  private activities: ClientActivity[] = generateMockActivities();

  getClients(): Observable<Client[]> {
    return of(this.clients).pipe(delay(300));
  }

  getClientById(id: number): Observable<Client | undefined> {
    return of(this.clients.find(c => c.id === id)).pipe(delay(200));
  }

  searchClients(query: string): Observable<Client[]> {
    const q = query.toLowerCase();
    const results = this.clients.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.documento.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.empresa?.toLowerCase().includes(q) ?? false)
    );
    return of(results).pipe(delay(200));
  }

  getClientsByType(tipo: 'empresa' | 'persona'): Observable<Client[]> {
    return of(this.clients.filter(c => c.tipo === tipo)).pipe(delay(200));
  }

  getClientActivity(clientId: number): Observable<ClientActivity[]> {
    return of(this.activities.filter(a => a.clienteId === clientId)).pipe(delay(200));
  }

  getActiveClientsCount(): Observable<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const count = this.clients.filter(c =>
      c.ultimaCompra && new Date(c.ultimaCompra) >= oneMonthAgo
    ).length;
    return of(count).pipe(delay(100));
  }

  getNewClientsThisMonth(): Observable<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const count = this.clients.filter(c => new Date(c.createdAt) >= startOfMonth).length;
    return of(count).pipe(delay(100));
  }

  getAverageTicket(): Observable<number> {
    const total = this.clients.reduce((sum, c) => sum + (c.totalPedidos > 0 ? c.totalGastado / c.totalPedidos : 0), 0);
    return of(Math.round(total / this.clients.length)).pipe(delay(100));
  }
}
