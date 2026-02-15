<template>
  <span class="app-logo" :class="{ 'app-logo--light': variant === 'light' }">
    <img
      src="/images/logo.png"
      alt="NexaProperty Logo"
      class="app-logo__image"
    />
    <span class="app-logo__text">NexaProperty</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant?: "light" | "default";
}>();
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--va-text-primary);
  text-decoration: none;
}

.app-logo--light .app-logo__text {
  color: #fff;
}

.app-logo__image {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.app-logo__text {
  letter-spacing: -0.02em;
}
</style>
