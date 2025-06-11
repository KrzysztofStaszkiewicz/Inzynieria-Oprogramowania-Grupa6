<template>
  <div class="error">
    <span class="error__text">{{ props.text }}</span>
    <i @click="hide_error" class="fa-solid fa-xmark"></i>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';

const props = defineProps<{
  text: string;
}>();

console.log(props.text)

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function hide_error() {
  emit('close');
}
</script>