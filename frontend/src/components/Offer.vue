<template>
  <div v-if="offer" class="offer">
    <div class="offer__image">
      <img :src="image_src" :alt="image_alt">
    </div>
    <div class="offer-title">
      <span class="offer-title__text">{{ offer.name }} - {{ offer.title }}</span>
    </div>
    <div class="offer-content">
      <div class="offer-content-description">
        <span class="offer-content-description__text">{{ descriptions[0] }}</span>
      </div>
      <div class="offer-content-advantages">
        Podczas wycieczki:
        <ul class="offer-content-advantages-list">
          <li v-for="advantage in advantages" :key="advantage" class="offer-content-advantages-list-option">
            <span class="offer-content-advantages-list-option__text">{{ advantage }}</span>
          </li>
        </ul>
      </div>
      <div class="offer-content-finish">
        <span class="offer-content-finish__text">{{ descriptions[1] }}</span>
      </div>
    </div>
    <div class="offer-slots">
      <span class="offer-slots__text">Liczba Pozostałych Miejsc: {{ offer.remaining_slots }}</span>
    </div>
    <div class="offer-info">
      <div class="offer-info-price">
        <span v-if="offer.discount > 0" class="offer-info-price__text">{{ Math.floor(offer.price - offer.price * offer.discount / 100) }}</span>
        <span v-else class="offer-into-price__text">{{ offer.price }}</span>
      </div>
      <button v-if="!is_reserved" class="offer-info-button">
        <span class="offer-info-button__text">Zarezerwuj</span>
      </button>
      <button v-else class="offer-info-button">
        <span class="offer-info-button__text">Anuluj Rezerwację</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import fallback_image from '../assets/fallback.png'

interface Offer{
  id: number;
  name: string;
  price: number;
  discount: number;
  remaining_slots: number;
  title: string;
  description: string;
  advantages: string;
}

const image_src = ref<string>('');
const image_alt = ref<string>('');

const route = useRoute();
const offer = ref<Offer>();
const descriptions = ref<string[]>([]);
const advantages = ref<string[]>([]);

const is_reserved = ref<boolean>(false);

async function get_offer(){
  try{
    const id = route.params.id;
    const response = await fetch(`http://localhost:6969/offers/full/get/${id}`);
    const data = await response.json();
    offer.value = data[0];

    if(!offer.value){
      console.error("Nie znaleziono oferty.");
      return;
    }

    descriptions.value = offer.value.description.split("//");
    advantages.value = offer.value.advantages.split("//");
  } catch (err){
    console.error("Error: ", err);
  }
}

async function get_image() {
  if(!offer.value) return;

  try{
    const image = await import(`../assets/places/${offer.value.name.toLowerCase()}.png`);
    image_src.value = image.default;
    image_alt.value = offer.value.name + " Image";
  } catch (err){
    console.warn(`Could not find image: ${offer.value.name.toLowerCase()}.png`);
    image_src.value = fallback_image;
  }
}

async function get_reservation_confirm() {
  if(!offer.value) return;

  const user_data_raw = localStorage.getItem("user_data");
  if (!user_data_raw) return;

  const user_data = JSON.parse(user_data_raw);
  const customer_id = user_data.id;

  if(isNaN(customer_id) || customer_id < 0) return;
  
  try{
    const response = await fetch(`http://localhost:6969/user/reservation/confirm/${customer_id}/${offer.value.id}`);
    const data = await response.json();

    is_reserved.value = data.confirmed;
  } catch(err){
    console.error("Error: ", err);
  }
}

onMounted(async () => {
  await get_offer();
  await get_image();
  await get_reservation_confirm();
})
</script>