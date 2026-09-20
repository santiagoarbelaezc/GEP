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
    { label: 'Pedidos', icon: 'receipt_long', route: '/admin/pedidos' },
    { label: 'Estadísticas', icon: 'bar_chart', route: '/admin/estadisticas' },
  ],
  caja: [
    { label: 'Pedidos Pendientes', icon: 'point_of_sale', route: '/caja' },
  ],
  tv: [],
  logistica: [
    { label: 'Entregas', icon: 'local_shipping', route: '/logistica' },
  ],
};
