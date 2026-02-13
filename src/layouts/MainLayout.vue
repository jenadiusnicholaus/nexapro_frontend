<template>
  <div class="app-layout">
    <!-- Top Header Bar -->
    <header class="app-bar">
      <button
        type="button"
        class="app-bar-menu-btn"
        aria-label="Toggle menu"
        @click="toggleDrawer"
      >
        <VaIcon name="menu" size="small" class="app-bar-menu-icon" />
      </button>
      <div class="app-bar-search">
        <VaInput
          v-model="searchQuery"
          :placeholder="t('common.search')"
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
        <button
          type="button"
          class="app-bar-icon-btn"
          :aria-label="t('common.notifications')"
        >
          <VaIcon name="notifications" size="small" class="app-bar-nav-icon" />
          <VaBadge
            v-if="notificationCount > 0"
            :text="String(notificationCount)"
            color="danger"
            class="app-bar-badge"
          />
        </button>
        <button
          type="button"
          class="app-bar-icon-btn"
          :aria-label="t('common.signOut')"
          @click="handleLogout"
        >
          <VaIcon name="logout" size="small" class="app-bar-nav-icon" />
        </button>
        <div class="locale-switcher">
          <button
            v-for="opt in localeOptions"
            :key="opt.value"
            type="button"
            class="locale-btn"
            :class="{ 'locale-btn--active': locale === opt.value }"
            @click="setLocale(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
        <div class="app-bar-user">
          <div class="user-avatar">
            <VaIcon name="person" size="small" class="user-avatar-icon" />
          </div>
          <span class="user-name">{{ t('common.account') }}</span>
        </div>
      </div>
    </header>

    <!-- Left Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': !drawerVisible }">
      <div class="sidebar-inner">
        <nav class="sidebar-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.path"
            class="sidebar-link"
            :class="{ 'sidebar-link--active': isActive(item.path) }"
          >
            <VaIcon :name="item.meta?.icon" size="small" class="sidebar-link-icon" />
            <span v-show="drawerVisible" class="sidebar-link-text">{{ t(item.displayName) }}</span>
          </router-link>
        </nav>

        <div v-show="drawerVisible" class="sidebar-footer-card">
          <div class="footer-card-title">{{ t('sidebar.propertyManagement') }}</div>
          <div class="footer-card-subtitle">{{ t('sidebar.propertyManagementSubtitle') }}</div>
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
import { useI18n } from 'vue-i18n'
import { useAuthStore, useGlobalStore } from '@/stores'
import { setLocale as setI18nLocale, supportedLocales } from '@/i18n'
import type { Locale } from '@/i18n'
import NavigationRoutes from '@/components/sidebar/NavigationRoutes'
import AppLayoutNavigation from '@/components/app-layout-navigation/AppLayoutNavigation.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const globalStore = useGlobalStore()
const { isSidebarMinimized } = storeToRefs(globalStore)

const localeOptions = supportedLocales

const setLocale = (value: Locale) => {
  setI18nLocale(value)
}

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
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 -4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #5f6368;
}

.app-bar-menu-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #202124;
}

.app-bar-menu-icon,
.app-bar-nav-icon {
  color: inherit !important;
}

.app-bar-search {
  flex: 1;
  max-width: 400px;
  min-width: 140px;
  margin: 0 8px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.va-input-wrapper) {
  border-radius: 8px;
  background: #f1f3f4;
  border-color: transparent;
}

.search-input :deep(.va-input-wrapper:focus-within) {
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
}

.search-icon {
  color: #5f6368 !important;
}

.app-bar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.app-bar-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  color: #5f6368;
}

.app-bar-icon-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #202124;
}

.app-bar-badge {
  position: absolute;
  top: 6px;
  right: 6px;
}

.locale-switcher {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 8px;
  padding-right: 8px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.locale-btn {
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #5f6368;
  cursor: pointer;
}

.locale-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #202124;
}

.locale-btn--active {
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
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

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0 0.5rem;
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
