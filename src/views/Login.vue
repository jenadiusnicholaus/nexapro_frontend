<template>
  <div class="login-container">
    <!-- Left Side - Image -->
    <div class="login-image-section">
      <div class="image-overlay">
        <div class="image-content">
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

        <VaForm
          ref="loginForm"
          @submit.prevent="handleLogin"
          class="login-form"
        >
          <div class="input-group">
            <VaInput
              v-model="username"
              label="Username"
              placeholder="Email, phone, or username"
              :rules="[validators.required]"
              preset="bordered"
              class="login-input"
            >
              <template #prependInner>
                <VaIcon name="person" size="small" />
              </template>
            </VaInput>
            <p class="input-hint">
              <VaIcon name="info" size="12px" />
              You can sign in with your email, phone number, or username
            </p>
          </div>

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

          <div class="register-link">
            <p>
              Don't have an account?
              <router-link to="/register" class="register-link-text">
                Register here
              </router-link>
            </p>
          </div>
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { validators } from "@/utils/validators";

const router = useRouter();
const authStore = useAuthStore();

// Test users from .env (pre-fill form for development)
const testUsers = {
  admin: {
    username: import.meta.env.VITE_TEST_ADMIN_USERNAME ?? "admin",
    password: import.meta.env.VITE_TEST_ADMIN_PASSWORD ?? "admin123",
    label: "Admin",
    access: "Full access to everything",
  },
  property_owner: {
    username: import.meta.env.VITE_TEST_OWNER_USERNAME ?? "property_owner",
    password: import.meta.env.VITE_TEST_OWNER_PASSWORD ?? "property_owner123",
    label: "Property Owner",
    access: "Only data for their linked Owner",
  },
};

const username = ref(testUsers.admin.username);
const password = ref(testUsers.admin.password);
const loginForm = ref(null);

const fillTestUser = (key) => {
  const u = testUsers[key];
  if (u) {
    username.value = u.username;
    password.value = u.password;
  }
};

const handleLogin = async () => {
  const isValid = await loginForm.value.validate();
  if (!isValid) return;

  const result = await authStore.login(username.value, password.value);
  if (result.success) {
    router.push("/admin");
  }
};
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* Left Side - Image Section */
.login-image-section {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #008236 0%, #006629 100%);
  display: block;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.image-overlay::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 130, 54, 0.9) 0%,
    rgba(0, 102, 41, 0.85) 100%
  );
  z-index: 1;
}

.image-content {
  text-align: center;
  color: white;
  max-width: 500px;
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-logo {
  width: 140px;
  height: 140px;
  margin: 0 auto 2.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  border: 3px solid rgba(255, 255, 255, 0.25);
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.image-logo:hover {
  transform: scale(1.05);
}

.image-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  letter-spacing: -1.5px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.image-subtitle {
  font-size: 1.375rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 400;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

/* Right Side - Login Form Section */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.login-form-wrapper {
  width: 100%;
  max-width: 460px;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.login-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.75px;
}

.login-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
  font-weight: 400;
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
  background: var(--va-primary) !important;
  border: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 130, 54, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.footer-text {
  font-size: 0.8125rem;
  color: #6c757d;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
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

.register-link {
  margin-top: 1.5rem;
  text-align: center;
}

.register-link p {
  color: #6c757d;
  font-size: 0.9375rem;
  margin: 0;
}

.register-link-text {
  color: var(--va-primary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.register-link-text:hover {
  color: #006629;
  text-decoration: underline;
}

.test-users {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-users-label {
  font-size: 0.875rem;
  color: #495057;
  margin-right: 0.5rem;
  font-weight: 500;
}

.test-user-btn {
  min-height: auto;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.input-group {
  margin-bottom: 1rem;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-size: 0.8125rem;
  color: #6c757d;
  line-height: 1.4;
}

.input-hint .va-icon {
  color: var(--va-primary);
  flex-shrink: 0;
}

.test-user-btn:hover {
  background: var(--va-primary);
  color: white;
}

/* Tablet and Desktop */
@media (min-width: 768px) {
  .login-image-section {
    display: block;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .login-container {
    flex-direction: column;
  }

  .login-image-section {
    display: none;
  }

  .login-form-section {
    padding: 1.5rem;
    background: white;
    min-height: auto;
  }

  .login-form-wrapper {
    padding: 2rem 1.5rem;
    box-shadow: none;
    max-width: 100%;
  }

  .login-title {
    font-size: 1.875rem;
  }

  .image-title {
    font-size: 2.5rem;
  }

  .image-subtitle {
    font-size: 1.125rem;
  }

  .test-users {
    flex-direction: column;
    align-items: stretch;
  }

  .test-user-btn {
    width: 100%;
  }
}
</style>
