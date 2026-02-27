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
            :to="route.children ? undefined : { name: route.name }"
            :active="routeHasActiveChild(route)"
            :active-color="activeColor"
            :text-color="textColor(route)"
            :aria-label="`${route.children ? 'Open category ' : 'Visit'} ${t(route.displayName)}`"
            role="button"
            hover-opacity="0.10"
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
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useColors } from "vuestic-ui";
import { useProfilesStore } from "@/stores";
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
const { t } = useI18n();
const { getColor, colorToRgba } = useColors();
const profilesStore = useProfilesStore();

const currentPlanName = computed(() => {
  return profilesStore.profile?.subscription?.plan?.name || null;
});

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
  routeHasActiveChild(r) ? "primary" : "secondary";
const textColor = (r: INavigationRoute) =>
  routeHasActiveChild(r) ? "primary" : "textPrimary";
const arrowDirection = (state: boolean) =>
  state ? "va-arrow-up" : "va-arrow-down";

watch(() => route.fullPath, setActiveExpand, { immediate: true });
</script>

<style scoped>
.app-sidebar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.app-sidebar :deep(.va-sidebar__content) {
  padding: 0.5rem 0;
}

.app-sidebar :deep(.va-sidebar-item) {
  border-radius: 8px;
  margin: 0.125rem 0.5rem;
  transition: all 0.2s ease;
}

.app-sidebar :deep(.va-sidebar-item:hover) {
  background-color: rgba(66, 153, 225, 0.08);
}

.app-sidebar :deep(.va-sidebar-item--active) {
  background-color: rgba(66, 153, 225, 0.12);
  border-left: 3px solid #4299e1;
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
</style>
