<template>
  <li class="main-offers-list-option">
    <div class="main-offers-list-option__image">
      <img :src="image_src" :alt="image_alt">
    </div>
    <div class="main-offers-list-option-content">
      <div class="main-offers-list-option-content-name">
        <span class="main-offers-list-option-content-name__text">{{ name }}</span>
      </div>
      <div class="main-offers-list-option-content-price">
        <span class="main-offers-list-option-content-price__text">{{ price }}</span>
      </div>
      <div v-if="discount > 0" class="main-offers-list-option-content-discount">
        <span class="main-offers-list-option-content-discount__text">{{ Math.floor(price - price * discount / 100) }}</span>
      </div>
      <button class="main-offers-list-option-content-button">
        <span class="main-offers-list-option-content-button__text">Złóż rezerwację</span>
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from 'vue'
import fallback_image from '../assets/fallback.png'

interface Offer{
  name: string;
  price: number;
  discount: number;
}

const props = defineProps<Offer>();

const image_src = ref<string>('');
const image_alt = computed(() => `${props.name} Image`);

onMounted(async () => {
  try{
    const image = await import(`../assets/places/${props.name.toLowerCase()}.png`);
    image_src.value = image.default;
  } catch (err){
    console.warn(`Could not find image: ${props.name.toLowerCase()}.png`);
    image_src.value = fallback_image;
  }
})
</script>