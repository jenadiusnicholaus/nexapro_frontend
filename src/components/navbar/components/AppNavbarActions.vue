<template>
  <div class="app-navbar-actions-premium">
    <!-- Search Premium -->
    <VaInput
      v-if="!isMobile"
      v-model="searchQuery"
      :placeholder="t('common.search')"
      class="premium-navbar-search"
      background="rgba(255,255,255,0.03)"
    >
      <template #prependInner>
        <VaIcon name="search" color="#22c55e" size="small" />
      </template>
    </VaInput>

    <!-- Notifications Dropdown Premium -->
    <VaDropdown
      v-if="!isMobile"
      placement="bottom-end"
      :offset="[0, 12]"
      class="premium-dropdown-wrap"
    >
      <template #anchor>
        <VaButton
          preset="plain"
          :aria-label="t('common.notifications')"
          class="premium-nav-btn"
        >
          <VaIcon name="notifications" color="#94a3b8" />
          <div v-if="notificationCount > 0" class="premium-badge-dot"></div>
        </VaButton>
      </template>
      <VaDropdownContent class="premium-dropdown-card">
        <div class="notif-header">
          <span class="notif-title">Notifications</span>
          <VaButton preset="plain" size="small" color="#22c55e" @click="goToNotifications">View All</VaButton>
        </div>
        <div class="notif-list-premium">
          <div v-if="recentNotifications.length === 0" class="empty-notif">
            No new updates
          </div>
          <div
            v-for="notification in recentNotifications"
            :key="String((notification as any).id)"
            class="notif-item-premium"
            :class="{ unread: (notification as any).status === 'sent' }"
            @click="markAsRead(notification)"
          >
            <div class="notif-icon emerald">
              <VaIcon name="info" size="small" />
            </div>
            <div class="notif-content">
              <p class="notif-subj">{{ (notification as any).subject || "No subject" }}</p>
              <p class="notif-time">{{ formatTime((notification as any).sent_at || "") }}</p>
            </div>
          </div>
        </div>
      </VaDropdownContent>
    </VaDropdown>

    <!-- Language Premium -->
    <VaDropdown
      v-if="!isMobile"
      placement="bottom-end"
      :offset="[0, 12]"
    >
      <template #anchor>
        <button class="locale-trigger-premium">
          <span class="flag">{{ currentLocaleFlag }}</span>
          <VaIcon name="expand_more" size="small" color="#64748b" />
        </button>
      </template>
      <VaDropdownContent class="premium-dropdown-card min-w-[120px]">
        <div
          v-for="opt in localeOptions"
          :key="opt.value"
          class="locale-opt-premium"
          :class="{ active: locale === opt.value }"
          @click="setLocale(opt.value)"
        >
          <span class="opt-flag">{{ getLocaleFlag(opt.value) }}</span>
          <span class="opt-label">{{ opt.label }}</span>
        </div>
      </VaDropdownContent>
    </VaDropdown>

    <!-- Theme Toggle Premium -->
    <VaButton
      v-if="!isMobile"
      preset="plain"
      class="premium-nav-btn theme-toggle-btn"
      @click="toggleTheme"
    >
      <VaIcon :name="isDark ? 'light_mode' : 'dark_mode'" color="#22c55e" />
    </VaButton>

    <!-- Subscription Badge -->
    <div v-if="!isMobile && currentPlanName" class="subscription-nav-badge-wrap">
      <div
        class="premium-plan-badge"
        @click="goToSubscription"
        title="View Subscription Plans"
      >
        <VaIcon name="workspace_premium" size="14px" class="mr-1" />
        {{ currentPlanName }}
      </div>
    </div>

    <!-- Account Premium -->
    <VaDropdown
      placement="bottom-end"
      :offset="[0, 12]"
    >
      <template #anchor>
        <button class="account-trigger-premium">
          <div class="avatar-ring-premium">
            <img v-if="userImage" :src="userImage" class="avatar-img" />
            <div v-else class="avatar-initials-gradient">{{ userInitials }}</div>
          </div>
          <div v-if="!isMobile" class="user-meta">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">Owner</span>
          </div>
          <VaIcon name="unfold_more" size="small" color="#64748b" />
        </button>
      </template>
      <VaDropdownContent class="premium-dropdown-card account-menu-premium">
        <div class="menu-item-premium" @click="goToProfile">
          <VaIcon name="person_outline" color="#94a3b8" />
          <span>Profile</span>
        </div>
        <div class="menu-item-premium" @click="goToSettings">
          <VaIcon name="settings" color="#94a3b8" />
          <span>Settings</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item-premium danger" @click="handleLogout">
          <VaIcon name="logout" color="#ef4444" />
          <span>Sign Out</span>
        </div>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useColors } from "vuestic-ui";
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

const { t, locale } = useI18n({ useScope: 'global' });

const router = useRouter();
const authStore = useAuthStore();
const profilesStore = useProfilesStore();
const notificationsStore = useNotificationsStore();

const searchQuery = ref("");
const notificationCount = ref(0);
const localeOptions = supportedLocales;

const { applyPreset, currentPresetName } = useColors();

const currentTheme = computed(() => currentPresetName.value);
const isDark = computed(() => currentTheme.value === "dark");

const toggleTheme = () => {
  const newTheme = isDark.value ? "light" : "dark";
  applyPreset(newTheme);
  localStorage.setItem("app-theme", newTheme);
};

onMounted(() => {
  const savedTheme = localStorage.getItem("app-theme") || "dark";
  if (savedTheme !== currentTheme.value) {
    applyPreset(savedTheme);
  }
});

onMounted(async () => {
  await fetchNotificationCount();
});

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

const recentNotifications = computed(() =>
  notificationsStore.items.slice(0, 5),
);

const goToNotifications = () => {
  router.push({ name: "notifications" });
};

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

const userInitials = computed(() => {
  const name = profilesStore.profile?.owner?.name || "";
  if (!name) return "US";
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

const userName = computed(() => {
  return profilesStore.profile?.owner?.name || "User";
});

const userImage = computed(() => {
  return profilesStore.profile?.image || null;
});

const currentPlanName = computed(() => {
  return profilesStore.profile?.subscription?.plan?.name || null;
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

function goToSubscription() {
  router.push({ name: "subscription-plans" });
}

const handleLogout = () => {
  authStore.logout();
  router.push({ name: "login" });
};

onMounted(async () => {
  try {
    const profile = await profilesStore.fetchCurrentProfile();
    console.log('[NavBadge] Profile data:', JSON.stringify(profile));
    console.log('[NavBadge] Subscription:', profile?.subscription);
    console.log('[NavBadge] Plan name:', profile?.subscription?.plan?.name);
  } catch (e) {
    console.error('[NavBadge] Error fetching profile:', e);
  }
});
</script>

<style scoped>
.app-navbar-actions-premium {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Search */
.premium-navbar-search {
  width: 240px;
}

.premium-navbar-search :deep(.va-input-wrapper) {
  border-radius: 100px !important;
  border: 1px solid var(--va-background-border) !important;
  background: var(--va-background-element) !important;
}

/* Buttons & Badges */
.premium-nav-btn {
  width: 40px;
  height: 40px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 12px !important;
  background: var(--va-background-element) !important;
  position: relative;
}

.premium-badge-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

/* Subscription Badge */
.subscription-nav-badge-wrap {
  display: flex;
  align-items: center;
}

.premium-plan-badge {
  cursor: pointer;
  display: flex !important;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem !important;
  border-radius: 50px !important;
  font-weight: 700 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  transition: all 0.2s;
  background: rgba(34, 197, 94, 0.1) !important;
  color: #22c55e !important;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.premium-plan-badge:hover {
  background: rgba(34, 197, 94, 0.2) !important;
  transform: scale(1.05);
}

/* Dropdown Card */
.premium-dropdown-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-border) !important;
  box-shadow: var(--va-shadow) !important;
  border-radius: 16px !important;
  padding: 0.5rem !important;
}

/* Notifications */
.notif-header {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.5rem;
}

.notif-title {
  font-weight: 700;
  color: var(--va-text-primary);
}

.notif-list-premium {
  width: 320px;
}

.notif-item-premium {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.notif-item-premium:hover {
  background: rgba(255, 255, 255, 0.03);
}

.notif-item-premium.unread {
  background: rgba(34, 197, 94, 0.03);
}

.notif-icon.emerald {
  width: 36px;
  height: 36px;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-subj {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.notif-time {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.empty-notif {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* Locale */
.locale-trigger-premium {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--va-background-element);
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  color: var(--va-text-primary);
  cursor: pointer;
}

.locale-opt-premium {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #94a3b8;
}

.locale-opt-premium:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #f1f5f9;
}

.locale-opt-premium.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

/* Account */
.account-trigger-premium {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.8rem;
  background: var(--va-background-element);
  border: 1px solid var(--va-background-border);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.account-trigger-premium:hover {
  background: rgba(255, 255, 255, 0.06);
}

.avatar-ring-premium {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 1.5px;
  background: linear-gradient(135deg, #22c55e, #10b981);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-initials-gradient {
  width: 100%;
  height: 100%;
  background: var(--va-background-primary);
  color: var(--va-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 50%;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--va-text-primary);
}

.user-role {
  font-size: 0.7rem;
  color: #22c55e;
  font-weight: 600;
}

.account-menu-premium {
  width: 200px;
}

.menu-item-premium {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.menu-item-premium:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #f1f5f9;
}

.menu-item-premium.danger:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 0.4rem 0.5rem;
}
</style>
