import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientTimelineService } from '../../../core/services/client-timeline.service';
import { ClientProcess, ClientStage } from '../../../core/models/client-timeline.model';

@Component({
  selector: 'app-client-timeline',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    @if (process) {
      <div class="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
        <!-- Top Navigation Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a
              routerLink="/admin/pedidos"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              Volver a Pacientes / Pedidos
            </a>

            <!-- Process Selector Dropdown -->
            <div class="relative inline-block text-left">
              <select
                class="bg-white border border-zinc-200/90 text-zinc-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
                [ngModel]="process.id"
                (ngModelChange)="onSelectProcess($event)"
              >
                @for (item of allProcesses; track item.id) {
                  <option [value]="item.id">
                    {{ item.cliente.nombre }} ({{ item.expedienteId }})
                  </option>
                }
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-zinc-400 tracking-wider">
              Expediente ID: <span class="text-zinc-700 font-bold">{{ process.expedienteId }}</span>
            </span>
          </div>
        </div>

        <!-- Patient / Client Header Card -->
        <div class="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <!-- Left: Avatar + Info -->
            <div class="flex items-start sm:items-center gap-4 sm:gap-5">
              <!-- Dark square avatar with initials -->
              <div class="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span class="text-white text-lg font-extrabold tracking-tight">{{ process.cliente.iniciales }}</span>
              </div>

              <!-- Details -->
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2.5">
                  <h1 class="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">
                    {{ process.cliente.nombre }}
                  </h1>
                  <span class="text-xs text-zinc-400 font-medium bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100">
                    Ingreso: {{ process.cliente.ingreso }}
                  </span>
                </div>

                <!-- Contact & Identifiers -->
                <div class="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-500 font-medium">
                  <div class="inline-flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-zinc-400">badge</span>
                    <span>CC: {{ process.cliente.cedula }}</span>
                  </div>
                  <div class="inline-flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-zinc-400">call</span>
                    <span>{{ process.cliente.telefono }}</span>
                  </div>
                  <div class="inline-flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-zinc-400">mail</span>
                    <span>{{ process.cliente.email }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Specialist / Advisor -->
            <div class="md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 flex-shrink-0">
              <p class="text-[10px] sm:text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-0.5">
                Especialista Asignado
              </p>
              <p class="text-sm sm:text-base font-extrabold text-zinc-900">
                {{ process.especialistaAsignado }}
              </p>
            </div>
          </div>
        </div>

        <!-- Section Title with Dark Icon -->
        <div class="flex items-center gap-3 pt-2">
          <div class="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0 text-white">
            <span class="material-symbols-outlined text-[20px]">monitor_heart</span>
          </div>
          <div>
            <h2 class="text-base font-bold text-zinc-900 leading-tight">
              {{ process.tituloDiagrama }}
            </h2>
            <p class="text-xs text-zinc-400">
              {{ process.subtituloDiagrama }}
            </p>
          </div>
        </div>

        <!-- Main Timeline Diagram Card -->
        <div class="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <!-- Card Header & Overall Progress -->
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-8 border-b border-zinc-100">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2.5">
                <span class="text-[11px] font-extrabold tracking-widest uppercase text-zinc-400">
                  Diagrama de Flujo
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-900 text-white">
                  En Curso ({{ process.avanceGlobal }}%)
                </span>
              </div>
              <h3 class="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">
                {{ process.tituloCiclo }}
              </h3>
              <p class="text-xs text-zinc-500 max-w-2xl">
                {{ process.descripcionCiclo }}
              </p>
            </div>

            <!-- Global Progress Bar -->
            <div class="bg-zinc-50/80 border border-zinc-100 rounded-xl p-3.5 sm:min-w-[240px]">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Avance Global
                </span>
                <span class="text-base font-black text-zinc-900">
                  {{ process.avanceGlobal }}%
                </span>
              </div>
              <div class="w-full h-2.5 bg-zinc-200/80 rounded-full overflow-hidden">
                <div
                  class="h-full bg-zinc-900 rounded-full transition-all duration-700 ease-out"
                  [style.width.%]="process.avanceGlobal"
                ></div>
              </div>
            </div>
          </div>

          <!-- Horizontal Interactive Timeline Stepper -->
          <div class="py-10 px-2 sm:px-6 overflow-x-auto">
            <div class="min-w-[650px] relative">
              <!-- Stepper Connecting Lines -->
              <div class="absolute top-[22px] left-[35px] right-[35px] h-[2px] bg-zinc-200 -z-0"></div>
              
              <!-- Colored Progress Line up to active stage -->
              <div
                class="absolute top-[22px] left-[35px] h-[2px] bg-zinc-900 -z-0 transition-all duration-500"
                [style.width]="connectorLineWidth"
              ></div>

              <!-- Step Nodes Container -->
              <div class="flex items-start justify-between relative z-10">
                @for (stage of process.fases; track stage.codigo; let idx = $index) {
                  <div
                    class="flex flex-col items-center cursor-pointer group select-none transition-transform duration-200"
                    (click)="selectedStageIndex = idx"
                    [class.scale-105]="selectedStageIndex === idx"
                  >
                    <!-- Node Circle -->
                    <div class="relative flex items-center justify-center">
                      @if (stage.tipoEstado === 'completado') {
                        <!-- Completed: Solid black circle with check -->
                        <div class="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center ring-4 ring-white shadow-xs transition-colors group-hover:bg-zinc-800">
                          <span class="material-symbols-outlined text-lg font-bold">check</span>
                        </div>
                      } @else if (stage.tipoEstado === 'en_curso') {
                        <!-- Active: Outer dark border ring, inner emerald pulsing dot -->
                        <div class="w-11 h-11 rounded-full border-2 border-zinc-900 bg-white ring-4 ring-white flex items-center justify-center shadow-xs">
                          <div class="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                      } @else if (stage.tipoEstado === 'control') {
                        <!-- Control / Upcoming: Light ring with subtle emerald dot -->
                        <div class="w-11 h-11 rounded-full border-2 border-emerald-500/60 bg-white ring-4 ring-white flex items-center justify-center shadow-xs group-hover:border-emerald-500">
                          <div class="w-3.5 h-3.5 rounded-full bg-emerald-500/80"></div>
                        </div>
                      } @else {
                        <!-- Future: Soft ring with step number -->
                        <div class="w-11 h-11 rounded-full border border-zinc-200 bg-zinc-50 ring-4 ring-white flex items-center justify-center text-zinc-400 font-bold text-xs shadow-xs group-hover:border-zinc-300">
                          <span>{{ idx + 1 }}</span>
                        </div>
                      }

                      <!-- Selected / Active Indicator Diamond underneath node -->
                      @if (selectedStageIndex === idx) {
                        <div class="absolute -bottom-3 transform text-zinc-900 animate-bounce">
                          <div class="w-2.5 h-2.5 bg-zinc-900 rotate-45"></div>
                        </div>
                      }
                    </div>

                    <!-- Labels & Status Badge -->
                    <div class="text-center mt-4 max-w-[120px]">
                      <p
                        class="text-xs sm:text-sm font-bold tracking-tight transition-colors"
                        [class.text-zinc-900]="selectedStageIndex === idx || stage.tipoEstado === 'completado' || stage.tipoEstado === 'en_curso'"
                        [class.text-zinc-400]="stage.tipoEstado === 'proximo' && selectedStageIndex !== idx"
                      >
                        {{ stage.nombre }}
                      </p>

                      <!-- Badge corresponding to status in the screenshot -->
                      <div class="mt-1.5 flex justify-center">
                        @if (stage.tipoEstado === 'completado') {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                            {{ stage.etiquetaEstado }}
                          </span>
                        } @else if (stage.tipoEstado === 'en_curso') {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {{ stage.etiquetaEstado }}
                          </span>
                        } @else if (stage.tipoEstado === 'control') {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50/60 text-emerald-700 border border-emerald-200/80">
                            {{ stage.etiquetaEstado }}
                          </span>
                        } @else {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-50 text-zinc-400 border border-zinc-200/70">
                            {{ stage.etiquetaEstado }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Active / Selected Stage Details Card (e.g. F3) -->
          @if (currentStage) {
            <div class="mt-6 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-5 sm:p-6 transition-all duration-300">
              <!-- Stage Header Row -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/60">
                <div class="flex items-start sm:items-center gap-3.5">
                  <!-- Dark Stage Tag (F1, F2, F3...) -->
                  <div class="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs">
                    {{ currentStage.codigo }}
                  </div>

                  <div>
                    <h4 class="text-sm sm:text-base font-extrabold text-zinc-900 leading-tight">
                      {{ currentStage.nombre }} · {{ currentStage.subtitulo }}
                    </h4>
                    <p class="text-xs text-zinc-400 mt-0.5">
                      Fase {{ selectedStageIndex + 1 }} de {{ process.fases.length }} del ciclo del cliente
                    </p>
                  </div>
                </div>

                <!-- Right: Date and Status Badge -->
                <div class="flex items-center gap-3 sm:text-right">
                  @if (currentStage.fechaRegistro) {
                    <div>
                      <p class="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                        Fecha de Registro
                      </p>
                      <p class="text-xs font-bold text-zinc-800">
                        {{ currentStage.fechaRegistro }}
                      </p>
                    </div>
                  }

                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                    [class.bg-emerald-50]="currentStage.tipoEstado === 'en_curso' || currentStage.tipoEstado === 'control'"
                    [class.text-emerald-700]="currentStage.tipoEstado === 'en_curso' || currentStage.tipoEstado === 'control'"
                    [class.border-emerald-200]="currentStage.tipoEstado === 'en_curso' || currentStage.tipoEstado === 'control'"
                    [class.bg-zinc-100]="currentStage.tipoEstado === 'completado'"
                    [class.text-zinc-800]="currentStage.tipoEstado === 'completado'"
                    [class.border-zinc-200]="currentStage.tipoEstado === 'completado'"
                    [class.bg-zinc-50]="currentStage.tipoEstado === 'proximo'"
                    [class.text-zinc-400]="currentStage.tipoEstado === 'proximo'"
                    [class.border-zinc-200]="currentStage.tipoEstado === 'proximo'"
                  >
                    {{ currentStage.etiquetaEstado }}
                  </span>
                </div>
              </div>

              <!-- Stage Metadata Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <div class="bg-white p-4 rounded-xl border border-zinc-200/60 shadow-2xs">
                  <p class="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">
                    Hito Clave
                  </p>
                  <p class="text-sm font-bold text-zinc-900">
                    {{ currentStage.hitoClave }}
                  </p>
                  <div class="mt-2 w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-zinc-900 rounded-full transition-all duration-500"
                      [style.width.%]="currentStage.porcentaje"
                    ></div>
                  </div>
                </div>

                <div class="bg-white p-4 rounded-xl border border-zinc-200/60 shadow-2xs">
                  <p class="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">
                    Responsable de Etapa
                  </p>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-zinc-400">person</span>
                    <p class="text-sm font-bold text-zinc-900">
                      {{ currentStage.responsable }}
                    </p>
                  </div>
                </div>

                <div class="bg-white p-4 rounded-xl border border-zinc-200/60 shadow-2xs sm:col-span-2 lg:col-span-1">
                  <p class="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">
                    Observaciones Operativas
                  </p>
                  <p class="text-xs text-zinc-600 leading-relaxed">
                    {{ currentStage.observaciones || 'Etapa pendiente de inicio formal según protocolo.' }}
                  </p>
                </div>
              </div>

              <!-- Chronological Sub-events in this stage -->
              <div class="mt-6 pt-5 border-t border-zinc-200/60">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-zinc-700">history</span>
                    <h5 class="text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Trazabilidad Detallada de la Etapa ({{ currentStage.subEventos.length }} registros)
                    </h5>
                  </div>

                  <button
                    class="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    (click)="showAddEventModal = true"
                    id="btn-add-event"
                  >
                    <span class="material-symbols-outlined text-sm">add_circle</span>
                    Registrar Avance
                  </button>
                </div>

                @if (currentStage.subEventos.length > 0) {
                  <div class="space-y-3">
                    @for (ev of currentStage.subEventos; track ev.id) {
                      <div class="bg-white border border-zinc-200/70 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 transition-colors">
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-zinc-900">{{ ev.titulo }}</span>
                            @if (ev.badge) {
                              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                                {{ ev.badge }}
                              </span>
                            }
                          </div>
                          <p class="text-xs text-zinc-500">{{ ev.descripcion }}</p>
                        </div>
                        <div class="text-left sm:text-right flex-shrink-0">
                          <p class="text-[11px] font-semibold text-zinc-400">{{ ev.fecha }}</p>
                          <p class="text-[11px] font-medium text-zinc-600">{{ ev.usuario }}</p>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="bg-white border border-zinc-200/50 rounded-xl p-6 text-center text-zinc-400 text-xs">
                    <span class="material-symbols-outlined text-2xl mb-1 text-zinc-300">hourglass_top</span>
                    <p>No se han registrado sesiones o incidencias en esta fase aún.</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Add Milestone Modal -->
      @if (showAddEventModal) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-base font-bold text-zinc-900">
                Registrar Hito en {{ currentStage?.codigo }} ({{ currentStage?.nombre }})
              </h4>
              <button
                class="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg"
                (click)="showAddEventModal = false"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="micro-label block mb-1">Título del Evento / Sesión</label>
                <input
                  type="text"
                  class="input-premium w-full text-xs"
                  placeholder="Ej: Sesión #8 - Control de medidas"
                  [(ngModel)]="newEventTitle"
                />
              </div>

              <div>
                <label class="micro-label block mb-1">Descripción / Observación Clínica</label>
                <textarea
                  class="input-premium w-full text-xs h-20 resize-none"
                  placeholder="Detalles de la sesión, equipo utilizado o estado del cliente..."
                  [(ngModel)]="newEventDesc"
                ></textarea>
              </div>

              <div>
                <label class="micro-label block mb-1">Especialista Responsable</label>
                <input
                  type="text"
                  class="input-premium w-full text-xs"
                  [(ngModel)]="newEventUser"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                class="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                (click)="showAddEventModal = false"
              >
                Cancelar
              </button>
              <button
                class="btn-primary text-xs px-5 py-2"
                [disabled]="!newEventTitle.trim()"
                (click)="saveNewEvent()"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      }
    } @else {
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-zinc-300 animate-spin mb-2">progress_activity</span>
          <p class="text-sm text-zinc-400">Cargando trazabilidad del cliente...</p>
        </div>
      </div>
    }
  `,
})
export class ClientTimelineComponent implements OnInit {
  process: ClientProcess | null = null;
  allProcesses: ClientProcess[] = [];
  selectedStageIndex = 2; // Default to active phase F3

  showAddEventModal = false;
  newEventTitle = '';
  newEventDesc = '';
  newEventUser = 'Camila Herrera';

  constructor(
    private route: ActivatedRoute,
    private timelineService: ClientTimelineService
  ) {}

  ngOnInit(): void {
    this.timelineService.getProcesses().subscribe(list => {
      this.allProcesses = list;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || 'pat-001';
      this.loadProcess(id);
    });
  }

  loadProcess(id: string): void {
    this.timelineService.getProcessById(id).subscribe(proc => {
      if (proc) {
        this.process = proc;
        this.selectedStageIndex = proc.faseActivaIndex;
        this.newEventUser = proc.especialistaAsignado;
      }
    });
  }

  onSelectProcess(id: string): void {
    this.loadProcess(id);
  }

  get currentStage(): ClientStage | undefined {
    return this.process?.fases[this.selectedStageIndex];
  }

  get connectorLineWidth(): string {
    if (!this.process || this.process.fases.length <= 1) return '0%';
    const activeIdx = this.process.faseActivaIndex;
    const total = this.process.fases.length - 1;
    const pct = (activeIdx / total) * 100;
    return `${pct}%`;
  }

  saveNewEvent(): void {
    if (!this.process || !this.currentStage || !this.newEventTitle.trim()) return;

    this.timelineService
      .addEventToStage(this.process.id, this.currentStage.codigo, {
        titulo: this.newEventTitle.trim(),
        descripcion: this.newEventDesc.trim(),
        usuario: this.newEventUser.trim() || this.process.especialistaAsignado,
      })
      .subscribe(() => {
        this.showAddEventModal = false;
        this.newEventTitle = '';
        this.newEventDesc = '';
      });
  }
}
