<template>
  <div class="login-container">
    <!-- Left Side - Image -->
    <div class="login-image-section">
      <div class="image-overlay">
        <div class="image-content">
          <div class="image-logo">
            <VaIcon name="home" size="large" class="image-logo-icon" />
          </div>
          <h2 class="image-title">NexaProperty</h2>
          <p class="image-subtitle">Manage your properties with ease</p>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="login-form-section">
      <div class="login-form-wrapper">
        <div class="login-header">
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">Sign in to your account</p>
        </div>

        <VaForm ref="loginForm" @submit.prevent="handleLogin" class="login-form">
          <VaInput
            v-model="username"
            label="Username"
            placeholder="Enter your username"
            :rules="[validators.required]"
            preset="bordered"
            class="login-input"
          >
            <template #prependInner>
              <VaIcon name="person" size="small" />
            </template>
          </VaInput>

          <VaInput
            v-model="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :rules="[validators.required]"
            preset="bordered"
            class="login-input"
          >
            <template #prependInner>
              <VaIcon name="lock" size="small" />
            </template>
          </VaInput>

          <div class="test-users mb-3">
            <span class="test-users-label">Test users:</span>
            <VaButton
              preset="plain"
              size="small"
              class="test-user-btn"
              @click="fillTestUser('admin')"
            >
              Admin
            </VaButton>
            <VaButton
              preset="plain"
              size="small"
              class="test-user-btn"
              @click="fillTestUser('property_owner')"
            >
              Property Owner
            </VaButton>
          </div>

          <VaButton
            type="submit"
            :loading="authStore.loading"
            block
            size="large"
            class="login-button"
          >
            Sign In
          </VaButton>

          <VaAlert
            v-if="authStore.error"
            color="danger"
            class="mt-4"
            closeable
            @close="authStore.error = null"
            border="left"
          >
            <template #title>Authentication Failed</template>
            {{ authStore.error }}
          </VaAlert>
        </VaForm>

        <div class="login-footer">
          <p class="footer-text">
            <VaIcon name="info" size="small" class="mr-1" />
            Secure login with JWT authentication
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validators } from '@/utils/validators'

const router = useRouter()
const authStore = useAuthStore()

// Test users from .env (pre-fill form for development)
const testUsers = {
  admin: {
    username: import.meta.env.VITE_TEST_ADMIN_USERNAME ?? 'admin',
    password: import.meta.env.VITE_TEST_ADMIN_PASSWORD ?? 'admin123',
    label: 'Admin',
    access: 'Full access to everything',
  },
  property_owner: {
    username: import.meta.env.VITE_TEST_OWNER_USERNAME ?? 'property_owner',
    password: import.meta.env.VITE_TEST_OWNER_PASSWORD ?? 'property_owner123',
    label: 'Property Owner',
    access: 'Only data for their linked Owner',
  },
}

const username = ref(testUsers.admin.username)
const password = ref(testUsers.admin.password)
const loginForm = ref(null)

const fillTestUser = (key) => {
  const u = testUsers[key]
  if (u) {
    username.value = u.username
    password.value = u.password
  }
}

const handleLogin = async () => {
  const isValid = await loginForm.value.validate()
  if (!isValid) return

  const result = await authStore.login(username.value, password.value)
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  overflow: hidden;
}

/* Left Side - Image Section */
.login-image-section {
  flex: 1;
  position: relative;
  background-color: #1a1a2e;
  background-image: url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: none; /* Hidden on mobile */
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.85) 0%,
    rgba(118, 75, 162, 0.75) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.image-content {
  text-align: center;
  color: white;
  max-width: 500px;
}

.image-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.image-logo-icon {
  color: #ffffff;
}

.image-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  letter-spacing: -1px;
}

.image-subtitle {
  font-size: 1.25rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 300;
}

/* Right Side - Login Form Section */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--va-background-primary);
  min-height: 100vh;
}

.login-form-wrapper {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 0.9375rem;
  color: var(--va-text-secondary);
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-input {
  width: 100%;
  margin-bottom: 1.25rem;
}

.login-input:last-of-type {
  margin-bottom: 1.5rem;
}

.login-button {
  width: 100%;
  margin-top: 0.5rem;
}

.login-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--va-background-border);
  text-align: center;
}

.footer-text {
  font-size: 0.75rem;
  color: var(--va-text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mt-4 {
  margin-top: 1.5rem;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.test-users {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.test-users-label {
  font-size: 0.8125rem;
  color: var(--va-text-secondary);
  margin-right: 0.25rem;
}

.test-user-btn {
  min-height: auto;
  padding: 0.25rem 0.5rem;
}

/* Tablet and Desktop */
@media (min-width: 768px) {
  .login-image-section {
    display: block;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .login-form-section {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.75rem;
  }
}
</style>
