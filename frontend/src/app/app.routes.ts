import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

// Application routes configuration
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },

  // ─── Admin ──────────────────────────────────────────
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [roleGuard(['admin'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/admin/clients/client-list.component').then(m => m.ClientListComponent),
      },
      {
        path: 'clientes/:id',
        loadComponent: () =>
          import('./features/admin/clients/client-detail.component').then(m => m.ClientDetailComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/order-list/order-list.component').then(m => m.OrderListComponent),
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import('./features/admin/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/admin/payments/payments.component').then(m => m.PaymentsComponent),
      },
      {
        path: 'factura/:id',
        loadComponent: () =>
          import('./features/admin/invoice/invoice.component').then(m => m.InvoiceComponent),
      },
      {
        path: 'recibo/:id',
        loadComponent: () =>
          import('./features/admin/invoice/receipt.component').then(m => m.ReceiptComponent),
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./features/admin/stats/stats.component').then(m => m.StatsComponent),
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./features/admin/audit/audit-log.component').then(m => m.AuditLogComponent),
      },
    ],
  },

  // ─── Caja ───────────────────────────────────────────
  {
    path: 'caja',
    component: MainLayoutComponent,
    canActivate: [roleGuard(['caja'])],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/caja/caja-list/caja-list.component').then(m => m.CajaListComponent),
      },
    ],
  },

  // ─── TV ─────────────────────────────────────────────
  {
    path: 'tv',
    canActivate: [roleGuard(['tv'])],
    loadComponent: () =>
      import('./features/tv/tv.component').then(m => m.TvComponent),
  },

  // ─── Logística ──────────────────────────────────────
  {
    path: 'logistica',
    component: MainLayoutComponent,
    canActivate: [roleGuard(['logistica'])],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/logistica/logistica-list/logistica-list.component').then(m => m.LogisticaListComponent),
      },
    ],
  },

  // ─── Tracking (público) ─────────────────────────────
  {
    path: 'tracking',
    loadComponent: () =>
      import('./features/tracking/tracking.component').then(m => m.TrackingComponent),
  },
  {
    path: 'tracking/:folio',
    loadComponent: () =>
      import('./features/tracking/tracking.component').then(m => m.TrackingComponent),
  },

  // ─── Redirects ──────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
