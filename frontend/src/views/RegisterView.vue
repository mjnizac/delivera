<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { useValidation } from '@/composables/useValidation'
import BaseLayout from '@/components/BaseLayout.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const api = useApi()
const { validate, required, email: emailRule, minLength, match, passwordStrength, firstError } = useValidation()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

async function handleRegister() {
  error.value = ''

  const valid = validate({
    email: [required(email.value, 'email'), emailRule(email.value)],
    password: [required(password.value, 'password'), minLength(password.value, 8, 'password'), passwordStrength(password.value)],
    confirmPassword: [match(password.value, confirmPassword.value)],
  })
  if (!valid) {
    error.value = firstError()
    return
  }

  try {
    const response = await api.post('/auth/register', {
      email: email.value,
      password: password.value,
    })
    const data = await response.json()
    if (response.ok) {
      auth.setToken(data.token)
      router.push('/profile')
    } else {
      error.value = api.translateError(data, 'error.registerFailed')
    }
  } catch {
    error.value = t('error.connection')
  }
}
</script>

<template>
  <BaseLayout>
    <form class="card" @submit.prevent="handleRegister">
      <h1>{{ t('app.name') }}</h1>
      <p class="subtitle">{{ t('auth.createAccount') }}</p>
      <input v-model="email" class="form-input" type="email" :placeholder="t('fields.email')" required />
      <input v-model="password" class="form-input" type="password" :placeholder="t('fields.password')" minlength="8" required />
      <input
        v-model="confirmPassword"
        class="form-input"
        type="password"
        :placeholder="t('fields.confirmPassword')"
        minlength="8"
        required
      />
      <p v-if="error" class="msg-error">{{ error }}</p>
      <button class="btn" type="submit">{{ t('auth.register') }}</button>
      <p class="form-link">{{ t('auth.hasAccount') }} <router-link to="/">{{ t('auth.signIn') }}</router-link></p>
    </form>
  </BaseLayout>
</template>

