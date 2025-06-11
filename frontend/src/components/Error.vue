<template>
  <div class="error message">
    <span class="error__text">{{ props.text }}</span>
    <i @click="hide_error" class="fa-solid fa-xmark"></i>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';

const props = defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function hide_error() {
  emit('close');
}
</script>