import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSubscription, type SubscriptionFeature } from "@/composables/useSubscription";

import AuthLayout from "@/layouts/AuthLayout.vue";
import AppLayout from "@/layouts/AppLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/admin",
    name: "admin",
    component: AppLayout,
    meta: { requiresAuth: true },
    redirect: { name: "dashboard" },
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/views/Dashboard.vue"),
      },
      {
        path: "owners",
        name: "owners",
        component: () => import("@/views/Owners.vue"),
      },
      {
        path: "locations",
        name: "locations",
        component: () => import("@/views/Locations.vue"),
      },
      {
        path: "properties",
        name: "properties",
        component: () => import("@/views/Properties.vue"),
      },
      {
        path: "properties/:id",
        name: "property-details",
        component: () => import("@/views/PropertyDetails.vue"),
      },
      {
        path: "units",
        name: "units",
        component: () => import("@/views/Units.vue"),
      },
      {
        path: "tenants",
        name: "tenants",
        component: () => import("@/views/Tenants.vue"),
      },
      {
        path: "tenancies",
        name: "tenancies",
        component: () => import("@/views/Tenancies.vue"),
      },
      {
        path: "bills",
        name: "bills",
        component: () => import("@/views/Bills.vue"),
        meta: { requiredFeature: "payment_tracking" as SubscriptionFeature },
      },
      {
        path: "payments",
        name: "payments",
        component: () => import("@/views/Payments.vue"),
        meta: { requiredFeature: "payment_tracking" as SubscriptionFeature },
      },
      {
        path: "notifications",
        name: "notifications",
        component: () => import("@/views/Notifications.vue"),
        meta: { requiredFeature: "sms_notifications" as SubscriptionFeature },
      },
      {
        path: "profiles",
        name: "profiles",
        component: () => import("@/views/Profiles.vue"),
      },
      {
        path: "subscription/plans",
        name: "subscription-plans",
        component: () => import("@/views/SubscriptionPlans.vue"),
      },
      {
        path: "subscription/upgrade",
        redirect: { name: "subscription-plans" },
      },
      {
        path: "subscription/renew",
        redirect: { name: "subscription-plans" },
      },
    ],
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/Register.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/auth",
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("@/views/Login.vue"),
      },
      {
        path: "",
        redirect: { name: "login" },
      },
    ],
  },
  {
    path: "/login",
    redirect: { name: "login" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "home" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" as const };
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  // 1. Auth guard
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login" });
    return;
  }
  if (to.path.startsWith("/auth") && authStore.isAuthenticated) {
    next({ name: "dashboard" });
    return;
  }

  // 2. Subscription feature guard
  const requiredFeature = to.meta.requiredFeature as
    | SubscriptionFeature
    | undefined;
  if (requiredFeature && authStore.isAuthenticated) {
    const { hasFeature } = useSubscription();

    if (!hasFeature(requiredFeature)) {
      // Feature not available – send to subscription plans
      next({ name: "subscription-plans", query: { upgrade: requiredFeature } });
      return;
    }
  }

  next();
});

export default router;
