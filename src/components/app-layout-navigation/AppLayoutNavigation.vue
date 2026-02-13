<template>
  <div class="flex gap-2">
    <VaIconMenuCollapsed
      class="cursor-pointer"
      :class="{ 'x-flip': !isSidebarMinimized }"
      :color="collapseIconColor"
      @click="toggleSidebar"
    />

    <nav class="flex items-center">
      <VaBreadcrumbs>
        <VaBreadcrumbsItem :label="t('nav.home')" :to="{ name: 'dashboard' }" />
        <VaBreadcrumbsItem
          v-for="item in items"
          :key="item.label"
          :label="item.label"
          @click="handleBreadcrumbClick(item)"
        />
      </VaBreadcrumbs>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import VaIconMenuCollapsed from '@/components/icons/VaIconMenuCollapsed.vue'
import { useGlobalStore } from '@/stores'
import NavigationRoutes from '@/components/sidebar/NavigationRoutes'

const { isSidebarMinimized } = storeToRefs(useGlobalStore())

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

const toggleSidebar = () => {
  useGlobalStore().toggleSidebar()
}

type BreadcrumbNavigationItem = {
  label: string
  to: string
  hasChildren: boolean
}

const findRouteName = (name: string): string => {
  const traverse = (routes: typeof NavigationRoutes.routes): string => {
    for (const r of routes) {
      if (r.name === name) return r.displayName
      if (r.children) {
        const result = traverse(r.children)
        if (result) return result
      }
    }
    return ''
  }
  return traverse(NavigationRoutes.routes)
}

const items = computed(() => {
  void locale.value
  const result: BreadcrumbNavigationItem[] = []
  route.matched.forEach((matched) => {
    const name = matched.name as string
    if (name === 'dashboard' || name === 'admin') return
    const labelKey = findRouteName(name)
    if (!labelKey) return
    result.push({
      label: t(labelKey),
      to: matched.path,
      hasChildren: !!(matched.children && matched.children.length > 0),
    })
  })
  return result
})

const { getColor } = useColors()
const collapseIconColor = computed(() => getColor('secondary'))

const handleBreadcrumbClick = (item: BreadcrumbNavigationItem) => {
  if (!item.hasChildren) {
    router.push(item.to)
  }
}
</script>

<style lang="scss" scoped>
.x-flip {
  transform: scaleX(-1);
}
</style>
