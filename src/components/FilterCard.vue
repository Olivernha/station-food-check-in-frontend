<template>
  <v-card :elevation="elevation" rounded="lg" color="white" :class="cardClass">
    <v-card-title class="d-flex align-center pa-3 pb-2">
      <v-icon v-if="icon" class="mr-2" :color="iconColor" :size="18">{{ icon }}</v-icon>
      <span :class="titleClass">{{ title }}</span>
    </v-card-title>

    <v-card-text class="pa-3 pt-1">
      <!-- Date Input -->
      <v-text-field
        v-if="type === 'date'"
        :model-value="modelValue"
        type="date"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3"
        @update:model-value="$emit('update:modelValue', $event)"
      />

      <!-- Checkbox List -->
      <div v-else-if="type === 'checkbox'" :class="checkboxContainerClass">
        <v-checkbox
          v-for="option in options"
          :key="option"
          :model-value="selectedOptions"
          :value="option"
          :label="option"
          density="compact"
          hide-details
          class="mb-1 text-body-2"
          :color="checkboxColor"
          @update:model-value="$emit('update:selectedOptions', $event || [])"
        />
      </div>

      <!-- Action Buttons -->
      <div v-if="showActions && actions" class="mt-3">
        <v-btn
          v-for="action in actions"
          :key="action.label"
          :variant="action.variant || 'outlined'"
          :size="'small'"
          :block="action.block !== false"
          :color="action.color"
          :class="'mb-2'"
          @click="action.action"
        >
          {{ action.label }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Action {
  label: string
  action: () => void
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  size?: string
  color?: string
  block?: boolean
}

interface Props {
  title: string
  type: 'date' | 'checkbox' | 'custom'
  icon?: string
  iconColor?: string
  modelValue?: string
  options?: string[]
  selectedOptions?: string[]
  actions?: Action[]
  showActions?: boolean
  elevation?: number | string
  cardClass?: string
  titleClass?: string
  checkboxContainerClass?: string
  checkboxColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'blue-grey-darken-1',
  elevation: 0,
  cardClass: 'mb-4',
  titleClass: 'text-subtitle-1 font-weight-medium text-grey-darken-2',
  checkboxContainerClass: 'filter-list',
  checkboxColor: 'blue-grey-darken-1',
  showActions: true,
})

defineEmits<{
  'update:modelValue': [value: string]
  'update:selectedOptions': [value: string[]]
}>()
</script>

<style scoped>
.filter-list {
  max-height: 280px;
  overflow-y: auto;
}

.filter-list::-webkit-scrollbar {
  width: 4px;
}

.filter-list::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.filter-list::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 2px;
}

.filter-list::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

/* Match the exact checkbox styling from the image */
:deep(.v-selection-control__wrapper) {
  margin-right: 8px;
}

:deep(.v-label) {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
