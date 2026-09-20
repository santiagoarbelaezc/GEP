export type UserRole = 'admin' | 'caja' | 'tv' | 'logistica';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  caja: 'Caja',
  tv: 'Pantalla TV',
  logistica: 'Logística',
};

export const ROLE_MENUS: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Clientes', icon: 'people', route: '/admin/clientes' },
    { label: 'Pedidos', icon: 'receipt_long', route: '/admin/pedidos' },
    { label: 'Pagos', icon: 'payments', route: '/admin/pagos' },
    { label: 'Estadísticas', icon: 'bar_chart', route: '/admin/estadisticas' },
    { label: 'Auditoría', icon: 'shield', route: '/admin/auditoria' },
  ],
  caja: [
    { label: 'Pedidos Pendientes', icon: 'point_of_sale', route: '/caja' },
  ],
  tv: [],
  logistica: [
    { label: 'Entregas', icon: 'local_shipping', route: '/logistica' },
  ],
};
