import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// TODO: Se mejorará esto a un sistema basado en cookies
export const useAuthStore = defineStore('auth', () => {
  // Se almacena el token en la sesión al hacer login/register
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)

  // Devuelve el estado del token
  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  function setUser(profile) {
    user.value = profile
  }

  return { token, user, isAuthenticated, setToken, setUser, logout }
})
