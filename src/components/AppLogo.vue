<template>
  <span class="app-logo" :class="{ 'app-logo--light': variant === 'light' }">
    <VaIcon name="home" size="small" class="app-logo__icon" />
    <span class="app-logo__text">NexaProperty</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'light'
  }>(),
  { variant: 'default' },
)
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--va-text-primary);
  text-decoration: none;
}

.app-logo--light .app-logo__icon,
.app-logo--light .app-logo__text {
  color: #fff;
}

.app-logo__icon {
  color: var(--va-primary);
}

.app-logo__text {
  letter-spacing: -0.02em;
}
</style>
