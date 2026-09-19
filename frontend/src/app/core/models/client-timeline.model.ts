export interface TimelineSubEvent {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  usuario: string;
  badge?: string;
}

export interface ClientStage {
  codigo: string; // e.g. 'F1', 'F2', 'F3', 'F4', 'F5'
  nombre: string;
  etiquetaEstado: string; // 'Completado', 'Firmado', '64% en curso', 'Control activo', 'Próximamente'
  tipoEstado: 'completado' | 'en_curso' | 'control' | 'proximo';
  subtitulo: string;
  fechaRegistro?: string;
  hitoClave: string;
  responsable: string;
  porcentaje: number;
  observaciones?: string;
  subEventos: TimelineSubEvent[];
}

export interface ClientProcess {
  id: string;
  expedienteId: string;
  cliente: {
    nombre: string;
    cedula: string;
    telefono: string;
    email: string;
    ingreso: string;
    iniciales: string;
  };
  especialistaAsignado: string;
  tituloDiagrama: string;
  subtituloDiagrama: string;
  tituloCiclo: string;
  descripcionCiclo: string;
  avanceGlobal: number;
  faseActivaIndex: number;
  fases: ClientStage[];
}
