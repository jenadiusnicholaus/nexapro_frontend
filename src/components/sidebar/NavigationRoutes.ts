/**
 * Central navigation config (ahadi-style).
 * Used by MainLayout sidebar and optionally by breadcrumbs.
 */

export interface NavigationRoute {
  name: string
  path: string
  displayName: string
  meta?: { icon?: string }
}

export interface NavigationConfig {
  root: { name: string; displayName: string }
  routes: NavigationRoute[]
}

const config: NavigationConfig = {
  root: {
    name: '/',
    displayName: 'Overview',
  },
  routes: [
    { name: 'dashboard', path: '/', displayName: 'Overview', meta: { icon: 'dashboard' } },
    { name: 'owners', path: '/owners', displayName: 'Owners', meta: { icon: 'person' } },
    { name: 'locations', path: '/locations', displayName: 'Locations', meta: { icon: 'place' } },
    { name: 'properties', path: '/properties', displayName: 'Properties', meta: { icon: 'home' } },
    { name: 'units', path: '/units', displayName: 'Units', meta: { icon: 'apartment' } },
    { name: 'tenants', path: '/tenants', displayName: 'Tenants', meta: { icon: 'people' } },
    { name: 'tenancies', path: '/tenancies', displayName: 'Tenancies', meta: { icon: 'assignment' } },
    { name: 'bills', path: '/bills', displayName: 'Bills', meta: { icon: 'receipt' } },
    { name: 'payments', path: '/payments', displayName: 'Payments', meta: { icon: 'payment' } },
    { name: 'notifications', path: '/notifications', displayName: 'Notifications', meta: { icon: 'notifications' } },
  ],
}

export default config
