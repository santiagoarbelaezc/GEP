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

  // ─── Visor Pantalla Completa Comprobante (Sin Layout / Sin Panel de Control) ───
  {
    path: 'caja/pedido/:id/comprobante',
    canActivate: [roleGuard(['caja', 'admin'])],
    loadComponent: () =>
      import('./features/caja/caja-comprobante-visor/caja-comprobante-visor.component').then(m => m.CajaComprobanteVisorComponent),
  },

  // ─── Caja ───────────────────────────────────────────
  {
    path: 'caja',
    component: MainLayoutComponent,
    canActivate: [roleGuard(['caja', 'admin'])],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/caja/caja-operativa/caja-operativa.component').then(m => m.CajaOperativaComponent),
      },
      {
        path: 'operativa',
        loadComponent: () =>
          import('./features/caja/caja-operativa/caja-operativa.component').then(m => m.CajaOperativaComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/caja/caja-pedidos/caja-pedidos.component').then(m => m.CajaPedidosComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/caja/caja-clientes/caja-clientes.component').then(m => m.CajaClientesComponent),
      },
      {
        path: 'arqueo',
        loadComponent: () =>
          import('./features/caja/caja-arqueo/caja-arqueo.component').then(m => m.CajaArqueoComponent),
      },
      {
        path: 'pedido/:id',
        loadComponent: () =>
          import('./features/caja/caja-pedido-detalle/caja-pedido-detalle.component').then(m => m.CajaPedidoDetalleComponent),
      },
      {
        path: 'cliente/:id/pedidos',
        loadComponent: () =>
          import('./features/caja/caja-cliente-pedidos/caja-cliente-pedidos.component').then(m => m.CajaClientePedidosComponent),
      },
    ],
  },

  // ─── TV ─────────────────────────────────────────────
  {
    path: 'tv',
    canActivate: [roleGuard(['tv', 'admin', 'caja'])],
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
