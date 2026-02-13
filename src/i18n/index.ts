import { createI18n } from 'vue-i18n'
import en from './locales/en'
import sw from './locales/sw'

const LOCALE_KEY = 'nexap_locale'

export type Locale = 'en' | 'sw'

export const supportedLocales: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Kiswahili' },
]

function loadSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null
    if (saved && (saved === 'en' || saved === 'sw')) return saved
  } catch {
    /* ignore */
  }
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: loadSavedLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    sw,
  },
})

export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export default i18n
