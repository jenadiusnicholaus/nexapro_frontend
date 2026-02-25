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
        <!-- Subscription Plan Badge -->
        <div class="subscription-badge">
          <VaChip color="primary" size="large">
            <VaIcon name="workspace_premium" size="small" class="mr-1" />
            {{ currentPlan }}
          </VaChip>
        </div>

        <div class="notification-wrapper">
          <button
            type="button"
            class="app-bar-icon-btn"
            :aria-label="t('common.notifications')"
            @click="toggleNotificationPanel"
          >
            <VaIcon
              name="notifications"
              size="small"
              class="app-bar-nav-icon"
            />
            <VaBadge
              v-if="notificationCount > 0"
              :text="String(notificationCount)"
              color="danger"
              class="app-bar-badge"
            />
          </button>

          <!-- Notification Dropdown Panel -->
          <div
            v-show="showNotificationPanel"
            class="notification-panel"
            style="background: red; color: white"
          >
            <div class="notification-panel-header">
              <h3>
                Notifications (Panel is
                {{ showNotificationPanel ? "OPEN" : "CLOSED" }})
              </h3>
              <button @click="goToNotifications" class="view-all-btn">
                View All
              </button>
            </div>

            <div class="notification-list">
              <div
                v-if="notificationsStore.items.length === 0"
                class="no-notifications"
              >
                No notifications
              </div>

              <div
                v-for="notification in recentNotifications"
                :key="String(notification.id)"
                class="notification-item"
                :class="{ unread: notification.status === 'sent' }"
                @click="markAsRead(notification)"
              >
                <div class="notification-icon">
                  <VaIcon name="sms" size="small" />
                </div>
                <div class="notification-content">
                  <p class="notification-subject">
                    {{ String(notification.subject || "No subject") }}
                  </p>
                  <p class="notification-tenant">
                    {{ String(notification.tenant_name || "N/A") }}
                  </p>
                  <p class="notification-time">
                    {{ formatTime(String(notification.sent_at || "")) }}
                  </p>
                </div>
                <VaBadge
                  v-if="notification.status === 'sent'"
                  color="primary"
                  text="New"
                />
              </div>
            </div>
          </div>
        </div>
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
          <span class="user-name">{{ t("common.account") }}</span>
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
            <VaIcon
              :name="item.meta?.icon"
              size="small"
              class="sidebar-link-icon"
            />
            <span v-show="drawerVisible" class="sidebar-link-text">{{
              t(item.displayName)
            }}</span>
          </router-link>
        </nav>

        <div v-show="drawerVisible" class="sidebar-footer-card">
          <div class="footer-card-title">
            {{ t("sidebar.propertyManagement") }}
          </div>
          <div class="footer-card-subtitle">
            {{ t("sidebar.propertyManagementSubtitle") }}
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      class="main-content"
      :class="{ 'main-content--expanded': !drawerVisible }"
    >
      <div class="content-wrapper">
        <AppLayoutNavigation />
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore, useGlobalStore, useNotificationsStore } from "@/stores";
import { setLocale as setI18nLocale, supportedLocales } from "@/i18n";
import type { Locale } from "@/i18n";
import NavigationRoutes from "@/components/sidebar/NavigationRoutes";
import AppLayoutNavigation from "@/components/app-layout-navigation/AppLayoutNavigation.vue";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const notificationsStore = useNotificationsStore();
const { isSidebarMinimized } = storeToRefs(globalStore);

const localeOptions = supportedLocales;

const setLocale = (value: Locale) => {
  setI18nLocale(value);
};

const notificationCount = ref(0);
const searchQuery = ref("");
const showNotificationPanel = ref(false);
const currentPlan = ref("Professional"); // Default plan, can be fetched from user profile

// Close panel when clicking outside
const closePanel = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".notification-wrapper")) {
    showNotificationPanel.value = false;
  }
};

onMounted(() => {
  fetchNotificationCount();
  // Refresh notification count every 30 seconds
  setInterval(fetchNotificationCount, 30000);
  // Add click outside listener
  document.addEventListener("click", closePanel);
});

onUnmounted(() => {
  document.removeEventListener("click", closePanel);
});

// Fetch unread notification count
const fetchNotificationCount = async () => {
  try {
    // Fetch all notifications first to see the data structure
    await notificationsStore.fetchList({ ordering: "-sent_at" });
    console.log("All notifications:", notificationsStore.items);

    // Count unread/sent notifications (status='sent' means unread in this system)
    const unreadNotifications = notificationsStore.items.filter(
      (notification: any) =>
        notification.status === "sent" || notification.status === "unread",
    );

    notificationCount.value = unreadNotifications.length;
    console.log("Unread notification count:", notificationCount.value);
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
};

// Get recent notifications (top 5)
const recentNotifications = computed(() =>
  notificationsStore.items.slice(0, 5),
);

// Toggle notification panel
const toggleNotificationPanel = () => {
  showNotificationPanel.value = !showNotificationPanel.value;
  console.log("Notification panel toggled:", showNotificationPanel.value);
  console.log("Recent notifications:", recentNotifications.value);
};

// Navigate to notifications page
const goToNotifications = () => {
  showNotificationPanel.value = false;
  router.push({ name: "notifications" });
};

// Mark notification as read
const markAsRead = async (notification: any) => {
  if (notification.status === "sent") {
    try {
      await notificationsStore.updateItem(notification.id, { status: "read" });
      await fetchNotificationCount();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }
};

// Format time
const formatTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const drawerVisible = computed(() => !isSidebarMinimized.value);

const menuItems = computed(() => NavigationRoutes.routes);

const isActive = (path: string) => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

const toggleDrawer = () => {
  globalStore.toggleSidebar();
};

const handleLogout = () => {
  authStore.logout();
  router.push({ name: "login" });
};
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

.subscription-badge {
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.subscription-badge .mr-1 {
  margin-right: 0.25rem;
}

.notification-wrapper {
  position: relative;
}

.notification-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999 !important;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.notification-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.notification-panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.view-all-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #7c3aed;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.view-all-btn:hover {
  background: rgba(124, 58, 237, 0.1);
}

.notification-list {
  max-height: 420px;
  overflow-y: auto;
}

.no-notifications {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f7fafc;
}

.notification-item.unread {
  background: #f0f4ff;
}

.notification-item.unread:hover {
  background: #e6edff;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #7c3aed;
  border-radius: 50%;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-subject {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-tenant {
  margin: 0 0 0.25rem 0;
  font-size: 0.8125rem;
  color: #4a5568;
}

.notification-time {
  margin: 0;
  font-size: 0.75rem;
  color: #718096;
}

.locale-switcher {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 8px;
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
  transition:
    background 0.2s,
    color 0.2s;
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
