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
      <VaCollapse v-for="(route, index) in NavigationRoutes.routes" :key="index">
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
            <VaSidebarItemContent class="py-3 pr-2 pl-4">
              <VaIcon
                v-if="route.meta?.icon"
                aria-hidden="true"
                :name="route.meta.icon"
                size="20px"
                :color="iconColor(route)"
              />
              <VaSidebarItemTitle class="flex justify-between items-center leading-5 font-semibold">
                {{ t(route.displayName) }}
                <VaIcon v-if="route.children" :name="arrowDirection(isCollapsed)" size="20px" />
              </VaSidebarItemTitle>
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
        <template #body>
          <div v-for="(childRoute, index2) in (route.children || [])" :key="index2">
            <VaSidebarItem
              :to="{ name: childRoute.name }"
              :active="isActiveChildRoute(childRoute)"
              :active-color="activeColor"
              :text-color="textColor(childRoute)"
              :aria-label="`Visit ${t(childRoute.displayName)}`"
              hover-opacity="0.10"
            >
              <VaSidebarItemContent class="py-3 pr-2 pl-11">
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
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'
import NavigationRoutes from './NavigationRoutes'
import type { INavigationRoute } from './NavigationRoutes'

const props = withDefaults(
  defineProps<{
    visible?: boolean
    minimized?: boolean
    mobile?: boolean
  }>(),
  {
    visible: true,
    minimized: false,
    mobile: false,
  }
)

const route = useRoute()
const { t } = useI18n()
const { getColor, colorToRgba } = useColors()

const value = ref<boolean[]>([])

const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>()
const writableVisibleWithEmit = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
})

const sidebarWidth = computed(() => (props.mobile ? '100vw' : '280px'))
const color = computed(() => getColor('background-secondary'))
const activeColor = computed(() => colorToRgba(getColor('focus'), 0.1))

const isActiveChildRoute = (child: INavigationRoute) => route.name === child.name

const routeHasActiveChild = (section: INavigationRoute) => {
  if (!section.children) {
    if (section.path === '/') return route.path === '/'
    return route.path.startsWith(section.path)
  }
  return section.children.some((c) => route.name === c.name || route.path.startsWith(c.path))
}

const setActiveExpand = () => {
  value.value = NavigationRoutes.routes.map((r: INavigationRoute) => routeHasActiveChild(r))
}

const iconColor = (r: INavigationRoute) => (routeHasActiveChild(r) ? 'primary' : 'secondary')
const textColor = (r: INavigationRoute) => (routeHasActiveChild(r) ? 'primary' : 'textPrimary')
const arrowDirection = (state: boolean) => (state ? 'va-arrow-up' : 'va-arrow-down')

watch(() => route.fullPath, setActiveExpand, { immediate: true })
</script>

<style scoped>
.app-sidebar :deep(.va-sidebar__content) {
  padding: 0.5rem 0;
}
</style>
