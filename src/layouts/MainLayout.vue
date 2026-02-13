<template>
  <div class="app-layout">
    <!-- Top Header Bar -->
    <header class="app-bar">
      <VaButton
        preset="plain"
        icon="menu"
        class="app-bar-menu-btn"
        @click="toggleDrawer"
      />
      <div class="app-bar-search">
        <VaInput
          v-model="searchQuery"
          placeholder="Search..."
          preset="bordered"
          class="search-input"
          autocomplete="off"
        >
          <template #prependInner>
            <VaIcon name="search" size="small" class="search-icon" />
          </template>
        </VaInput>
      </div>
      <div class="app-bar-right">
        <VaButton preset="plain" icon="notifications" class="app-bar-icon-btn">
          <VaBadge
            v-if="notificationCount > 0"
            :text="String(notificationCount)"
            color="danger"
          />
        </VaButton>
        <div class="app-bar-user">
          <div class="user-avatar">
            <VaIcon name="person" size="small" class="user-avatar-icon" />
          </div>
          <span class="user-name">Account</span>
        </div>
        <VaButton preset="plain" icon="logout" class="app-bar-icon-btn" @click="handleLogout" />
      </div>
    </header>

    <!-- Left Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': !drawerVisible }">
      <div class="sidebar-inner">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <VaIcon name="home" size="large" class="brand-logo-icon" />
          </div>
          <span v-show="drawerVisible" class="brand-text">NexaProperty</span>
        </div>

        <VaButton
          v-show="drawerVisible"
          to="/tenancies"
          block
          class="sidebar-cta"
          size="large"
        >
          <VaIcon name="login" class="mr-2" />
          Move-in tenant +
        </VaButton>

        <nav class="sidebar-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.path"
            class="sidebar-link"
            :class="{ 'sidebar-link--active': isActive(item.path) }"
          >
            <VaIcon :name="item.meta?.icon" size="small" class="sidebar-link-icon" />
            <span v-show="drawerVisible" class="sidebar-link-text">{{ item.displayName }}</span>
          </router-link>
        </nav>

        <div v-show="drawerVisible" class="sidebar-footer-card">
          <div class="footer-card-title">Property Management</div>
          <div class="footer-card-subtitle">Manage units, tenants & bills in one place.</div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'main-content--expanded': !drawerVisible }">
      <div class="content-wrapper">
        <AppLayoutNavigation />
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useGlobalStore } from '@/stores'
import NavigationRoutes from '@/components/sidebar/NavigationRoutes'
import AppLayoutNavigation from '@/components/app-layout-navigation/AppLayoutNavigation.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const globalStore = useGlobalStore()
const { isSidebarMinimized } = storeToRefs(globalStore)

const notificationCount = ref(0)
const searchQuery = ref('')

const drawerVisible = computed(() => !isSidebarMinimized.value)

const menuItems = computed(() => NavigationRoutes.routes)

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const toggleDrawer = () => {
  globalStore.toggleSidebar()
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-wrap: wrap;
  min-height: 100vh;
  background: #f8fafc;
}

/* App Bar - fixed at top */
.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

.app-bar-menu-btn {
  color: #5f6368 !important;
  flex-shrink: 0;
}

.app-bar-search {
  flex: 1;
  max-width: 480px;
  min-width: 120px;
}

.search-input {
  width: 100%;
}

.search-icon {
  color: #5f6368 !important;
}

.app-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-bar-icon-btn {
  color: #5f6368 !important;
}

.app-bar-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.app-bar-user:hover {
  background: rgba(0, 0, 0, 0.04);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar-icon {
  color: #ffffff !important;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
}

/* Sidebar - fixed left */
.sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  width: 260px;
  height: calc(100vh - 64px);
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 900;
  transition: width 0.2s ease;
  overflow: hidden;
}

.sidebar--collapsed {
  width: 72px;
}

.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-brand {
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo-icon {
  color: #ffffff !important;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--va-text-primary);
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-cta {
  margin: 1rem;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
  border: none !important;
  color: #ffffff !important;
  font-weight: 600;
  border-radius: 10px;
  height: 48px;
  flex-shrink: 0;
}

.mr-2 {
  margin-right: 0.5rem;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  margin: 0.25rem 0.5rem;
  border-radius: 10px;
  color: var(--va-text-primary);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.sidebar-link:hover {
  background: rgba(124, 58, 237, 0.08);
}

.sidebar-link--active {
  background: #7c3aed !important;
  color: #ffffff !important;
}

.sidebar-link--active .sidebar-link-icon {
  color: #ffffff !important;
}

.sidebar-link-icon {
  flex-shrink: 0;
  color: inherit;
}

.sidebar-link-text {
  white-space: nowrap;
  overflow: hidden;
  font-size: 0.9375rem;
  font-weight: 500;
}

.sidebar-footer-card {
  margin: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.footer-card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 0.25rem;
}

.footer-card-subtitle {
  font-size: 0.8125rem;
  color: var(--va-text-secondary);
}

/* Main Content - offset by sidebar and app bar */
.main-content {
  flex: 1;
  min-width: 0;
  margin-left: 260px;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.2s ease;
}

.main-content--expanded {
  margin-left: 72px;
}

.content-wrapper {
  padding: 1.5rem 2rem;
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }

  .sidebar--collapsed {
    width: 0;
    overflow: hidden;
  }

  .main-content {
    margin-left: 72px;
  }

  .main-content--expanded {
    margin-left: 0;
  }

  .content-wrapper {
    padding: 1rem;
  }

  .user-name {
    display: none;
  }

  .app-bar-search {
    max-width: 180px;
  }
}
</style>
