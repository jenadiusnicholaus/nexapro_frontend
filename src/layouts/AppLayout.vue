<template>
  <VaLayout
    :top="{ fixed: true, order: 2 }"
    :left="{
      fixed: true,
      absolute: breakpoints.mdDown,
      order: 1,
      overlay: breakpoints.mdDown && !isSidebarMinimized,
    }"
    @left-overlay-click="isSidebarMinimized = true"
  >
    <template #top>
      <AppNavbar :is-mobile="isMobile" />
    </template>

    <template #left>
      <AppSidebar :minimized="isSidebarMinimized" :animated="!isMobile" :mobile="isMobile" />
    </template>

    <template #content>
      <div :class="{ minimized: isSidebarMinimized }" class="app-layout__sidebar-wrapper">
        <div v-if="isFullScreenSidebar" class="app-layout__sidebar-close flex justify-end">
          <VaButton class="px-4 py-4" icon="md_close" preset="plain" @click="onCloseSidebarButtonClick" />
        </div>
      </div>
      <AppLayoutNavigation v-if="!isMobile" class="app-layout__nav" />
      <main class="app-layout__main">
        <article class="app-layout__content">
          <RouterView />
        </article>
      </main>
    </template>
  </VaLayout>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteUpdate } from 'vue-router'
import { useBreakpoint } from 'vuestic-ui'
import { useGlobalStore } from '@/stores'
import AppLayoutNavigation from '@/components/app-layout-navigation/AppLayoutNavigation.vue'
import AppNavbar from '@/components/navbar/AppNavbar.vue'
import AppSidebar from '@/components/sidebar/AppSidebar.vue'

const globalStore = useGlobalStore()
const { isSidebarMinimized } = storeToRefs(globalStore)

const breakpoints = useBreakpoint()

const isMobile = ref(false)
const isTablet = ref(false)

const onResize = () => {
  if (breakpoints.mdDown) {
    isSidebarMinimized.value = true
  }
  isMobile.value = breakpoints.smDown
  isTablet.value = breakpoints.mdDown
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  onResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

onBeforeRouteUpdate(() => {
  if (breakpoints.mdDown) {
    isSidebarMinimized.value = true
  }
})

const isFullScreenSidebar = computed(() => isTablet.value && !isSidebarMinimized.value)

const onCloseSidebarButtonClick = () => {
  isSidebarMinimized.value = true
}
</script>

<style lang="scss" scoped>
.va-sidebar {
  width: unset !important;
  min-width: unset !important;
}

/* Consistent padding so content never touches edges */
.app-layout__sidebar-close {
  padding-right: 1.5rem;
}

.app-layout__nav {
  padding: 1rem 1.5rem 0;
}

.app-layout__main {
  padding: 0 1.5rem 1.5rem;
  min-height: calc(100vh - 64px - 60px);
  background: var(--va-background-primary);
}

.app-layout__content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
}
</style>
