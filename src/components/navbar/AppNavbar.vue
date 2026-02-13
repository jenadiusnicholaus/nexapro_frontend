<template>
  <VaNavbar class="app-navbar">
    <template #left>
      <div class="app-navbar__left">
        <VaButton
          v-if="isMobile"
          preset="plain"
          :icon="isSidebarMinimized ? 'menu' : 'close'"
          size="small"
          aria-label="Toggle sidebar"
          @click="toggleSidebar"
        />
        <RouterLink to="/" class="app-navbar__logo" aria-label="Home">
          <AppLogo />
        </RouterLink>
      </div>
    </template>
    <template #right>
      <div class="app-navbar__right">
        <AppNavbarActions :is-mobile="isMobile" />
      </div>
    </template>
  </VaNavbar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/stores'
import AppLogo from '@/components/AppLogo.vue'
import AppNavbarActions from './components/AppNavbarActions.vue'

defineProps<{
  isMobile?: boolean
}>()

const globalStore = useGlobalStore()
const { isSidebarMinimized } = storeToRefs(globalStore)

const toggleSidebar = () => {
  globalStore.toggleSidebar()
}
</script>

<style scoped>
.app-navbar {
  z-index: 2;
}

.app-navbar__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
  min-height: 3rem;
}

.app-navbar__logo {
  text-decoration: none;
  color: inherit;
}

.app-navbar__right {
  display: flex;
  align-items: center;
  padding-right: 1.5rem;
  margin-right: 0.5rem;
  min-height: 3rem;
}
</style>
