import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Client, ClientActivity } from '../models/client.model';

const MOCK_CLIENTS: Client[] = [
  {
    id: 1, nombre: 'Carlos Andrés Martínez Restrepo', tipoDocumento: 'cedula', documento: '1.023.456.789',
    telefono: '311 456 7890', email: 'carlos.martinez@gmail.com', direccion: 'Carrera 14 #19-45, Centro',
    ciudad: 'Armenia', tipo: 'persona', totalPedidos: 7, totalGastado: 3850000,
    ultimaCompra: '2026-09-20T10:30:00Z', activo: true, createdAt: '2025-06-10T08:00:00Z',
    notas: 'Comprador frecuente de polisombras y mallas para finca cafetera.',
  },
  {
    id: 2, nombre: 'Laura Sofía Torres Pineda', tipoDocumento: 'cedula', documento: '52.789.321',
    telefono: '312 890 1234', email: 'laura.torres@hotmail.com', direccion: 'Calle 39 #24-15, Plaza Bolívar',
    ciudad: 'Calarcá', tipo: 'persona', totalPedidos: 4, totalGastado: 1920000,
    ultimaCompra: '2026-09-18T14:20:00Z', activo: true, createdAt: '2025-11-22T09:00:00Z',
    notas: 'Diseñadora de interiores, compra pisos estoperol y manteles para locales.',
  },
  {
    id: 3, nombre: 'Andrés Felipe Vargas Henao', tipoDocumento: 'cedula', documento: '80.123.456',
    telefono: '319 678 9012', email: 'andres.vargas@outlook.com', direccion: 'Carrera 6 #8-30, Salida a Panaca',
    ciudad: 'Quimbaya', tipo: 'persona', totalPedidos: 12, totalGastado: 6450000,
    ultimaCompra: '2026-09-19T08:15:00Z', activo: true, createdAt: '2024-10-01T10:00:00Z',
    notas: 'Productor agropecuario, cliente recurrente de malla cafetera, plástico negro y soga.',
  },
  {
    id: 4, nombre: 'Valentina Morales Gómez', tipoDocumento: 'cedula', documento: '1.098.765.432',
    telefono: '301 901 2345', email: 'vale.morales@gmail.com', direccion: 'Calle 7 #14-20, Alto de la Cruz',
    ciudad: 'Circasia', tipo: 'persona', totalPedidos: 5, totalGastado: 2180000,
    ultimaCompra: '2026-09-15T16:00:00Z', activo: true, createdAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 5, nombre: 'Santiago Rojas Arbelaez', tipoDocumento: 'cedula', documento: '1.045.678.901',
    telefono: '317 789 0124', email: 'santi.rojas@gmail.com', direccion: 'Calle 6 #5-12, Calle del Tiempo Detenido',
    ciudad: 'Filandia', tipo: 'persona', totalPedidos: 8, totalGastado: 4120000,
    ultimaCompra: '2026-09-17T11:45:00Z', activo: true, createdAt: '2025-08-15T07:30:00Z',
    notas: 'Artesanías y cestería, compra telas laminadas y espumas.',
  },
  {
    id: 6, nombre: 'Diana Marcela Quintero', tipoDocumento: 'cedula', documento: '43.876.543',
    telefono: '310 234 5678', email: 'diana.quintero@gmail.com', direccion: 'Calle Real #3-45, Centro',
    ciudad: 'Salento', tipo: 'persona', totalPedidos: 3, totalGastado: 1450000,
    ultimaCompra: '2026-09-12T09:30:00Z', activo: true, createdAt: '2026-04-10T14:00:00Z',
    notas: 'Hostal turístico en Salento, manteles y pisos de alto tráfico.',
  },
  {
    id: 7, nombre: 'Juan Pablo Ospina Gil', tipoDocumento: 'cedula', documento: '71.345.678',
    telefono: '315 345 6789', email: 'juanpa.ospina@yahoo.com', direccion: 'Carrera 7 #18-24, Vía Parque del Café',
    ciudad: 'Montenegro', tipo: 'persona', totalPedidos: 9, totalGastado: 5300000,
    ultimaCompra: '2026-09-19T16:00:00Z', activo: true, createdAt: '2025-01-20T08:00:00Z',
    notas: 'Tapicero independiente, compra láminas Poliflex D-26 y pegante PL285.',
  },
  {
    id: 8, nombre: 'Mariana Castro Jaramillo', tipoDocumento: 'cedula', documento: '1.037.890.123',
    telefono: '314 567 8901', email: 'mariana.castro@gmail.com', direccion: 'Av. Principal #10-35, Zona Franca',
    ciudad: 'La Tebaida', tipo: 'persona', totalPedidos: 6, totalGastado: 2890000,
    ultimaCompra: '2026-09-14T13:00:00Z', activo: true, createdAt: '2025-10-05T09:00:00Z',
  },
  {
    id: 9, nombre: 'Felipe Restrepo Cárdenas', tipoDocumento: 'cedula', documento: '98.654.321',
    telefono: '316 789 0123', email: 'felipe.restrepo@outlook.com', direccion: 'Av. Bolívar #14N-25, La Castellana',
    ciudad: 'Armenia', tipo: 'persona', totalPedidos: 4, totalGastado: 1780000,
    ultimaCompra: '2026-09-10T10:20:00Z', activo: true, createdAt: '2026-03-14T16:00:00Z',
  },
  {
    id: 10, nombre: 'Claudia Patricia Benítez', tipoDocumento: 'cedula', documento: '32.456.789',
    telefono: '318 890 1234', email: 'claudia.benitez@gmail.com', direccion: 'Carrera 25 #42-10, Barrio Versalles',
    ciudad: 'Calarcá', tipo: 'persona', totalPedidos: 5, totalGastado: 2430000,
    ultimaCompra: '2026-09-16T07:00:00Z', activo: true, createdAt: '2025-07-30T10:00:00Z',
  },
  {
    id: 11, nombre: 'Mateo Salazar Ortiz', tipoDocumento: 'cedula', documento: '1.152.345.678',
    telefono: '313 456 7890', email: 'mateo.salazar@hotmail.com', direccion: 'Vereda La Soledad, Finca El Recuerdo',
    ciudad: 'Quimbaya', tipo: 'persona', totalPedidos: 3, totalGastado: 1250000,
    ultimaCompra: '2026-09-13T09:45:00Z', activo: true, createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 12, nombre: 'Camila Andrea Herrera', tipoDocumento: 'cedula', documento: '1.018.987.654',
    telefono: '320 567 8901', email: 'camila.herrera@gmail.com', direccion: 'Vereda La Julia, Finca El Paraíso',
    ciudad: 'Circasia', tipo: 'persona', totalPedidos: 2, totalGastado: 890000,
    ultimaCompra: '2026-08-20T15:00:00Z', activo: true, createdAt: '2026-05-01T12:00:00Z',
  },
  {
    id: 13, nombre: 'Cafeteros & Agro del Quindío S.A.S', tipoDocumento: 'nit', documento: '900.456.789-1',
    telefono: '606 745 1280', email: 'compras@agrodelquindio.com', direccion: 'Av. Centenario #28-15, Zona Agroindustrial',
    ciudad: 'Armenia', empresa: 'Agro del Quindío', tipo: 'empresa', totalPedidos: 48, totalGastado: 32500000,
    ultimaCompra: '2026-09-18T10:30:00Z', activo: true, createdAt: '2025-03-10T08:00:00Z',
    notas: 'Distribuidor mayorista de insumos plásticos y agrícolas en el departamento del Quindío.',
  },
  {
    id: 14, nombre: 'Inversiones & Glamping Salento S.A.S', tipoDocumento: 'nit', documento: '800.321.654-7',
    telefono: '606 759 3300', email: 'pedidos@glampingsalento.co', direccion: 'Km 4 Vía Valle de Cocora',
    ciudad: 'Salento', empresa: 'Glamping Salento', tipo: 'empresa', totalPedidos: 35, totalGastado: 28700000,
    ultimaCompra: '2026-09-19T14:20:00Z', activo: true, createdAt: '2025-05-22T09:00:00Z',
    notas: 'Cadena de ecoturismo y domos, pedidos constantes de lonas Kodra, telas plastificadas y espumas.',
  },
  {
    id: 15, nombre: 'Cooperativa de Caficultores de Quimbaya', tipoDocumento: 'nit', documento: '901.234.567-0',
    telefono: '606 758 2250', email: 'compras@cafecoopquimbaya.co', direccion: 'Carrera 7 #12-40, Centro',
    ciudad: 'Quimbaya', empresa: 'Cooperativa de Caficultores', tipo: 'empresa', totalPedidos: 24, totalGastado: 19400000,
    ultimaCompra: '2026-09-17T13:00:00Z', activo: true, createdAt: '2025-10-05T09:00:00Z',
    notas: 'Cooperativa cafetera, compran polisombras, malla cafetera y soga por volumen.',
  },
  {
    id: 16, nombre: 'Ferretería & Construcciones Calarcá', tipoDocumento: 'nit', documento: '900.111.222-3',
    telefono: '606 742 9900', email: 'logistica@construccionescalarca.com', direccion: 'Variante Sur #15-80',
    ciudad: 'Calarcá', empresa: 'Construcciones Calarcá', tipo: 'empresa', totalPedidos: 18, totalGastado: 14800000,
    ultimaCompra: '2026-09-15T11:45:00Z', activo: true, createdAt: '2025-08-15T07:30:00Z',
    notas: 'Constructora local, pedidos frecuentes de plástico negro y tela cerramiento para obras.',
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
