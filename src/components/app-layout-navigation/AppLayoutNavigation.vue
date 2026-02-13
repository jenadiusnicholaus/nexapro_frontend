<template>
  <nav v-if="breadcrumbs.length" class="app-breadcrumbs">
    <router-link :to="{ name: 'dashboard' }" class="app-breadcrumbs__home">Home</router-link>
    <span v-for="(item, i) in breadcrumbs" :key="i" class="app-breadcrumbs__item">
      <span class="app-breadcrumbs__sep">/</span>
      <router-link v-if="item.to" :to="item.to" class="app-breadcrumbs__link">{{ item.label }}</router-link>
      <span v-else class="app-breadcrumbs__current">{{ item.label }}</span>
    </span>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavigationRoutes from '@/components/sidebar/NavigationRoutes'

const route = useRoute()

interface BreadcrumbItem {
  label: string
  to: { name: string } | null
}

const breadcrumbs = computed(() => {
  const list: BreadcrumbItem[] = []
  const name = route.name
  if (!name || name === 'dashboard') return list
  const nav = NavigationRoutes.routes.find((r) => r.name === name)
  if (nav) {
    list.push({ label: nav.displayName, to: null })
  }
  return list
})
</script>

<style scoped>
.app-breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  color: var(--va-text-secondary);
}

.app-breadcrumbs__home {
  color: var(--va-primary);
  text-decoration: none;
  font-weight: 500;
}

.app-breadcrumbs__home:hover {
  text-decoration: underline;
}

.app-breadcrumbs__sep {
  margin: 0 0.25rem;
  opacity: 0.7;
}

.app-breadcrumbs__link {
  color: var(--va-primary);
  text-decoration: none;
}

.app-breadcrumbs__link:hover {
  text-decoration: underline;
}

.app-breadcrumbs__current {
  color: var(--va-text-primary);
  font-weight: 500;
}
</style>
