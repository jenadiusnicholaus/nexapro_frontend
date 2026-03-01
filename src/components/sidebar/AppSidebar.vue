<template>
  <VaSidebar
    v-model="writableVisibleWithEmit"
    :width="sidebarWidth"
    :color="color"
    :minimized="minimized"
    minimized-width="0"
    class="app-sidebar"
  >
    <VaAccordion v-model="value" multiple>
      <VaCollapse
        v-for="(route, index) in NavigationRoutes.routes"
        :key="index"
      >
        <template #header="{ value: isCollapsed }">
          <VaSidebarItem
            :to="getItemRoute(route)"
            :active="routeHasActiveChild(route)"
            :active-color="activeColor"
            :text-color="textColor(route)"
            :aria-label="`${route.children ? 'Open category ' : 'Visit'} ${t(route.displayName)}`"
            role="button"
            hover-opacity="0.10"
            :class="{ 'sidebar-locked': isRouteLocked(route) }"
            @click="onSidebarItemClick($event, route)"
          >
            <VaSidebarItemContent class="py-2 pr-2 pl-4">
              <VaIcon
                v-if="route.meta?.icon"
                aria-hidden="true"
                :name="route.meta.icon"
                size="20px"
                :color="iconColor(route)"
              />
              <VaSidebarItemTitle
                class="flex justify-between items-center leading-5 font-semibold"
              >
                <span>{{ t(route.displayName) }}</span>
                <div class="flex items-center gap-2">
                  <!-- Lock icon for restricted features -->
                  <VaIcon
                    v-if="isRouteLocked(route)"
                    name="lock"
                    size="16px"
                    color="warning"
                    class="sidebar-lock-icon"
                  />
                  <VaBadge
                    v-if="
                      route.name === 'subscription-plans' && currentPlanName
                    "
                    :text="currentPlanName"
                    color="primary"
                    class="subscription-menu-badge"
                  />
                  <VaIcon
                    v-if="route.children"
                    :name="arrowDirection(isCollapsed)"
                    size="20px"
                  />
                </div>
              </VaSidebarItemTitle>
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
        <template #body>
          <div
            v-for="(childRoute, index2) in route.children || []"
            :key="index2"
          >
            <VaSidebarItem
              :to="{ name: childRoute.name }"
              :active="isActiveChildRoute(childRoute)"
              :active-color="activeColor"
              :text-color="textColor(childRoute)"
              :aria-label="`Visit ${t(childRoute.displayName)}`"
              hover-opacity="0.10"
            >
              <VaSidebarItemContent class="py-2 pr-2 pl-11">
                <VaSidebarItemTitle class="leading-5 font-semibold">
                  {{ t(childRoute.displayName) }}
                </VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </div>
        </template>
      </VaCollapse>
    </VaAccordion>
  </VaSidebar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useColors } from "vuestic-ui";
import { useProfilesStore } from "@/stores";
import { useSubscription } from "@/composables/useSubscription";
import NavigationRoutes from "./NavigationRoutes";
import type { INavigationRoute } from "./NavigationRoutes";

const props = withDefaults(
  defineProps<{
    visible?: boolean;
    minimized?: boolean;
    mobile?: boolean;
  }>(),
  {
    visible: true,
    minimized: false,
    mobile: false,
  },
);

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getColor, colorToRgba } = useColors();
const profilesStore = useProfilesStore();
const { hasFeature, showUpgradePrompt } = useSubscription();

const currentPlanName = computed(() => {
  return profilesStore.profile?.subscription?.plan?.name || null;
});

/** Returns true if the route requires a feature the current plan doesn't have */
const isRouteLocked = (r: INavigationRoute): boolean => {
  if (!r.requiredFeature) return false;
  return !hasFeature(r.requiredFeature);
};

/** If route is locked, return undefined (no navigation). Otherwise return normal route. */
const getItemRoute = (r: INavigationRoute) => {
  if (isRouteLocked(r)) return undefined;
  return r.children ? undefined : { name: r.name };
};

/** Intercept click on locked items to show upgrade prompt */
const onSidebarItemClick = (event: MouseEvent, r: INavigationRoute) => {
  if (isRouteLocked(r)) {
    event.preventDefault();
    event.stopPropagation();
    showUpgradePrompt(r.requiredFeature);
  }
};

const value = ref<boolean[]>([]);

const emit = defineEmits<{ (e: "update:visible", v: boolean): void }>();
const writableVisibleWithEmit = computed({
  get: () => props.visible,
  set: (v: boolean) => emit("update:visible", v),
});

const sidebarWidth = computed(() => (props.mobile ? "100vw" : "280px"));
const color = computed(() => getColor("background-secondary"));
const activeColor = computed(() => colorToRgba(getColor("focus"), 0.1));

const isActiveChildRoute = (child: INavigationRoute) =>
  route.name === child.name;

const routeHasActiveChild = (section: INavigationRoute) => {
  if (!section.children) {
    if (section.path === "/") return route.path === "/";
    return route.path.startsWith(section.path);
  }
  return section.children.some(
    (c) => route.name === c.name || route.path.startsWith(c.path),
  );
};

const setActiveExpand = () => {
  value.value = NavigationRoutes.routes.map((r: INavigationRoute) =>
    routeHasActiveChild(r),
  );
};

const iconColor = (r: INavigationRoute) =>
  isRouteLocked(r) ? "secondary" : routeHasActiveChild(r) ? "primary" : "secondary";
const textColor = (r: INavigationRoute) =>
  isRouteLocked(r) ? "secondary" : routeHasActiveChild(r) ? "primary" : "textPrimary";
const arrowDirection = (state: boolean) =>
  state ? "va-arrow-up" : "va-arrow-down";

watch(() => route.fullPath, setActiveExpand, { immediate: true });
</script>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.04);
}

.app-sidebar :deep(.va-sidebar__content) {
  padding: 0.5rem 0;
}

.app-sidebar :deep(.va-sidebar-item) {
  border-radius: 10px;
  margin: 0.15rem 0.5rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-sidebar :deep(.va-sidebar-item:hover) {
  background-color: rgba(34, 197, 94, 0.08);
}

.app-sidebar :deep(.va-sidebar-item--active) {
  background-color: rgba(34, 197, 94, 0.12);
  border-left: 3px solid #22c55e;
}

.app-sidebar :deep(.va-sidebar-item__content) {
  font-weight: 500;
}

.app-sidebar :deep(.va-icon) {
  transition: transform 0.2s ease;
}

.app-sidebar :deep(.va-sidebar-item:hover .va-icon) {
  transform: scale(1.1);
}

.subscription-menu-badge {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  font-weight: 600;
}

/* Locked sidebar items */
.sidebar-locked {
  opacity: 0.55;
  cursor: not-allowed !important;
}
.sidebar-locked:hover {
  opacity: 0.7;
}
.sidebar-lock-icon {
  animation: pulse-lock 2s infinite;
}
@keyframes pulse-lock {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>
