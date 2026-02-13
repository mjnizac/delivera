<script setup>
import { ref, onMounted } from 'vue'
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
const { validate, required, minLength, passwordStrength, firstError } = useValidation()

const profile = ref(null)
const editing = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
})

const changingPassword = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
})

async function fetchProfile() {
  error.value = ''
  try {
    const response = await api.get('/user/profile')
    if (response.ok) {
      profile.value = await response.json()
      auth.setUser(profile.value)
      form.value.firstName = profile.value.firstName || ''
      form.value.lastName = profile.value.lastName || ''
      form.value.phone = profile.value.phone || ''
    }
  } catch {
    error.value = t('error.connection')
  }
}

function startEditing() {
  editing.value = true
  success.value = ''
}

function cancelEditing() {
  editing.value = false
  error.value = ''
  form.value.firstName = profile.value.firstName || ''
  form.value.lastName = profile.value.lastName || ''
  form.value.phone = profile.value.phone || ''
}

async function saveProfile() {
  error.value = ''
  success.value = ''

  try {
    const response = await api.put('/user/profile', form.value)
    if (response.ok) {
      profile.value = await response.json()
      auth.setUser(profile.value)
      editing.value = false
      success.value = t('profile.updated')
    } else {
      const data = await response.json()
      error.value = api.translateError(data, 'error.saveFailed')
    }
  } catch {
    error.value = t('error.connection')
  }
}

function startChangingPassword() {
  changingPassword.value = true
  success.value = ''
  error.value = ''
  passwordForm.value = { currentPassword: '', newPassword: '' }
}

function cancelChangingPassword() {
  changingPassword.value = false
  error.value = ''
}

async function savePassword() {
  error.value = ''
  success.value = ''

  const valid = validate({
    currentPassword: [required(passwordForm.value.currentPassword, 'currentPassword')],
    newPassword: [
      required(passwordForm.value.newPassword, 'newPassword'),
      minLength(passwordForm.value.newPassword, 8, 'newPassword'),
      passwordStrength(passwordForm.value.newPassword),
    ],
  })
  if (!valid) {
    error.value = firstError()
    return
  }

  try {
    const response = await api.put('/user/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    if (response.ok) {
      changingPassword.value = false
      success.value = t('profile.passwordChanged')
    } else {
      const data = await response.json()
      error.value = api.translateError(data, 'error.passwordChangeFailed')
    }
  } catch {
    error.value = t('error.connection')
  }
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

onMounted(fetchProfile)
</script>

<template>
  <BaseLayout>
    <div v-if="profile" class="card">
      <h1>{{ t('profile.title') }}</h1>

      <p v-if="success" class="msg-success">{{ success }}</p>
      <p v-if="error" class="msg-error">{{ error }}</p>

      <!-- Modo vista -->
      <div v-if="!editing" class="fields">
        <div class="field">
          <span class="field-label">{{ t('fields.email') }}</span>
          <span class="field-value">{{ profile.email }}</span>
        </div>
        <div class="field">
          <span class="field-label">{{ t('fields.firstName') }}</span>
          <span class="field-value">{{ profile.firstName || t('fields.empty') }}</span>
        </div>
        <div class="field">
          <span class="field-label">{{ t('fields.lastName') }}</span>
          <span class="field-value">{{ profile.lastName || t('fields.empty') }}</span>
        </div>
        <div class="field">
          <span class="field-label">{{ t('fields.phone') }}</span>
          <span class="field-value">{{ profile.phone || t('fields.empty') }}</span>
        </div>
        <button class="btn" @click="startEditing">{{ t('profile.edit') }}</button>
      </div>

      <!-- Modo edición -->
      <form v-else @submit.prevent="saveProfile">
        <div class="field">
          <span class="field-label">{{ t('fields.email') }}</span>
          <span class="field-value">{{ profile.email }}</span>
        </div>
        <input v-model="form.firstName" class="form-input" type="text" :placeholder="t('fields.firstName')" maxlength="100" />
        <input v-model="form.lastName" class="form-input" type="text" :placeholder="t('fields.lastName')" maxlength="100" />
        <input v-model="form.phone" class="form-input" type="tel" :placeholder="t('fields.phone')" maxlength="20" />
        <div class="actions">
          <button type="submit" class="btn">{{ t('profile.save') }}</button>
          <button type="button" class="btn btn-secondary" @click="cancelEditing">{{ t('profile.cancel') }}</button>
        </div>
      </form>

      <!-- Cambiar contraseña -->
      <div v-if="changingPassword" class="password-section">
        <h2>{{ t('profile.changePassword') }}</h2>
        <form @submit.prevent="savePassword">
          <input
            v-model="passwordForm.currentPassword"
            class="form-input"
            type="password"
            :placeholder="t('fields.currentPassword')"
            required
          />
          <input
            v-model="passwordForm.newPassword"
            class="form-input"
            type="password"
            :placeholder="t('fields.newPassword')"
            minlength="8"
            required
          />
          <div class="actions">
            <button type="submit" class="btn">{{ t('profile.save') }}</button>
            <button type="button" class="btn btn-secondary" @click="cancelChangingPassword">{{ t('profile.cancel') }}</button>
          </div>
        </form>
      </div>
      <button v-else-if="!editing" class="btn btn-outline" style="margin-top: 16px" @click="startChangingPassword">
        {{ t('profile.changePassword') }}
      </button>

      <button class="btn btn-danger" style="margin-top: 24px" @click="handleLogout">{{ t('auth.logout') }}</button>
    </div>
  </BaseLayout>
</template>

<style scoped>
.fields {
  text-align: left;
}
</style>
