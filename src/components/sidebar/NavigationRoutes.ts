/**
 * Central navigation config (ahadi-style).
 * Used by sidebar and breadcrumbs.
 */

export interface INavigationRoute {
  name: string;
  path: string;
  displayName: string;
  displayNameKey?: string;
  meta?: { icon?: string };
  children?: INavigationRoute[];
}

export interface NavigationConfig {
  root: { name: string; displayNameKey: string };
  routes: INavigationRoute[];
}

const config: NavigationConfig = {
  root: {
    name: "/",
    displayNameKey: "menu.overview",
  },
  routes: [
    {
      name: "dashboard",
      path: "/",
      displayName: "menu.overview",
      meta: { icon: "dashboard" },
    },
    {
      name: "owners",
      path: "/owners",
      displayName: "menu.owners",
      meta: { icon: "person" },
    },
    {
      name: "locations",
      path: "/locations",
      displayName: "menu.locations",
      meta: { icon: "place" },
    },
    {
      name: "properties",
      path: "/properties",
      displayName: "menu.properties",
      meta: { icon: "home" },
    },
    {
      name: "bills",
      path: "/bills",
      displayName: "menu.bills",
      meta: { icon: "receipt" },
    },
    {
      name: "payments",
      path: "/payments",
      displayName: "menu.payments",
      meta: { icon: "payment" },
    },
    {
      name: "notifications",
      path: "/notifications",
      displayName: "menu.notifications",
      meta: { icon: "notifications" },
    },
    {
      name: "profiles",
      path: "/profiles",
      displayName: "menu.profiles",
      meta: { icon: "person" },
    },
  ] as INavigationRoute[],
};

export default config;
