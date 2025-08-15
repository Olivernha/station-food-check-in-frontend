<template>
  <v-app-bar :color="color" :dark="dark" :height="height" flat :class="headerClass">
    <v-container>
      <v-row align="center" :justify="justify" no-gutters>
        <v-col cols="auto" v-if="showLogo">
          <v-img
            v-if="logoSrc"
            :src="logoSrc"
            :alt="logoAlt"
            :height="logoSize"
            :width="logoSize"
            class="rounded-lg mr-4"
          />
          <v-icon v-else :size="iconSize" class="mr-3">{{ icon }}</v-icon>
        </v-col>
        <v-col>
          <div :class="titleAlignment">
            <h1 :class="titleClass">{{ title }}</h1>
            <p :class="subtitleClass" v-if="subtitle">{{ subtitle }}</p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  color?: string
  dark?: boolean
  height?: number | string
  showLogo?: boolean
  logoSrc?: string
  logoAlt?: string
  logoSize?: number
  icon?: string
  iconSize?: number
  titleClass?: string
  subtitleClass?: string
  headerClass?: string
  justify?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
    | 'stretch'
  titleAlignment?: string
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  dark: true,
  height: 80,
  showLogo: true,
  logoAlt: 'Logo',
  logoSize: 40,
  icon: 'mdi-food',
  iconSize: 32,
  titleClass: 'text-h5 font-weight-semibold text-grey-darken-3',
  subtitleClass: 'text-body-2 text-grey ma-0',
  headerClass: '',
  justify: 'start',
  titleAlignment: '',
})
</script>
