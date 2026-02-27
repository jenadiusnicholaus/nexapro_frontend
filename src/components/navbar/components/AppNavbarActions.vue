<template>
  <div class="app-navbar-actions">
    <!-- Search -->
    <VaInput
      v-if="!isMobile"
      v-model="searchQuery"
      :placeholder="t('common.search')"
      preset="bordered"
      class="app-navbar-actions__search"
      autocomplete="off"
    >
      <template #prependInner>
        <VaIcon name="search" size="small" />
      </template>
    </VaInput>

    <!-- Notifications Dropdown -->
    <VaDropdown
      v-if="!isMobile"
      placement="bottom-end"
      :offset="[0, 8]"
      class="app-navbar-actions__notification-dropdown"
    >
      <template #anchor>
        <VaButton
          preset="plain"
          :aria-label="t('common.notifications')"
          class="app-navbar-actions__btn"
        >
          <VaIcon name="notifications" size="small" />
          <VaBadge
            v-if="notificationCount > 0"
            :text="String(notificationCount)"
            color="danger"
            class="app-navbar-actions__badge"
          />
        </VaButton>
      </template>
      <VaDropdownContent class="notification-dropdown-content">
        <div class="notification-dropdown-header">
          <h3>Notifications</h3>
          <VaButton
            preset="plain"
            size="small"
            @click="goToNotifications"
            class="view-all-btn"
          >
            View All
          </VaButton>
        </div>
        <div class="notification-list">
          <div v-if="recentNotifications.length === 0" class="no-notifications">
            No notifications
          </div>
          <div
            v-for="notification in recentNotifications"
            :key="String((notification as any).id)"
            class="notification-item"
            :class="{ unread: (notification as any).status === 'sent' }"
            @click="markAsRead(notification)"
          >
            <VaIcon name="sms" size="small" color="primary" />
            <div class="notification-content">
              <p class="notification-subject">
                {{ (notification as any).subject || "No subject" }}
              </p>
              <p class="notification-time">
                {{ formatTime((notification as any).sent_at || "") }}
              </p>
            </div>
            <VaBadge
              v-if="(notification as any).status === 'sent'"
              color="primary"
              text="New"
            />
          </div>
        </div>
      </VaDropdownContent>
    </VaDropdown>

    <!-- Language dropdown with flag -->
    <VaDropdown
      v-if="!isMobile"
      placement="bottom-end"
      :offset="[0, 8]"
      class="app-navbar-actions__locale-dropdown"
    >
      <template #anchor>
        <VaButton preset="plain" size="small" class="locale-trigger">
          <span class="locale-flag">{{ currentLocaleFlag }}</span>
          <span class="locale-label">{{ currentLocaleLabel }}</span>
          <VaIcon name="angle_down" size="small" class="locale-chevron" />
        </VaButton>
      </template>
      <VaDropdownContent>
        <div
          v-for="opt in localeOptions"
          :key="opt.value"
          class="locale-option"
          :class="{ 'locale-option--active': locale === opt.value }"
          @click="setLocale(opt.value)"
        >
          <span class="locale-option__flag">{{
            getLocaleFlag(opt.value)
          }}</span>
          <span class="locale-option__label">{{ opt.label }}</span>
        </div>
      </VaDropdownContent>
    </VaDropdown>

    <!-- Account dropdown: avatar + actions -->
    <VaDropdown
      placement="bottom-end"
      :offset="[0, 8]"
      class="app-navbar-actions__account-dropdown"
    >
      <template #anchor>
        <button
          type="button"
          class="account-trigger"
          aria-haspopup="true"
          :aria-label="t('common.account')"
        >
          <div class="account-trigger__avatar">
            <img
              v-if="userImage"
              :src="userImage"
              alt="User avatar"
              class="account-trigger__avatar-img"
            />
            <span v-else-if="userInitials" class="account-trigger__initials">{{
              userInitials
            }}</span>
            <VaIcon
              v-else
              name="person"
              size="small"
              class="account-trigger__icon"
            />
          </div>
          <span v-if="!isMobile" class="account-trigger__name">{{
            userName
          }}</span>
          <VaIcon
            name="angle_down"
            size="small"
            class="account-trigger__chevron"
          />
        </button>
      </template>
      <VaDropdownContent>
        <div class="account-menu">
          <button type="button" class="account-menu__item" @click="goToProfile">
            <VaIcon name="person" size="small" />
            <span>{{ t("common.profile") }}</span>
          </button>
          <button
            type="button"
            class="account-menu__item"
            @click="goToSettings"
          >
            <VaIcon name="gear" size="small" />
            <span>{{ t("common.settings") }}</span>
          </button>
          <div class="account-menu__divider" />
          <button
            type="button"
            class="account-menu__item account-menu__item--danger"
            @click="handleLogout"
          >
            <VaIcon name="logout" size="small" />
            <span>{{ t("common.signOut") }}</span>
          </button>
        </div>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  useAuthStore,
  useProfilesStore,
  useNotificationsStore,
} from "@/stores";
import { setLocale as setI18nLocale, supportedLocales } from "@/i18n";
import type { Locale } from "@/i18n";

defineProps<{
  isMobile?: boolean;
}>();

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const profilesStore = useProfilesStore();
const notificationsStore = useNotificationsStore();

const searchQuery = ref("");
const notificationCount = ref(0);
const localeOptions = supportedLocales;

// Fetch notifications on mount
onMounted(async () => {
  await fetchNotificationCount();
});

// Fetch notification count
const fetchNotificationCount = async () => {
  try {
    await notificationsStore.fetchList({ ordering: "-sent_at" });
    const unreadNotifications = notificationsStore.items.filter(
      (notification: any) =>
        notification.status === "sent" || notification.status === "unread",
    );
    notificationCount.value = unreadNotifications.length;
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
};

// Get recent notifications (top 5)
const recentNotifications = computed(() =>
  notificationsStore.items.slice(0, 5),
);

// Navigate to notifications page
const goToNotifications = () => {
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
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  sw: "🇹🇿",
};

const currentLocaleFlag = computed(
  () => localeFlags[locale.value as Locale] ?? "🇺🇸",
);
const currentLocaleLabel = computed(
  () => localeOptions.find((o) => o.value === locale.value)?.label ?? "English",
);

const userInitials = computed(() => {
  const name = profilesStore.profile?.owner?.name || "";
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
});

const userName = computed(() => {
  return profilesStore.profile?.owner?.name || t("common.account");
});

const userImage = computed(() => {
  return profilesStore.profile?.image || null;
});

function getLocaleFlag(l: string) {
  return localeFlags[l as Locale] ?? "🇺🇸";
}

function setLocale(value: Locale) {
  setI18nLocale(value);
}

function goToProfile() {
  router.push({ name: "profiles" });
}

function goToSettings() {
  router.push({ name: "profiles" });
}

const handleLogout = () => {
  authStore.logout();
  router.push({ name: "login" });
};

onMounted(() => {
  profilesStore.fetchCurrentProfile().catch(() => {});
});
</script>

<style scoped>
.app-navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.5rem;
}

.app-navbar-actions__search {
  width: 220px;
  min-width: 160px;
  flex-shrink: 0;
}

.app-navbar-actions__btn {
  flex-shrink: 0;
  position: relative;
}

.app-navbar-actions__badge {
  position: absolute;
  top: 2px;
  right: 2px;
}

.app-navbar-actions__locale-dropdown,
.app-navbar-actions__account-dropdown {
  flex-shrink: 0;
}

/* Language dropdown */
.locale-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--va-text-primary);
  border-radius: 8px;
}

.locale-trigger:hover {
  background: rgba(0, 0, 0, 0.05);
}

.locale-flag {
  font-size: 1rem;
  line-height: 1;
}

.locale-label {
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.locale-chevron {
  opacity: 0.7;
  margin-left: 0.125rem;
}

.locale-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}

.locale-option:hover {
  background: rgba(0, 0, 0, 0.06);
}

.locale-option--active {
  background: rgba(124, 58, 237, 0.1);
  color: var(--va-primary);
  font-weight: 500;
}

.locale-option__flag {
  font-size: 1.125rem;
}

/* Account dropdown */
.account-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--va-text-primary);
  cursor: pointer;
  font: inherit;
  transition: background 0.15s;
}

.account-trigger:hover {
  background: rgba(0, 0, 0, 0.05);
}

.account-trigger__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.account-trigger__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-trigger__initials {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.account-trigger__icon {
  color: #fff !important;
}

.account-trigger__name {
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-trigger__chevron {
  opacity: 0.7;
  flex-shrink: 0;
}

.account-menu {
  min-width: 180px;
  padding: 0.25rem 0;
}

.account-menu__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--va-text-primary);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.account-menu__item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.account-menu__item--danger:hover {
  background: rgba(234, 34, 34, 0.1);
  color: var(--va-danger);
}

.account-menu__divider {
  height: 1px;
  margin: 0.25rem 0;
  background: rgba(0, 0, 0, 0.08);
}

/* Notification Dropdown */
.notification-dropdown-content {
  width: 480px;
  max-width: 90vw;
  max-height: 500px;
  padding: 0;
}

.notification-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.notification-dropdown-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.view-all-btn {
  color: #4299e1;
  font-weight: 500;
}

.view-all-btn:hover {
  background: rgba(66, 153, 225, 0.1);
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
  align-items: flex-start;
}

.notification-item:hover {
  background: #f7fafc;
}

.notification-item.unread {
  background: rgba(66, 153, 225, 0.05);
}

.notification-content {
  flex: 1;
}

.notification-subject {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a202c;
}

.notification-time {
  margin: 0;
  font-size: 0.75rem;
  color: #718096;
}
</style>
