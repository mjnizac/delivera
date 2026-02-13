<script setup>
import { useI18n } from 'vue-i18n'
import BaseLayout from '@/components/BaseLayout.vue'

const { t } = useI18n()
</script>

<template>
  <BaseLayout>
    <div class="card">
      <h1>404</h1>
      <p class="subtitle">{{ t('notFound.message') }}</p>
      <router-link to="/" class="btn">{{ t('notFound.goHome') }}</router-link>
    </div>
  </BaseLayout>
</template>
