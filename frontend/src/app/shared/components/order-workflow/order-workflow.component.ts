import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus, WORKFLOW_STEPS } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-workflow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="compact ? '' : 'p-1'">
      <!-- Horizontal workflow -->
      <div class="flex items-center min-w-[320px] sm:min-w-0" [class]="compact ? 'gap-0' : 'gap-0'">
        @for (step of steps; track step.status; let i = $index; let last = $last) {
          <!-- Step -->
          <div class="flex items-center" [class]="compact ? '' : 'flex-1'">
            <div class="flex flex-col items-center" [class]="compact ? 'min-w-[28px]' : 'min-w-[48px]'">
              <!-- Circle -->
              <div
                class="rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                [class]="getCircleClass(step.status, i)"
              >
                @if (isCompleted(step.status, i)) {
                  <span class="material-symbols-outlined" [class]="compact ? 'text-xs' : 'text-sm'">check</span>
                } @else if (isCurrent(step.status, i)) {
                  <span class="material-symbols-outlined" [class]="compact ? 'text-xs' : 'text-sm'">{{ step.icon }}</span>
                } @else {
                  <span class="material-symbols-outlined" [class]="compact ? 'text-[10px]' : 'text-sm'" style="opacity: 0.5">{{ step.icon }}</span>
                }
              </div>
              <!-- Label -->
              @if (!compact) {
                <p class="text-[10px] font-semibold mt-1.5 text-center leading-tight max-w-[60px]"
                  [class]="isCurrent(step.status, i) ? 'text-zinc-900' : isCompleted(step.status, i) ? 'text-emerald-600' : 'text-zinc-300'"
                >
                  {{ step.label }}
                </p>
              }
            </div>

            <!-- Connector line -->
            @if (!last) {
              <div class="flex-1 h-0.5 mx-0.5"
                [class]="compact ? 'min-w-[8px]' : 'min-w-[12px]'"
                [class.bg-emerald-400]="isCompleted(step.status, i) && isCompletedOrCurrent(steps[i + 1].status, i + 1)"
                [class.bg-zinc-200]="!isCompleted(step.status, i) || !isCompletedOrCurrent(steps[i + 1].status, i + 1)"
              ></div>
            }
          </div>
        }
      </div>

      <!-- Rejected / Cancelled indicator -->
      @if (isRejectedOrCancelled) {
        <div class="mt-3 flex items-center gap-2" [class]="compact ? 'mt-1.5' : 'mt-3'">
          <div class="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-white text-xs">close</span>
          </div>
          <span class="text-xs font-semibold text-rose-600">
            {{ status === 'rechazado' ? 'Rechazado' : 'Cancelado' }}
          </span>
        </div>
      }
    </div>
  `,
})
export class OrderWorkflowComponent {
  @Input() status: OrderStatus = 'nuevo';
  @Input() set currentStatus(val: OrderStatus) {
    if (val) this.status = val;
  }
  @Input() compact = false;

  steps = WORKFLOW_STEPS;

  private get statusIndex(): number {
    return this.steps.findIndex(s => s.status === this.status);
  }

  get isRejectedOrCancelled(): boolean {
    return this.status === 'rechazado' || this.status === 'cancelado';
  }

  isCompleted(stepStatus: OrderStatus, stepIndex: number): boolean {
    if (this.isRejectedOrCancelled) return false;
    return stepIndex < this.statusIndex;
  }

  isCurrent(stepStatus: OrderStatus, stepIndex: number): boolean {
    if (this.isRejectedOrCancelled) return false;
    return stepIndex === this.statusIndex;
  }

  isCompletedOrCurrent(stepStatus: OrderStatus, stepIndex: number): boolean {
    return this.isCompleted(stepStatus, stepIndex) || this.isCurrent(stepStatus, stepIndex);
  }

  getCircleClass(stepStatus: OrderStatus, stepIndex: number): string {
    const size = this.compact ? 'w-6 h-6' : 'w-8 h-8';

    if (this.isCompleted(stepStatus, stepIndex)) {
      return `${size} bg-emerald-500 text-white`;
    }
    if (this.isCurrent(stepStatus, stepIndex)) {
      return `${size} bg-zinc-900 text-white ring-4 ring-zinc-900/10 animate-pulse`;
    }
    return `${size} bg-zinc-100 text-zinc-400`;
  }
}
