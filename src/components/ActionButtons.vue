<template>
  <div class="mb-4">
    <v-btn
      v-for="button in buttons"
      :key="button.label"
      :color="button.color"
      :class="button.class || 'mr-3'"
      @click="button.action"
    >
      <v-icon v-if="button.icon" start>{{ button.icon }}</v-icon>
      {{ button.label }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
interface Button {
  label: string
  color: string
  action: () => void
  icon?: string
  class?: string
}

interface Props {
  buttons: Button[]
}

defineProps<Props>()
</script>
