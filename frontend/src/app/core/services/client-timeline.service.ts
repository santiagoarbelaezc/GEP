import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ClientProcess, ClientStage } from '../models/client-timeline.model';

@Injectable({ providedIn: 'root' })
export class ClientTimelineService {
  private processes: ClientProcess[] = [
    {
      id: 'pat-001',
      expedienteId: 'pat-001',
      cliente: {
        nombre: 'María Alejandra González Restrepo',
        cedula: '1.032.456.789',
        telefono: '+57 310 456 7890',
        email: 'maria.gonzalez@email.com',
        ingreso: '2026-01-10',
        iniciales: 'MG',
      },
      especialistaAsignado: 'Camila Herrera',
      tituloDiagrama: 'Diagrama Clínico de Flujo',
      subtituloDiagrama: 'Progreso general por etapas del paciente',
      tituloCiclo: 'Progreso Terapéutico y Ciclo del Paciente',
      descripcionCiclo: 'Etapas clínicas desde el diagnóstico inicial hasta el alta y mantenimiento preventivo',
      avanceGlobal: 64,
      faseActivaIndex: 2, // F3 (0-indexed)
      fases: [
        {
          codigo: 'F1',
          nombre: 'Diagnóstico',
          etiquetaEstado: 'Completado',
          tipoEstado: 'completado',
          subtitulo: 'Evaluación y Triaje Integral',
          fechaRegistro: '2026-01-10',
          hitoClave: 'Historia Clínica y Biometría 100%',
          responsable: 'Dra. Camila Herrera',
          porcentaje: 100,
          observaciones: 'Diagnóstico de composición corporal y análisis dérmico completados satisfactoriamente.',
          subEventos: [
            {
              id: 101,
              titulo: 'Consulta de Valoración Inicial',
              descripcion: 'Anamnesis completa, toma de medidas antropométricas y bioimpedancia.',
              fecha: '2026-01-10 09:30',
              usuario: 'Camila Herrera',
              badge: 'Aprobado',
            },
            {
              id: 102,
              titulo: 'Consentimiento Informado',
              descripcion: 'Firma digital de términos y protocolo médico personalizado.',
              fecha: '2026-01-10 10:15',
              usuario: 'Recepción Central',
              badge: 'Firmado',
            },
          ],
        },
        {
          codigo: 'F2',
          nombre: 'Plan Aprobado',
          etiquetaEstado: 'Firmado',
          tipoEstado: 'completado',
          subtitulo: 'Estructuración y Validación de Protocolo',
          fechaRegistro: '2026-01-15',
          hitoClave: 'Protocolo de 11 Sesiones Autorizado',
          responsable: 'Comité Clínico / Camila Herrera',
          porcentaje: 100,
          observaciones: 'Plan terapéutico financiado y autorizado por dirección médica.',
          subEventos: [
            {
              id: 201,
              titulo: 'Definición de Protocolo Combinado',
              descripcion: 'Asignación de paquete terapéutico: Hidrolipoclasia no aspirativa + RF Corporal.',
              fecha: '2026-01-15 14:00',
              usuario: 'Comité Clínico',
              badge: 'Aprobado',
            },
            {
              id: 202,
              titulo: 'Programación de Cronograma',
              descripcion: 'Fijación de 11 sesiones bimensuales con controles intermedios.',
              fecha: '2026-01-16 11:20',
              usuario: 'Coordinación Médica',
              badge: 'Agendado',
            },
          ],
        },
        {
          codigo: 'F3',
          nombre: 'Tratamiento Activo',
          etiquetaEstado: '64% en curso',
          tipoEstado: 'en_curso',
          subtitulo: 'Última sesión: Hidrolipoclasia + RF Corporal',
          fechaRegistro: '2026-08-28',
          hitoClave: '7 / 11 sesiones ejecutadas',
          responsable: 'Camila Herrera',
          porcentaje: 64,
          observaciones: 'Evolución muy favorable con reducción de 4.2 cm en perímetro abdominal. Excelente tolerancia.',
          subEventos: [
            {
              id: 301,
              titulo: 'Sesión #7: Hidrolipoclasia + Radiofrecuencia',
              descripcion: 'Aplicación en zona periumbilical y flancos. Parámetros RF: 42°C sostenidos 18 min.',
              fecha: '2026-08-28 15:30',
              usuario: 'Camila Herrera',
              badge: 'Realizado',
            },
            {
              id: 302,
              titulo: 'Sesión #6: Drenaje Linfático y Ultrasonido',
              descripcion: 'Técnica Vodder combinada con ultrasonido cavitacional.',
              fecha: '2026-08-21 16:00',
              usuario: 'Camila Herrera',
              badge: 'Realizado',
            },
            {
              id: 303,
              titulo: 'Sesión #5: Radiofrecuencia Multipolar',
              descripcion: 'Fase de reafirmación cutánea y estimulación de colágeno.',
              fecha: '2026-08-14 14:30',
              usuario: 'Camila Herrera',
              badge: 'Realizado',
            },
            {
              id: 304,
              titulo: 'Próxima Cita Programada (Sesión #8)',
              descripcion: 'Mantenimiento lipolítico y nueva toma de medidas de control.',
              fecha: '2026-09-24 10:00',
              usuario: 'Coordinación Médica',
              badge: 'Programado',
            },
          ],
        },
        {
          codigo: 'F4',
          nombre: 'Control de Resultados',
          etiquetaEstado: 'Control activo',
          tipoEstado: 'control',
          subtitulo: 'Monitoreo Fotográfico y Biométrico Intermedio',
          fechaRegistro: '2026-09-30',
          hitoClave: 'Valoración Post-Tratamiento Pendiente',
          responsable: 'Equipo Médico Auditor',
          porcentaje: 0,
          observaciones: 'Se programará tras culminar la sesión #11 para contrastar fotos estandarizadas antes/después.',
          subEventos: [
            {
              id: 401,
              titulo: 'Sesión Fotográfica Clínica Final',
              descripcion: 'Registro en estudio de luz polarizada para comparativa médica formal.',
              fecha: 'Previsto: 2026-10-05',
              usuario: 'Equipo de Registro Clínico',
              badge: 'Pendiente',
            },
            {
              id: 402,
              titulo: 'Biometría y Pesaje de Control',
              descripcion: 'Test de bioimpedancia para contrastar porcentaje graso y masa magra.',
              fecha: 'Previsto: 2026-10-05',
              usuario: 'Dra. Camila Herrera',
              badge: 'Pendiente',
            },
          ],
        },
        {
          codigo: 'F5',
          nombre: 'Alta / Mantenimiento',
          etiquetaEstado: 'Próximamente',
          tipoEstado: 'proximo',
          subtitulo: 'Plan Preventivo y Seguimiento Semestral',
          fechaRegistro: '2026-10-15',
          hitoClave: 'Certificado de Cierre y Guía Nutricional',
          responsable: 'Camila Herrera',
          porcentaje: 0,
          observaciones: 'Entrega de plan domiciliario y cronograma de sesiones de mantenimiento cada 3 meses.',
          subEventos: [
            {
              id: 501,
              titulo: 'Emisión de Certificado de Finalización',
              descripcion: 'Cierre formal del expediente y firma de conformidad del paciente.',
              fecha: 'Previsto: 2026-10-15',
              usuario: 'Dirección Médica',
              badge: 'Futuro',
            },
          ],
        },
      ],
    },
    {
      id: 'GEP-2024001',
      expedienteId: 'GEP-2024001',
      cliente: {
        nombre: 'Carlos Martínez Silva',
        cedula: '1.098.765.432',
        telefono: '+57 311 456 7890',
        email: 'carlos.martinez@email.com',
        ingreso: '2026-02-14',
        iniciales: 'CM',
      },
      especialistaAsignado: 'Mateo Zuluaga',
      tituloDiagrama: 'Diagrama de Flujo del Pedido',
      subtituloDiagrama: 'Trazabilidad y ciclo logístico del cliente',
      tituloCiclo: 'Progreso de Orden y Entrega al Cliente',
      descripcionCiclo: 'Etapas operativas desde la recepción comercial hasta la entrega física y conformidad',
      avanceGlobal: 75,
      faseActivaIndex: 2,
      fases: [
        {
          codigo: 'F1',
          nombre: 'Solicitud',
          etiquetaEstado: 'Completado',
          tipoEstado: 'completado',
          subtitulo: 'Creación de Pedido y Registro en Sistema',
          fechaRegistro: '2026-02-14',
          hitoClave: 'Pedido GEP-2024001 generado',
          responsable: 'Sistema Web GEP',
          porcentaje: 100,
          observaciones: '3 productos seleccionados por valor de $298.000 COP.',
          subEventos: [
            { id: 601, titulo: 'Registro Web', descripcion: 'El cliente realizó la orden online.', fecha: '2026-02-14 10:10', usuario: 'Portal Web', badge: 'Completado' },
          ],
        },
        {
          codigo: 'F2',
          nombre: 'Pago Verificado',
          etiquetaEstado: 'Firmado',
          tipoEstado: 'completado',
          subtitulo: 'Aprobación de Comprobante Nequi',
          fechaRegistro: '2026-02-14',
          hitoClave: 'Comprobante REF-1001 validado',
          responsable: 'Caja Principal / Andrea Ríos',
          porcentaje: 100,
          observaciones: 'Pago verificado exitosamente en cuenta corporativa.',
          subEventos: [
            { id: 602, titulo: 'Caja Aprobó Transacción', descripcion: 'Comprobante adjunto validado con banco.', fecha: '2026-02-14 10:45', usuario: 'Andrea Ríos', badge: 'Confirmado' },
          ],
        },
        {
          codigo: 'F3',
          nombre: 'En Preparación',
          etiquetaEstado: '75% en curso',
          tipoEstado: 'en_curso',
          subtitulo: 'Pick & Pack y Control de Calidad',
          fechaRegistro: '2026-02-14',
          hitoClave: '3 / 3 ítems empacados con precinto',
          responsable: 'Logística Central / Mateo Zuluaga',
          porcentaje: 75,
          observaciones: 'Paquete sellado en espera de despacho por transportadora local.',
          subEventos: [
            { id: 603, titulo: 'Picking en bodega', descripcion: 'Artículos reunidos y etiquetados.', fecha: '2026-02-14 11:30', usuario: 'Mateo Zuluaga', badge: 'Listo' },
            { id: 604, titulo: 'Control de calidad', descripcion: 'Inspección visual conforme.', fecha: '2026-02-14 12:00', usuario: 'Control Bodega', badge: 'Aprobado' },
          ],
        },
        {
          codigo: 'F4',
          nombre: 'En Ruta',
          etiquetaEstado: 'Control activo',
          tipoEstado: 'control',
          subtitulo: 'Asignación a mensajero motorizado',
          fechaRegistro: '2026-02-14',
          hitoClave: 'Guía de reparto #ENV-9821',
          responsable: 'Repartidor Juan Duque',
          porcentaje: 0,
          observaciones: 'Ruta hacia Carrera 14 #19-45 Armenia programada.',
          subEventos: [
            { id: 605, titulo: 'Despacho de vehículo', descripcion: 'Salida de bodega programada para las 14:00.', fecha: '2026-02-14 14:00', usuario: 'Juan Duque', badge: 'En Espera' },
          ],
        },
        {
          codigo: 'F5',
          nombre: 'Entregado',
          etiquetaEstado: 'Próximamente',
          tipoEstado: 'proximo',
          subtitulo: 'Prueba de Entrega con Fotografía',
          fechaRegistro: '2026-02-14',
          hitoClave: 'Firma y foto de entrega en portería',
          responsable: 'Juan Duque',
          porcentaje: 0,
          observaciones: 'Confirmación pendiente al arribo.',
          subEventos: [],
        },
      ],
    },
    {
      id: 'GEP-2024002',
      expedienteId: 'GEP-2024002',
      cliente: {
        nombre: 'Ana Rodríguez Pardo',
        cedula: '52.981.334',
        telefono: '+57 300 123 4567',
        email: 'ana.r@email.com',
        ingreso: '2026-02-15',
        iniciales: 'AR',
      },
      especialistaAsignado: 'Laura Torres',
      tituloDiagrama: 'Diagrama de Flujo del Pedido',
      subtituloDiagrama: 'Trazabilidad y ciclo logístico del cliente',
      tituloCiclo: 'Progreso de Orden y Entrega al Cliente',
      descripcionCiclo: 'Etapas operativas desde la recepción comercial hasta la entrega física y conformidad',
      avanceGlobal: 100,
      faseActivaIndex: 4,
      fases: [
        { codigo: 'F1', nombre: 'Solicitud', etiquetaEstado: 'Completado', tipoEstado: 'completado', subtitulo: 'Pedido Web', hitoClave: 'Orden GEP-2024002', responsable: 'Sistema', porcentaje: 100, subEventos: [] },
        { codigo: 'F2', nombre: 'Pago Verificado', etiquetaEstado: 'Firmado', tipoEstado: 'completado', subtitulo: 'Bancolombia', hitoClave: 'Aprobado', responsable: 'Caja', porcentaje: 100, subEventos: [] },
        { codigo: 'F3', nombre: 'Preparación', etiquetaEstado: 'Completado', tipoEstado: 'completado', subtitulo: 'Empaque final', hitoClave: 'Embalaje sellado', responsable: 'Logística', porcentaje: 100, subEventos: [] },
        { codigo: 'F4', nombre: 'En Tránsito', etiquetaEstado: 'Completado', tipoEstado: 'completado', subtitulo: 'Entrega en curso', hitoClave: 'Ruta cubierta', responsable: 'Transportadora', porcentaje: 100, subEventos: [] },
        { codigo: 'F5', nombre: 'Entregado', etiquetaEstado: 'Conforme', tipoEstado: 'completado', subtitulo: 'Recibido en portería', hitoClave: 'Foto de entrega confirmada', responsable: 'Laura Torres', porcentaje: 100, subEventos: [] },
      ],
    },
  ];

  getProcesses(): Observable<ClientProcess[]> {
    return of(this.processes).pipe(delay(150));
  }

  getProcessById(id: string): Observable<ClientProcess | undefined> {
    const found = this.processes.find(
      p => p.id.toLowerCase() === id.toLowerCase() || p.expedienteId.toLowerCase() === id.toLowerCase()
    );
    // If not found, return the first one as standard reference
    return of(found || this.processes[0]).pipe(delay(150));
  }

  addEventToStage(processId: string, stageCode: string, newEvent: { titulo: string; descripcion: string; usuario: string }): Observable<boolean> {
    const proc = this.processes.find(p => p.id === processId);
    if (!proc) return of(false);
    const stage = proc.fases.find(f => f.codigo === stageCode);
    if (!stage) return of(false);

    stage.subEventos.unshift({
      id: Date.now(),
      titulo: newEvent.titulo,
      descripcion: newEvent.descripcion,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      usuario: newEvent.usuario,
      badge: 'Registrado',
    });
    return of(true).pipe(delay(200));
  }
}
