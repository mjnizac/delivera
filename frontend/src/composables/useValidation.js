import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useValidation() {
  const { t } = useI18n()
  const errors = ref({})

  // Valida el conjunto de reglas y almacena los errores
  function validate(rules) {
    errors.value = {}
    let valid = true

    for (const [field, checks] of Object.entries(rules)) {
      for (const check of checks) {
        const error = check()
        if (error) {
          errors.value[field] = error
          valid = false
          break
        }
      }
    }

    return valid
  }

  // Comprobación que el campo no esté vacío
  function required(value, fieldKey) {
    return () => {
      if (!value || !value.toString().trim()) {
        return t('validation.required', { field: t(`fields.${fieldKey}`) })
      }
      return null
    }
  }

  // Valida el formato de email con regex (ej: usuario@gmail.com)
  function email(value) {
    return () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (value && !regex.test(value)) {
        return t('validation.email')
      }
      return null
    }
  }

  // Mínimo de caracteres (ej: contraseña >= 8)
  function minLength(value, min, fieldKey) {
    return () => {
      if (value && value.length < min) {
        return t('validation.minLength', { field: t(`fields.${fieldKey}`), min })
      }
      return null
    }
  }

  // Compara dos valores (por ejemplo dos contraseñas)
  function match(value1, value2) {
    return () => {
      if (value1 !== value2) {
        return t('validation.passwordsDoNotMatch')
      }
      return null
    }
  }

  // Valida que la contraseña tenga minúscula, mayúscula y número
  function passwordStrength(value) {
    return () => {
      if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(value)) {
        return t('validation.passwordStrength')
      }
      return null
    }
  }

  // Devuelve el primer error de la lista almacenada de errores
  function firstError() {
    const keys = Object.keys(errors.value)
    return keys.length > 0 ? errors.value[keys[0]] : ''
  }

  // TODO: Se podrían crear más reglas customizadas

  return { errors, validate, required, email, minLength, match, passwordStrength, firstError }
}
