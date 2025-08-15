<template>
  <v-card :elevation="elevation" :rounded="rounded" :class="cardClass">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon v-if="icon" class="mr-2" :color="iconColor" :size="iconSize">{{ icon }}</v-icon>
      <span :class="titleClass">{{ title }}</span>
    </v-card-title>
    <v-card-text class="pa-4">
      <slot name="content">
        <!-- Date Input -->
        <v-text-field
          v-if="type === 'date'"
          :model-value="modelValue"
          type="date"
          variant="outlined"
          density="compact"
          hide-details
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
            class="mb-1"
            :color="checkboxColor"
            @update:model-value="$emit('update:selectedOptions', $event)"
          />
        </div>
      </slot>

      <!-- Action Buttons -->
      <v-row v-if="showActions" no-gutters :class="actionsClass">
        <v-col v-for="action in actions" :key="action.label" :cols="actionCols">
          <v-btn
            :variant="action.variant || 'outlined'"
            :size="action.size || 'small'"
            :block="action.block !== false"
            :color="action.color"
            @click="action.action"
          >
            {{ action.label }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Action {
  label: string
  action: () => void
  variant?: string
  size?: string
  color?: string
  block?: boolean
}

interface Props {
  title: string
  type: 'date' | 'checkbox' | 'custom'
  icon?: string
  iconColor?: string
  iconSize?: number
  modelValue?: string
  options?: string[]
  selectedOptions?: string[]
  actions?: Action[]
  showActions?: boolean
  elevation?: number | string
  rounded?: string
  cardClass?: string
  titleClass?: string
  checkboxContainerClass?: string
  checkboxColor?: string
  actionsClass?: string
  actionCols?: number | string
}

withDefaults(defineProps<Props>(), {
  iconSize: 20,
  iconColor: 'blue',
  elevation: 2,
  rounded: 'lg',
  cardClass: 'mb-4',
  titleClass: 'text-h6',
  checkboxContainerClass: 'filter-list mb-4',
  checkboxColor: 'blue',
  actionsClass: 'ga-2',
  actionCols: 12,
  showActions: true,
})

defineEmits<{
  'update:modelValue': [value: string]
  'update:selectedOptions': [value: string[]]
}>()
</script>

<style scoped>
.filter-list {
  max-height: 300px;
  overflow-y: auto;
}

/* Custom scrollbar for filter list */
.filter-list::-webkit-scrollbar {
  width: 6px;
}

.filter-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.filter-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.filter-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
