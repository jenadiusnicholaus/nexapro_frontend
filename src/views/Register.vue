<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="register-logo">
            <img src="/images/transparent_longo.png" alt="NexaPro" class="register-logo-img" />
          </div>
          <h1 class="register-title">{{ t('auth.registerOwner') }}</h1>
          <p class="register-subtitle">{{ t('auth.joinAndStart') }}</p>
        </div>

        <VaAlert v-if="errorMessage" color="danger" class="mb-4">{{ errorMessage }}</VaAlert>

        <!-- Step 1: Phone Number -->
        <div v-if="step === 1" class="step-container">
          <div class="step-indicator">
            <div class="step-badge active">1</div>
            <div class="step-line"></div>
            <div class="step-badge">2</div>
            <div class="step-line"></div>
            <div class="step-badge">3</div>
          </div>

          <VaForm ref="phoneForm" @submit.prevent="requestToken">
            <div class="form-section">
              <h3 class="form-section-title">{{ t('auth.enterPhone') }}</h3>
              <p class="form-section-desc">{{ t('auth.sendCodeSms') }}</p>

              <PhoneInput v-model="phone" :label="t('auth.phoneNumber')" :required="true" class="mb-4" />

              <p class="helper-text">
                <VaIcon name="info" size="small" />
                {{ t('auth.sendCodeToNumber') }}
              </p>

              <VaButton type="submit" class="submit-button" :loading="loading" block>
                {{ t('auth.sendVerificationCode') }}
                <VaIcon name="arrow_forward" size="small" />
              </VaButton>

              <div class="login-link">
                {{ t('auth.alreadyHaveAccount') }}
                <router-link to="/auth/login">{{ t('auth.loginHere') }}</router-link>
              </div>
            </div>
          </VaForm>
        </div>

        <!-- Step 2: Verification Code -->
        <div v-if="step === 2" class="step-container">
          <div class="step-indicator">
            <div class="step-badge completed"><VaIcon name="check" size="small" /></div>
            <div class="step-line active"></div>
            <div class="step-badge active">2</div>
            <div class="step-line"></div>
            <div class="step-badge">3</div>
          </div>

          <VaForm ref="verificationForm" @submit.prevent="verifyToken">
            <div class="form-section">
              <div class="verification-info">
                <VaIcon name="sms" size="large" color="#34d399" />
                <p class="verification-text">
                  {{ t('auth.codeSentTo') }} <strong>{{ phone }}</strong>
                </p>
                <div v-if="expiresIn > 0" class="timer">
                  <VaIcon name="schedule" size="small" />
                  {{ t('auth.expiresIn') }} {{ formatTime(expiresIn) }}
                </div>
                <div v-else class="expired-warning">
                  <VaIcon name="warning" size="small" />
                  {{ t('auth.codeExpired') }}
                </div>
              </div>

              <VaInput
                v-model="token" :label="t('auth.verificationCode')" placeholder="123456"
                :rules="[(v) => !!v || 'Verification code is required', (v) => /^[0-9]{6}$/.test(v) || 'Must be 6 digits']"
                maxlength="6" class="mb-4"
              >
                <template #prepend><VaIcon name="lock" /></template>
              </VaInput>

              <div class="button-group">
                <VaButton preset="secondary" @click="goBack" :disabled="loading" class="btn-back">{{ t('auth.back') }}</VaButton>
                <VaButton type="submit" :loading="loading" :disabled="expiresIn <= 0" class="btn-verify">{{ t('auth.verifyCode') }}</VaButton>
              </div>

              <VaButton preset="plain" @click="resendCode" :disabled="expiresIn > 0 || loading" class="resend-button" block>
                <VaIcon name="refresh" class="mr-2" /> {{ t('auth.resendCode') }}
              </VaButton>
            </div>
          </VaForm>
        </div>

        <!-- Step 3: Owner Details & Password -->
        <div v-if="step === 3" class="step-container">
          <div class="step-indicator">
            <div class="step-badge completed"><VaIcon name="check" size="small" /></div>
            <div class="step-line completed"></div>
            <div class="step-badge completed"><VaIcon name="check" size="small" /></div>
            <div class="step-line active"></div>
            <div class="step-badge active">3</div>
          </div>

          <VaForm ref="registerForm" @submit.prevent="completeRegistration">
            <div class="form-section">
              <VaDivider class="mb-4"><span class="divider-text">{{ t('auth.ownerDetails') }}</span></VaDivider>

              <VaInput v-model="formData.name" :label="t('auth.fullNameCompany')" placeholder="John Doe"
                :rules="[(v) => !!v || 'Name is required']" class="mb-4">
                <template #prepend><VaIcon name="person" /></template>
              </VaInput>

              <VaInput v-model="formData.email" :label="t('auth.emailOptional')" placeholder="john@example.com"
                type="email" class="mb-4">
                <template #prepend><VaIcon name="email" /></template>
              </VaInput>

              <VaDivider class="my-4"><span class="divider-text">{{ t('auth.password') }}</span></VaDivider>

              <VaInput v-model="formData.password" :label="t('auth.password')" placeholder="Create a secure password"
                type="password" :rules="[
                  (v) => !!v || 'Password is required',
                  (v) => v.length >= 8 || 'Password must be at least 8 characters',
                  (v) => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
                  (v) => /[a-z]/.test(v) || 'Must contain a lowercase letter',
                  (v) => /[0-9]/.test(v) || 'Must contain a number',
                ]" class="mb-4">
                <template #prepend><VaIcon name="lock" /></template>
              </VaInput>

              <VaInput v-model="formData.password_confirm" :label="t('auth.confirmPassword')" placeholder="Re-enter your password"
                type="password" :rules="[
                  (v) => !!v || 'Please confirm your password',
                  (v) => v === formData.password || 'Passwords do not match',
                ]" class="mb-4">
                <template #prepend><VaIcon name="lock" /></template>
              </VaInput>

              <VaDivider class="my-4"><span class="divider-text">{{ t('auth.addressOptional') }}</span></VaDivider>

              <VaSelect v-model="formData.owner_type" :label="t('auth.ownerType')" :options="ownerTypeOptions" class="mb-4">
                <template #prepend><VaIcon name="business" /></template>
              </VaSelect>

              <VaInput v-if="formData.owner_type === 'company'" v-model="formData.contact_person"
                :label="t('auth.contactPerson')" placeholder="Contact person name" class="mb-4">
                <template #prepend><VaIcon name="badge" /></template>
              </VaInput>

              <VaTextarea v-model="formData.address" :label="t('auth.addressOptional')"
                placeholder="123 Main Street, Dar es Salaam" :min-rows="2" :max-rows="4" class="mb-4">
                <template #prepend><VaIcon name="location_on" /></template>
              </VaTextarea>

              <div class="button-group">
                <VaButton preset="secondary" @click="step = 2" :disabled="loading" class="btn-back">{{ t('auth.back') }}</VaButton>
                <VaButton type="submit" :loading="loading" class="btn-verify">{{ t('auth.completeRegistration') }}</VaButton>
              </div>
            </div>
          </VaForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";
import axios from "axios";
import PhoneInput from "@/components/PhoneInput.vue";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { success, error } = useAppToast();
const { t } = useI18n({ useScope: 'global' });

const step = ref(1);
const phone = ref("");
const token = ref("");
const loading = ref(false);
const errorMessage = ref("");
const expiresIn = ref(600);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const formData = ref({
  name: "",
  email: "",
  password: "",
  password_confirm: "",
  owner_type: "individual",
  address: "",
  contact_person: "",
});

const ownerTypeOptions = [
  { value: "individual", text: "Individual" },
  { value: "company", text: "Company" },
];

const phoneForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const registerForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://nexaproapi.quantumvision-tech.com/api/v1";

const requestToken = async () => {
  if (!phoneForm.value) return;
  const isValid = await phoneForm.value.validate();
  if (!isValid) return;
  errorMessage.value = "";
  loading.value = true;
  try {
    const response = await axios.post(`${API_BASE}/owners/register/request-token/`, { phone: phone.value });
    if (response.data.success) {
      success("Verification code sent to your phone!");
      step.value = 2;
      expiresIn.value = response.data.expires_in || 600;
      startCountdown();
    } else { errorMessage.value = response.data.message; }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || "Failed to send verification code. Please try again.";
  } finally { loading.value = false; }
};

const verificationForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const verifyToken = async () => {
  if (!verificationForm.value) return;
  const isValid = await verificationForm.value.validate();
  if (!isValid) return;
  errorMessage.value = "";
  loading.value = true;
  try {
    const response = await axios.post(`${API_BASE}/owners/register/verify-token/`, { phone: phone.value, token: token.value });
    if (response.data.success) {
      success("Code verified! Please complete your registration.");
      step.value = 3;
    } else { errorMessage.value = response.data.message || "Invalid verification code"; }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || "Verification failed. Please try again.";
  } finally { loading.value = false; }
};

const completeRegistration = async () => {
  if (!registerForm.value) return;
  const isValid = await registerForm.value.validate();
  if (!isValid) return;
  errorMessage.value = "";
  loading.value = true;
  try {
    const { password_confirm, ...registrationData } = formData.value;
    const response = await axios.post(`${API_BASE}/owners/register/verify/`, { phone: phone.value, token: token.value, ...registrationData });
    if (response.data.success) {
      success("Registration successful! You can now login.");
      stopCountdown();
      router.push("/auth/login");
    } else { errorMessage.value = response.data.message; }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || "Registration failed. Please try again.";
  } finally { loading.value = false; }
};

const startCountdown = () => { stopCountdown(); countdownInterval = setInterval(() => { expiresIn.value > 0 ? expiresIn.value-- : stopCountdown(); }, 1000); };
const stopCountdown = () => { if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; } };
const formatTime = (seconds: number): string => { const m = Math.floor(seconds / 60); return `${m}:${(seconds % 60).toString().padStart(2, "0")}`; };
const goBack = () => { step.value = 1; token.value = ""; errorMessage.value = ""; stopCountdown(); };
const resendCode = async () => { token.value = ""; errorMessage.value = ""; expiresIn.value = 0; stopCountdown(); await requestToken(); };
onUnmounted(() => { stopCountdown(); });
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #050816 0%, #0a1628 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
.register-container { width: 100%; max-width: 580px; }
.register-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px;
  box-shadow: 0 20px 80px rgba(0,0,0,.5);
  padding: 2.5rem;
  backdrop-filter: blur(20px);
}
.register-header { text-align: center; margin-bottom: 2rem; }
.register-logo { margin-bottom: 1rem; }
.register-logo-img { height: 50px; width: auto; }
.register-title { font-size: 1.75rem; font-weight: 700; color: #f1f5f9; margin-bottom: .4rem; }
.register-subtitle { color: #64748b; font-size: .95rem; }

/* Steps */
.step-indicator { display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
.step-badge {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  color: #64748b; display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 1rem; transition: all .3s;
}
.step-badge.active { background: #22c55e; border-color: #22c55e; color: #fff; box-shadow: 0 0 20px rgba(34,197,94,.4); }
.step-badge.completed { background: #22c55e; border-color: #22c55e; color: #fff; }
.step-line { width: 70px; height: 3px; background: rgba(255,255,255,.08); margin: 0 .4rem; border-radius: 2px; transition: background .3s; }
.step-line.active { background: #22c55e; }
.step-line.completed { background: #22c55e; }

.form-section { margin-top: 1rem; }
.form-section-title { font-size: 1.15rem; font-weight: 600; color: #f1f5f9; margin-bottom: .35rem; }
.form-section-desc { color: #64748b; margin-bottom: 1.25rem; font-size: .9rem; }
.helper-text { display: flex; align-items: center; gap: .4rem; color: #64748b; font-size: .82rem; margin-bottom: 1.25rem; }

.submit-button {
  margin-bottom: 1rem;
  background: #22c55e !important; border: none !important; font-weight: 600 !important;
  border-radius: 12px !important; box-shadow: 0 4px 20px rgba(34,197,94,.35) !important;
  display: flex !important; align-items: center !important; gap: .5rem !important;
}
.submit-button:hover { background: #16a34a !important; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(34,197,94,.5) !important; }

.btn-back { border-radius: 12px !important; background: rgba(255,255,255,.06) !important; border: 1px solid rgba(255,255,255,.1) !important; color: #94a3b8 !important; }
.btn-verify { border-radius: 12px !important; background: #22c55e !important; border: none !important; font-weight: 600 !important; box-shadow: 0 4px 20px rgba(34,197,94,.35) !important; }
.btn-verify:hover { background: #16a34a !important; }

.login-link { text-align: center; color: #64748b; font-size: .85rem; margin-top: .75rem; }
.login-link a { color: #22c55e; font-weight: 600; text-decoration: none; }
.login-link a:hover { color: #86efac; text-decoration: underline; }

.verification-info {
  background: rgba(34,197,94,.08); padding: 1.25rem; border-radius: 14px;
  text-align: center; margin-bottom: 1.25rem; border: 1px solid rgba(34,197,94,.15);
}
.verification-text { margin: .5rem 0; color: #86efac; font-size: .9rem; }
.timer { display: flex; align-items: center; justify-content: center; gap: .4rem; color: #22c55e; font-weight: 600; margin-top: .4rem; }
.expired-warning { display: flex; align-items: center; justify-content: center; gap: .4rem; color: #f87171; font-weight: 600; margin-top: .4rem; }

.divider-text { color: #64748b; font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.button-group { display: grid; grid-template-columns: 1fr 2fr; gap: .75rem; margin-bottom: .75rem; }
.resend-button { margin-top: .4rem; color: #22c55e !important; }
.resend-button:disabled { opacity: .4; }

.mb-4 { margin-bottom: 1rem; }
.my-4 { margin-top: 1rem; margin-bottom: 1rem; }
.mr-2 { margin-right: .5rem; }

@media (max-width: 640px) {
  .register-page { padding: .75rem; }
  .register-card { padding: 1.75rem 1.25rem; border-radius: 16px; }
  .register-title { font-size: 1.4rem; }
  .button-group { grid-template-columns: 1fr; }
  .step-line { width: 40px; }
  .step-badge { width: 36px; height: 36px; font-size: .9rem; }
}
</style>
