<template>
  <VaDropdown placement="bottom-end" :offset="[0, 12]">
    <template #anchor>
      <button class="locale-trigger">
        <span class="flag">{{ currentLocaleFlag }}</span>
        <span class="locale-name ml-1">{{ locale.toUpperCase() }}</span>
        <VaIcon name="expand_more" size="small" color="#64748b" class="ml-1" />
      </button>
    </template>
    <VaDropdownContent class="locale-dropdown-card">
      <div v-for="opt in localeOptions" :key="opt.value" 
           class="locale-opt" 
           :class="{ active: locale === opt.value }" 
           @click="setLocale(opt.value)">
        <span class="opt-flag">{{ opt.flag }}</span>
        <span class="opt-label">{{ opt.label }}</span>
      </div>
    </VaDropdownContent>
  </VaDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale as setGlobalLocale } from '@/i18n'
import type { Locale } from '@/i18n'

const { locale } = useI18n({ useScope: 'global' })

const localeOptions = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'sw', label: 'Kiswahili', flag: '🇹🇿' }
]

const setLocale = (l: string) => {
  setGlobalLocale(l as Locale)
}

const currentLocaleFlag = computed(() => {
  return localeOptions.find(opt => opt.value === locale.value)?.flag || '🇬🇧'
})
</script>

<style scoped>
.locale-trigger {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  color: var(--va-text-primary);
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}
.locale-trigger:hover {
  background: var(--va-background-secondary);
}
.locale-opt {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease;
  font-family: 'Inter', sans-serif;
  color: var(--va-text-primary);
}
.locale-opt:hover {
  background: var(--va-background-secondary);
}
.locale-opt.active {
  background: var(--va-primary);
  color: white;
}
.opt-flag { margin-right: 8px; font-size: 1.1rem; }
.opt-label { font-size: 0.95rem; }
.locale-dropdown-card {
  padding: 0.5rem;
  min-width: 140px;
  background: var(--va-background-primary);
  border: 1px solid var(--va-background-border);
}
.locale-name {
  font-size: 0.85rem;
}
</style>
