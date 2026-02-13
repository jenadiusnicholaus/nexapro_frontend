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

    <!-- Notifications -->
    <VaButton
      v-if="!isMobile"
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
          <span class="locale-option__flag">{{ getLocaleFlag(opt.value) }}</span>
          <span class="locale-option__label">{{ opt.label }}</span>
        </div>
      </VaDropdownContent>
    </VaDropdown>

    <!-- Account dropdown: avatar + actions -->
    <VaDropdown placement="bottom-end" :offset="[0, 8]" class="app-navbar-actions__account-dropdown">
      <template #anchor>
        <button type="button" class="account-trigger" aria-haspopup="true" :aria-label="t('common.account')">
          <div class="account-trigger__avatar">
            <VaIcon name="person" size="small" class="account-trigger__icon" />
          </div>
          <span v-if="!isMobile" class="account-trigger__name">{{ t('common.account') }}</span>
          <VaIcon name="angle_down" size="small" class="account-trigger__chevron" />
        </button>
      </template>
      <VaDropdownContent>
        <div class="account-menu">
          <button type="button" class="account-menu__item" @click="goToProfile">
            <VaIcon name="person" size="small" />
            <span>{{ t('common.profile') }}</span>
          </button>
          <button type="button" class="account-menu__item" @click="goToSettings">
            <VaIcon name="gear" size="small" />
            <span>{{ t('common.settings') }}</span>
          </button>
          <div class="account-menu__divider" />
          <button type="button" class="account-menu__item account-menu__item--danger" @click="handleLogout">
            <VaIcon name="logout" size="small" />
            <span>{{ t('common.signOut') }}</span>
          </button>
        </div>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores'
import { setLocale as setI18nLocale, supportedLocales } from '@/i18n'
import type { Locale } from '@/i18n'

defineProps<{
  isMobile?: boolean
}>()

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const searchQuery = ref('')
const notificationCount = ref(0)
const localeOptions = supportedLocales

const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  sw: '🇹🇿',
}

const currentLocaleFlag = computed(() => localeFlags[locale.value] ?? '🇺🇸')
const currentLocaleLabel = computed(
  () => localeOptions.find((o) => o.value === locale.value)?.label ?? 'English',
)

function getLocaleFlag(l: Locale) {
  return localeFlags[l] ?? '🇺🇸'
}

function setLocale(value: Locale) {
  setI18nLocale(value)
}

function goToProfile() {
  router.push({ name: 'profiles' })
}

function goToSettings() {
  router.push({ name: 'profiles' })
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
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
</style>
