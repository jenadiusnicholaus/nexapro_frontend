<template>
  <div class="phone-input-wrapper">
    <label v-if="label" class="phone-label">{{ label }}</label>
    <vue-tel-input
      v-model="phoneNumber"
      :default-country="defaultCountry"
      :preferred-countries="preferredCountries"
      :input-options="inputOptions"
      mode="international"
      @validate="handleValidate"
      @on-input="handleInput"
      class="phone-input"
    />
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import "vue-tel-input/vue-tel-input.css";

interface Props {
  modelValue: string;
  label?: string;
  defaultCountry?: string;
  preferredCountries?: string[];
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  defaultCountry: "TZ",
  preferredCountries: () => ["TZ", "KE", "UG", "RW"],
  required: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "valid", isValid: boolean): void;
}>();

const phoneNumber = ref(props.modelValue || "");
const errorMessage = ref("");

const inputOptions = {
  placeholder: "Enter phone number",
  styleClasses: "phone-input-field",
  showDialCode: true,
};

const handleValidate = (validation: any) => {
  if (validation?.valid) {
    errorMessage.value = "";
    emit("valid", true);
  } else {
    if (props.required && !phoneNumber.value) {
      errorMessage.value = "Phone number is required";
    } else if (phoneNumber.value) {
      errorMessage.value = "Please enter a valid phone number";
    }
    emit("valid", false);
  }
};

const handleInput = (phone: string, phoneObject: any) => {
  // Use E.164 format without spaces for API compatibility
  const cleanNumber =
    phoneObject?.e164 ||
    phoneObject?.number?.replace(/\s+/g, "") ||
    phone?.replace(/\s+/g, "") ||
    "";
  phoneNumber.value = cleanNumber;
  emit("update:modelValue", cleanNumber);
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== phoneNumber.value) {
      phoneNumber.value = newVal || "";
    }
  },
);
</script>

<style scoped>
.phone-input-wrapper {
  width: 100%;
  min-height: 60px;
}

.phone-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.phone-input {
  width: 100%;
  display: block !important;
  visibility: visible !important;
}

.phone-input :deep(.vue-tel-input) {
  width: 100%;
  display: flex !important;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  overflow: hidden;
}

.phone-input :deep(.vti__dropdown) {
  background: #ffffff;
  border-right: 1px solid #cbd5e0;
  padding: 0.5rem;
}

.phone-input :deep(.vti__input) {
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  width: 100%;
  flex: 1;
}

.phone-input :deep(.vti__input:focus) {
  outline: none;
  box-shadow: none;
}

.phone-input :deep(.vue-tel-input:focus-within) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-text {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}
</style>
