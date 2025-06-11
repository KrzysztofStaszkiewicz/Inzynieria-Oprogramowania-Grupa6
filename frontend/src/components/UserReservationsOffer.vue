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
    <div class="reservations-list-option-info">
      <button @click="cancel_reservation" class="reservations-list-option-info-button">
        <span class="reservations-list-option-info-button__text">Anuluj rezerwację</span>
      </button>
      <div class="reservations-list-option-info-details">
        <a :href="`/offer/${props.offer_id}`" class="reservations-list-option-info-details__text">Zobacz Szczegóły</a>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from 'vue'
import fallback_image from '../assets/fallback.png'

const emit = defineEmits<{
  (e: 'cancelled', offer_id: number): void;
}>();

interface Offer{
  offer_id: number;
  customer_id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
}

const props = defineProps<Offer>();

const image_src = ref<string>('');
const image_alt = computed(() => `${props.name} Image`);

// Anulowanie rezerwacji
async function cancel_reservation(){
  console.log(props.customer_id, props.offer_id);
  
  try {
    const response = await fetch(`http://localhost:6969/user/reservation/delete/${props.customer_id}/${props.offer_id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Błąd odpowiedzi z serwera");
    }

    emit('cancelled', props.offer_id);
  } catch (err) {
    console.error("Błąd podczas anulowania rezerwacji:", err);
  }
}

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