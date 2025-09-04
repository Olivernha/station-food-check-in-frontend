<template>
  <v-empty-state
    headline="Whoops, 404"
    title="Page not found"
    text="The page you were looking for does not exist"
    :image="tuaslogo"
    
  ></v-empty-state>
</template>
<script setup lang="ts">
import tuaslogo from '@/assets/img/tuaslogo.png'
</script>
