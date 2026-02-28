<template>
  <div class="login-container">
    <!-- Left Side - Visual -->
    <div class="login-visual">
      <div class="visual-bg"></div>
      <div class="visual-accent visual-accent-1"></div>
      <div class="visual-accent visual-accent-2"></div>
      <div class="visual-content">
        <div class="visual-badge">
          <span class="badge-dot"></span>
          {{ t('auth.trustedBy') }}
        </div>
        <h2 class="visual-title">NexaPro</h2>
        <p class="visual-subtitle">{{ t('auth.smartestWay') }}</p>
        <div class="visual-stats">
          <div class="visual-stat">
            <span class="visual-stat-num">99.8%</span>
            <span class="visual-stat-label">{{ t('auth.uptime') }}</span>
          </div>
          <div class="visual-stat-divider"></div>
          <div class="visual-stat">
            <span class="visual-stat-num">1,200+</span>
            <span class="visual-stat-label">{{ t('menu.tenants') }}</span>
          </div>
          <div class="visual-stat-divider"></div>
          <div class="visual-stat">
            <span class="visual-stat-num">24/7</span>
            <span class="visual-stat-label">{{ t('auth.support') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="login-form-section">
      <div class="login-form-wrapper">
        <div class="login-header">
          <div class="login-logo">
            <img src="/images/transparent_longo.png" alt="NexaPro" class="login-logo-img" />
          </div>
          <h1 class="login-title">{{ t('auth.welcomeBack') }}</h1>
          <p class="login-subtitle">{{ t('auth.signInContinuing') }}</p>
        </div>

        <VaForm ref="loginForm" @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <VaInput
              v-model="username"
              :label="t('auth.username')"
              :placeholder="t('auth.usernamePlaceholder')"
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
              {{ t('auth.usernameHint') }}
            </p>
          </div>

          <VaInput
            v-model="password"
            type="password"
            :label="t('auth.password')"
            :placeholder="t('auth.passwordPlaceholder')"
            :rules="[validators.required]"
            preset="bordered"
            class="login-input"
          >
            <template #prependInner>
              <VaIcon name="lock" size="small" />
            </template>
          </VaInput>

          <div class="test-users mb-3">
            <span class="test-users-label">{{ t('auth.quickFill') }}</span>
            <VaButton preset="plain" size="small" class="test-user-btn" @click="fillTestUser('admin')">Admin</VaButton>
            <VaButton preset="plain" size="small" class="test-user-btn" @click="fillTestUser('property_owner')">Property Owner</VaButton>
          </div>

          <VaButton type="submit" :loading="authStore.loading" block size="large" class="login-button">
            {{ t('auth.signIn') }}
            <VaIcon name="arrow_forward" size="small" />
          </VaButton>

          <VaAlert v-if="authStore.error" color="danger" class="mt-4" closeable @close="authStore.error = null" border="left">
            <template #title>{{ t('auth.authFailed') }}</template>
            {{ authStore.error }}
          </VaAlert>

          <div class="register-link">
            <p>{{ t('auth.noAccount') }} <router-link to="/register" class="register-link-text">{{ t('auth.registerHere') }}</router-link></p>
          </div>
        </VaForm>

        <div class="login-footer">
          <p class="footer-text">
            <VaIcon name="shield" size="small" class="mr-1" />
            {{ t('auth.secureLogin') }}
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
import { useI18n } from "vue-i18n";

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n({ useScope: 'global' });

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
  position: fixed; inset: 0;
  display: flex;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #050816;
}

/* ═══ Left Visual Panel ═══ */
.login-visual {
  flex: 1.1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}
.visual-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #050816 0%, #0a1628 40%, #0f1d35 100%);
}
.visual-accent {
  position: absolute; border-radius: 50%; filter: blur(120px); opacity: .18; pointer-events: none;
}
.visual-accent-1 { width: 500px; height: 500px; background: #22c55e; top: -150px; right: -100px; animation: float 8s ease-in-out infinite; }
.visual-accent-2 { width: 350px; height: 350px; background: #34d399; bottom: -80px; left: -60px; animation: float 10s ease-in-out infinite reverse; }
.visual-content {
  position: relative; z-index: 2; text-align: center; max-width: 480px;
  animation: fadeInUp .8s ease-out;
}
.visual-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.25);
  border-radius: 50px; padding: .4rem 1rem; font-size: .8rem; font-weight: 500;
  color: #86efac; margin-bottom: 2rem;
}
.badge-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
.visual-title {
  font-size: 3.5rem; font-weight: 800; margin: 0 0 1rem;
  background: linear-gradient(135deg, #22c55e, #10b981, #34d399);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.visual-subtitle {
  font-size: 1.1rem; color: #94a3b8; line-height: 1.7; margin: 0 0 2.5rem; font-weight: 400;
}
.visual-stats {
  display: flex; align-items: center; justify-content: center; gap: 1.5rem;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px; padding: 1.25rem 2rem; backdrop-filter: blur(10px);
}
.visual-stat { text-align: center; }
.visual-stat-num { display: block; font-size: 1.5rem; font-weight: 700; color: #fff; }
.visual-stat-label { font-size: .75rem; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-top: .15rem; display: block; }
.visual-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,.1); }

/* ═══ Right Form Panel ═══ */
.login-form-section {
  flex: 0.9;
  display: flex; align-items: center; justify-content: center;
  padding: 2rem;
  background: var(--va-background-primary);
  border-left: 1px solid rgba(255,255,255,.06);
}
.login-form-wrapper {
  width: 100%; max-width: 440px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  padding: 2.5rem;
  border-radius: 20px;
  backdrop-filter: blur(20px);
}
.login-header { text-align: center; margin-bottom: 2rem; }
.login-logo { margin-bottom: 1.25rem; }
.login-logo-img { height: 50px; width: auto; }
.login-title {
  font-size: 1.75rem; font-weight: 700; color: #f1f5f9;
  margin: 0 0 .4rem; letter-spacing: -.5px;
}
.login-subtitle { font-size: .95rem; color: #64748b; margin: 0; }

.login-form { width: 100%; }
.login-input { width: 100%; margin-bottom: 1rem; }

.login-button {
  width: 100%; margin-top: .5rem;
  background: #22c55e !important; border: none !important;
  font-weight: 600 !important; letter-spacing: .3px;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(34, 197, 94, .35) !important;
  transition: all .3s cubic-bezier(.4,0,.2,1) !important;
  display: flex !important; align-items: center !important; justify-content: center !important; gap: .5rem !important;
}
.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(34, 197, 94, .5) !important;
  background: #16a34a !important;
}

.test-users {
  display: flex; align-items: center; flex-wrap: wrap; gap: .5rem;
  padding: .65rem .85rem;
  background: rgba(34,197,94,.06);
  border-radius: 10px;
  border: 1px solid rgba(34,197,94,.12);
}
.test-users-label { font-size: .8rem; color: #94a3b8; margin-right: .25rem; font-weight: 500; }
.test-user-btn {
  min-height: auto !important; padding: .3rem .65rem !important; font-size: .8rem !important;
  font-weight: 500 !important; border-radius: 6px !important;
  color: #86efac !important;
}
.test-user-btn:hover { background: rgba(34, 197, 94, .15) !important; color: #fff !important; }

.input-group { margin-bottom: .75rem; }
.input-hint {
  display: flex; align-items: center; gap: .35rem;
  margin-top: .4rem; margin-bottom: 0;
  font-size: .78rem; color: #64748b; line-height: 1.4;
}

.login-footer { margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,.06); text-align: center; }
.footer-text { font-size: .78rem; color: #475569; margin: 0; display: flex; align-items: center; justify-content: center; gap: .25rem; }

.register-link { margin-top: 1.25rem; text-align: center; }
.register-link p { color: #64748b; font-size: .9rem; margin: 0; }
.register-link-text { color: #22c55e; font-weight: 600; text-decoration: none; transition: color .2s; }
.register-link-text:hover { color: #a5b4fc; text-decoration: underline; }

.mt-4 { margin-top: 1.25rem; }
.mr-1 { margin-right: .25rem; }
.mb-3 { margin-bottom: .85rem; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

@media (max-width: 900px) {
  .login-container { flex-direction: column; }
  .login-visual { display: none; }
  .login-form-section { flex: 1; border-left: none; padding: 1.5rem; }
  .login-form-wrapper { max-width: 100%; }
}
</style>
