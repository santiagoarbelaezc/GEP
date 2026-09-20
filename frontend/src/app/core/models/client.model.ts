export type TipoDocumento = 'nit' | 'cedula' | 'pasaporte';
export type TipoCliente = 'empresa' | 'persona';

export interface Client {
  id: number;
  nombre: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  empresa?: string;
  tipo: TipoCliente;
  notas?: string;
  totalPedidos: number;
  totalGastado: number;
  ultimaCompra?: string;
  activo: boolean;
  createdAt: string;
}

export interface ClientActivity {
  id: number;
  clienteId: number;
  tipo: 'pedido' | 'pago' | 'entrega' | 'nota' | 'contacto';
  descripcion: string;
  entidadId?: number;
  timestamp: string;
}

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  nit: 'NIT',
  cedula: 'Cédula',
  pasaporte: 'Pasaporte',
};

export const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  empresa: 'Empresa',
  persona: 'Persona Natural',
};
