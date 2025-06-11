<template>
  <li class="reservations-list-option">
    <div class="reservations-list-option__image">
      <img :src="image_src" :alt="image_alt">
    </div>
    <div class="reservations-list-option-content">
      <div class="reservations-list-option-content-title">
        <span class="reservations-list-option-content-title">{{ name }}</span>
      </div>
      <div class="reservations-list-option-content-description">
        <span class="reservations-list-option-content-description__text">{{ description }}</span>
      </div>
    </div>
    <div class="reservations-list-option-cost">
      <div class="reservations-list-option-cost-discount">
        <span class="reservations-list-option-cost-discount__text">{{ Math.floor(price - price * discount / 100) }}</span>
      </div>
      <div class="reservations-list-option-cost-price">
        <span class="reservations-list-option-cost-price__text">{{ price }}</span>
      </div>
    </div>
    <div class="reservations-list-option-submit">
      <router-link :to="`/offer/${id}`" class="reservations-list-option-submit-button">
        <span class="reservations-list-option-submit-button__text">Złóż rezerwację</span>
      </router-link>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from 'vue'
import fallback_image from '../assets/fallback.png'

interface Offer{
  id: number;
  name: string;
  description: string;
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