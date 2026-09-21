import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaOperativaComponent } from '../caja-operativa/caja-operativa.component';

@Component({
  selector: 'app-caja-list',
  standalone: true,
  imports: [CommonModule, CajaOperativaComponent],
  template: `<app-caja-operativa></app-caja-operativa>`,
})
export class CajaListComponent {}
