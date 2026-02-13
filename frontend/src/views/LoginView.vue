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
const { validate, required, email: emailRule, firstError } = useValidation()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''

  const valid = validate({
    email: [required(email.value, 'email'), emailRule(email.value)],
    password: [required(password.value, 'password')],
  })
  if (!valid) {
    error.value = firstError()
    return
  }

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })
    if (response.ok) {
      const data = await response.json()
      auth.setToken(data.token)
      router.push('/profile')
    } else {
      const data = await response.json()
      error.value = api.translateError(data, 'error.invalidCredentials')
    }
  } catch {
    error.value = t('error.connection')
  }
}
</script>

<template>
  <BaseLayout>
    <form class="card" @submit.prevent="handleLogin">
      <h1>{{ t('app.name') }}</h1>
      <input v-model="email" class="form-input" type="email" :placeholder="t('fields.email')" required />
      <input v-model="password" class="form-input" type="password" :placeholder="t('fields.password')" required />
      <p v-if="error" class="msg-error">{{ error }}</p>
      <button class="btn" type="submit">{{ t('auth.login') }}</button>
      <p class="form-link">{{ t('auth.noAccount') }} <router-link to="/register">{{ t('auth.signUp') }}</router-link></p>
    </form>
  </BaseLayout>
</template>

