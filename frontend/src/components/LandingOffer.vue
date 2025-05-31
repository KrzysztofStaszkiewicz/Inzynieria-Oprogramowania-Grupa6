<template>
  <li class="main-offers-list-option">{{ name }}</li>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Offer{
  name: string;
  price: number;
  discount: number;
}

const props = defineProps<Offer>();
</script>