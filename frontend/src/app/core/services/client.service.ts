import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client, ClientActivity } from '../models/client.model';

const MOCK_CLIENTS: Client[] = [
  {
    id: 1, nombre: 'Carlos Andrés Martínez Restrepo', tipoDocumento: 'cedula', documento: '1.023.456.789',
    telefono: '311 456 7890', email: 'carlos.martinez@gmail.com', direccion: 'Calle 85 #15-40, Apto 302',
    ciudad: 'Bogotá', tipo: 'persona', totalPedidos: 7, totalGastado: 3850000,
    ultimaCompra: '2026-09-20T10:30:00Z', activo: true, createdAt: '2025-06-10T08:00:00Z',
    notas: 'Comprador frecuente de polisombras y mallas para finca.',
  },
  {
    id: 2, nombre: 'Laura Sofía Torres Pineda', tipoDocumento: 'cedula', documento: '52.789.321',
    telefono: '312 890 1234', email: 'laura.torres@hotmail.com', direccion: 'Carrera 7 #120-35, Torre B',
    ciudad: 'Bogotá', tipo: 'persona', totalPedidos: 4, totalGastado: 1920000,
    ultimaCompra: '2026-09-18T14:20:00Z', activo: true, createdAt: '2025-11-22T09:00:00Z',
    notas: 'Diseñadora de interiores, compra pisos estoperol y manteles.',
  },
  {
    id: 3, nombre: 'Andrés Felipe Vargas Henao', tipoDocumento: 'cedula', documento: '80.123.456',
    telefono: '319 678 9012', email: 'andres.vargas@outlook.com', direccion: 'Diagonal 48 #15-60, Casa 12',
    ciudad: 'Manizales', tipo: 'persona', totalPedidos: 12, totalGastado: 6450000,
    ultimaCompra: '2026-09-19T08:15:00Z', activo: true, createdAt: '2024-10-01T10:00:00Z',
    notas: 'Productor de café, cliente recurrente de malla cafetera y soga.',
  },
  {
    id: 4, nombre: 'Valentina Morales Gómez', tipoDocumento: 'cedula', documento: '1.098.765.432',
    telefono: '301 901 2345', email: 'vale.morales@gmail.com', direccion: 'Circular 4 #73-20, Laureles',
    ciudad: 'Medellín', tipo: 'persona', totalPedidos: 5, totalGastado: 2180000,
    ultimaCompra: '2026-09-15T16:00:00Z', activo: true, createdAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 5, nombre: 'Santiago Rojas Arbelaez', tipoDocumento: 'cedula', documento: '1.045.678.901',
    telefono: '317 789 0124', email: 'santi.rojas@gmail.com', direccion: 'Av. Circunvalar #14-25, Apto 501',
    ciudad: 'Pereira', tipo: 'persona', totalPedidos: 8, totalGastado: 4120000,
    ultimaCompra: '2026-09-17T11:45:00Z', activo: true, createdAt: '2025-08-15T07:30:00Z',
  },
  {
    id: 6, nombre: 'Diana Marcela Quintero', tipoDocumento: 'cedula', documento: '43.876.543',
    telefono: '310 234 5678', email: 'diana.quintero@gmail.com', direccion: 'Calle 9 #42-15, El Peñón',
    ciudad: 'Cali', tipo: 'persona', totalPedidos: 3, totalGastado: 1450000,
    ultimaCompra: '2026-09-12T09:30:00Z', activo: true, createdAt: '2026-04-10T14:00:00Z',
  },
  {
    id: 7, nombre: 'Juan Pablo Ospina Gil', tipoDocumento: 'cedula', documento: '71.345.678',
    telefono: '315 345 6789', email: 'juanpa.ospina@yahoo.com', direccion: 'Calle 33 #65C-40, Belén',
    ciudad: 'Medellín', tipo: 'persona', totalPedidos: 9, totalGastado: 5300000,
    ultimaCompra: '2026-09-19T16:00:00Z', activo: true, createdAt: '2025-01-20T08:00:00Z',
    notas: 'Tapicero independiente, compra láminas Poliflex D-26 y pegante PL285.',
  },
  {
    id: 8, nombre: 'Mariana Castro Jaramillo', tipoDocumento: 'cedula', documento: '1.037.890.123',
    telefono: '314 567 8901', email: 'mariana.castro@gmail.com', direccion: 'Carrera 48 #26Sur-18',
    ciudad: 'Envigado', tipo: 'persona', totalPedidos: 6, totalGastado: 2890000,
    ultimaCompra: '2026-09-14T13:00:00Z', activo: true, createdAt: '2025-10-05T09:00:00Z',
  },
  {
    id: 9, nombre: 'Felipe Restrepo Cárdenas', tipoDocumento: 'cedula', documento: '98.654.321',
    telefono: '316 789 0123', email: 'felipe.restrepo@outlook.com', direccion: 'Carrera 14 #19-45',
    ciudad: 'Armenia', tipo: 'persona', totalPedidos: 4, totalGastado: 1780000,
    ultimaCompra: '2026-09-10T10:20:00Z', activo: true, createdAt: '2026-03-14T16:00:00Z',
  },
  {
    id: 10, nombre: 'Claudia Patricia Benítez', tipoDocumento: 'cedula', documento: '32.456.789',
    telefono: '318 890 1234', email: 'claudia.benitez@gmail.com', direccion: 'Calle 134 #12-50, Contador',
    ciudad: 'Bogotá', tipo: 'persona', totalPedidos: 5, totalGastado: 2430000,
    ultimaCompra: '2026-09-16T07:00:00Z', activo: true, createdAt: '2025-07-30T10:00:00Z',
  },
  {
    id: 11, nombre: 'Mateo Salazar Ortiz', tipoDocumento: 'cedula', documento: '1.152.345.678',
    telefono: '313 456 7890', email: 'mateo.salazar@hotmail.com', direccion: 'Carrera 27 #36-20, Cabecera',
    ciudad: 'Bucaramanga', tipo: 'persona', totalPedidos: 3, totalGastado: 1250000,
    ultimaCompra: '2026-09-13T09:45:00Z', activo: true, createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 12, nombre: 'Camila Andrea Herrera', tipoDocumento: 'cedula', documento: '1.018.987.654',
    telefono: '320 567 8901', email: 'camila.herrera@gmail.com', direccion: 'Calle 60 #7-40, Jordán',
    ciudad: 'Ibagué', tipo: 'persona', totalPedidos: 2, totalGastado: 890000,
    ultimaCompra: '2026-08-20T15:00:00Z', activo: true, createdAt: '2026-05-01T12:00:00Z',
  },
  {
    id: 13, nombre: 'Empaques del Valle S.A.S', tipoDocumento: 'nit', documento: '900.456.789-1',
    telefono: '602 887 4520', email: 'compras@empaquesdelvalle.com', direccion: 'Calle 15 #23-45, Zona Industrial',
    ciudad: 'Cali', empresa: 'Empaques del Valle', tipo: 'empresa', totalPedidos: 48, totalGastado: 32500000,
    ultimaCompra: '2026-09-18T10:30:00Z', activo: true, createdAt: '2025-03-10T08:00:00Z',
    notas: 'Distribuidor mayorista en el Valle del Cauca.',
  },
  {
    id: 14, nombre: 'Plásticos Andinos Ltda.', tipoDocumento: 'nit', documento: '800.321.654-7',
    telefono: '604 512 3300', email: 'pedidos@plasticosandinos.co', direccion: 'Carrera 43A #1Sur-50, Ofc 301',
    ciudad: 'Medellín', empresa: 'Plásticos Andinos', tipo: 'empresa', totalPedidos: 35, totalGastado: 28700000,
    ultimaCompra: '2026-09-19T14:20:00Z', activo: true, createdAt: '2025-05-22T09:00:00Z',
  },
  {
    id: 15, nombre: 'AgroInsumos del Café S.A.S', tipoDocumento: 'nit', documento: '901.234.567-0',
    telefono: '606 345 6789', email: 'compras@agroinsumoscafe.co', direccion: 'Av. Kevin Ángel #54-30',
    ciudad: 'Manizales', empresa: 'AgroInsumos del Café', tipo: 'empresa', totalPedidos: 24, totalGastado: 19400000,
    ultimaCompra: '2026-09-17T13:00:00Z', activo: true, createdAt: '2025-10-05T09:00:00Z',
    notas: 'Cooperativa cafetera, compran polisombras, malla cafetera y soga por volumen.',
  },
  {
    id: 16, nombre: 'Construcciones & Acabados del Eje', tipoDocumento: 'nit', documento: '900.111.222-3',
    telefono: '606 745 9900', email: 'logistica@acabadosdeleje.com', direccion: 'Av. 30 de Agosto #48-12',
    ciudad: 'Pereira', empresa: 'Construcciones del Eje', tipo: 'empresa', totalPedidos: 18, totalGastado: 14800000,
    ultimaCompra: '2026-09-15T11:45:00Z', activo: true, createdAt: '2025-08-15T07:30:00Z',
    notas: 'Constructora, pedidos frecuentes de plástico negro y tela cerramiento para obras.',
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
