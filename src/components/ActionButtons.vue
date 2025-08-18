<template>
  <div class="mb-4">
    <v-btn
      v-for="(button, index) in buttons"
      :key="button.label"
      :color="button.color"
      :variant="button.variant || 'outlined'"
      :size="button.size || 'default'"
      :class="index < buttons.length - 1 ? 'mr-3' : ''"
      @click="button.action"
    >
      <v-icon v-if="button.icon" start :size="18">{{ button.icon }}</v-icon>
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
  variant?: string
  size?: string
}

interface Props {
  buttons: Button[]
}

defineProps<Props>()
</script>
